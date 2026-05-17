// PLACE AT: app/api/conversations/route.ts
// PURPOSE:  Find or create a conversation between two users.
//           Called by "Message Seller" and "Make Offer" buttons.
// USAGE:    POST /api/conversations

import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth/getUser";
import { prisma } from "@/lib/prisma";
import { supabaseMsg, CONV_TABLE, MSG_TABLE } from "@/lib/supabase-messaging";

export async function POST(req: Request) {
  const session = await getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    sellerId,      // User.id of the listing owner
    listingId,     // CarListing.id (optional)
    listingTitle,  // display name
    initialMessage,// optional first message text
    offerAmount,   // if this is a Make Offer flow
  } = await req.json();

  if (!sellerId) {
    return NextResponse.json({ error: "sellerId required" }, { status: 400 });
  }

  if (sellerId === session.userId) {
    return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });
  }

  // Get both users' names
  const [buyer, seller] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId }, select: { fullName: true } }),
    prisma.user.findUnique({ where: { id: sellerId },        select: { fullName: true } }),
  ]);

  // ── Find existing conversation or create new one ──────────────────────────
  // upsert via Supabase — onConflict uses the unique constraint
  const { data: conv, error: convErr } = await supabaseMsg
    .from(CONV_TABLE)
    .upsert(
      {
        listing_id:    listingId    ?? null,
        listing_title: listingTitle ?? null,
        buyer_id:      session.userId,
        seller_id:     sellerId,
        buyer_name:    buyer?.fullName  ?? "Buyer",
        seller_name:   seller?.fullName ?? "Seller",
      },
      {
        onConflict:        "listing_id,buyer_id,seller_id",
        ignoreDuplicates:  false,
      }
    )
    .select()
    .single();

  if (convErr || !conv) {
    console.error("Conversation upsert error:", convErr);
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
  }

  // ── Send initial message if provided ─────────────────────────────────────
  if (initialMessage || offerAmount) {
    const isOffer = !!offerAmount;
    const content = isOffer
      ? `💰 Offer: ₦${Number(offerAmount).toLocaleString()} for ${listingTitle ?? "this listing"}`
      : initialMessage;

    await supabaseMsg.from(MSG_TABLE).insert({
      conversation_id: conv.id,
      sender_id:       session.userId,
      sender_name:     buyer?.fullName ?? "Buyer",
      content,
      type:            isOffer ? "offer" : "text",
      offer_amount:    offerAmount ?? null,
    });

    // Update last_message on conversation
    await supabaseMsg
      .from(CONV_TABLE)
      .update({ last_message: content, last_at: new Date().toISOString() })
      .eq("id", conv.id);
  }

  return NextResponse.json({ success: true, conversationId: conv.id });
}

// GET /api/conversations — list all conversations for the current user
export async function GET(req: Request) {
  const session = await getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseMsg
    .from(CONV_TABLE)
    .select("*")
    .or(`buyer_id.eq.${session.userId},seller_id.eq.${session.userId}`)
    .order("last_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ conversations: data ?? [] });
}