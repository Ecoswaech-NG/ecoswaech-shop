// PLACE AT: app/api/messages/route.ts
// PURPOSE:  Send a message to a conversation, and fetch message history.
// USAGE:    POST /api/messages
//           GET  /api/messages?conversationId=xxx

import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth/getUser";
import { prisma } from "@/lib/prisma";
import { supabaseMsg, CONV_TABLE, MSG_TABLE } from "@/lib/supabase-messaging";

// GET — fetch messages for a conversation
export async function GET(req: Request) {
  const session = await getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const conversationId   = searchParams.get("conversationId");
  if (!conversationId) {
    return NextResponse.json({ error: "conversationId required" }, { status: 400 });
  }

  // Verify user is a participant
  const { data: conv } = await supabaseMsg
    .from(CONV_TABLE)
    .select("buyer_id,seller_id")
    .eq("id", conversationId)
    .single();

  if (!conv || (conv.buyer_id !== session.userId && conv.seller_id !== session.userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: messages, error } = await supabaseMsg
    .from(MSG_TABLE)
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Mark unread messages as read
  await supabaseMsg
    .from(MSG_TABLE)
    .update({ read: true })
    .eq("conversation_id", conversationId)
    .neq("sender_id", session.userId)
    .eq("read", false);

  return NextResponse.json({ messages: messages ?? [] });
}

// POST — send a message
export async function POST(req: Request) {
  const session = await getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { conversationId, content, type = "text", offerAmount } = await req.json();

  if (!conversationId || !content?.trim()) {
    return NextResponse.json({ error: "conversationId and content required" }, { status: 400 });
  }

  // Verify participant
  const { data: conv } = await supabaseMsg
    .from(CONV_TABLE)
    .select("buyer_id,seller_id")
    .eq("id", conversationId)
    .single();

  if (!conv || (conv.buyer_id !== session.userId && conv.seller_id !== session.userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sender = await prisma.user.findUnique({
    where:  { id: session.userId },
    select: { fullName: true },
  });

  const { data: message, error } = await supabaseMsg
    .from(MSG_TABLE)
    .insert({
      conversation_id: conversationId,
      sender_id:       session.userId,
      sender_name:     sender?.fullName ?? "User",
      content:         content.trim(),
      type,
      offer_amount:    offerAmount ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Update conversation last_message
  await supabaseMsg
    .from(CONV_TABLE)
    .update({
      last_message: content.trim(),
      last_at:      new Date().toISOString(),
    })
    .eq("id", conversationId);

  return NextResponse.json({ success: true, message }, { status: 201 });
}