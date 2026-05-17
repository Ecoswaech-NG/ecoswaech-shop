// PLACE AT: components/inbox/Inbox.tsx
// PURPOSE:  Full inbox UI — conversation list on left, chat on right.
//           Replaces the placeholder Inbox from DashComponents.tsx.
//           Import this in app/dashboard/page.tsx for the "inbox" tab.

"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useConversations } from "@/hooks/useConversations";
import { useMessages } from "@/hooks/useMessages";
import type { Conversation } from "@/lib/supabase-messaging";
import { Send, MessageCircle, ArrowLeft } from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m    = Math.floor(diff / 60000);
  if (m < 1)  return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

// ─── ConversationItem ─────────────────────────────────────────────────────────

function ConversationItem({
  conv, isSelected, myId, onClick,
}: {
  conv: Conversation; isSelected: boolean; myId: string; onClick: () => void;
}) {
  const other = conv.buyer_id === myId ? conv.seller_name : conv.buyer_name;
  const initials = other.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors border-l-4 ${
        isSelected
          ? "bg-[#7b2ff2]/10 dark:bg-[#7b2ff2]/20 border-[#7b2ff2]"
          : "border-transparent hover:bg-gray-50 dark:hover:bg-[#2d1e5f]/30"
      }`}
    >
      <div className="w-10 h-10 rounded-full bg-[#7b2ff2] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{other}</p>
          <p className="text-[10px] text-gray-400 dark:text-[#8b949e] flex-shrink-0">
            {timeAgo(conv.last_at)}
          </p>
        </div>
        {conv.listing_title && (
          <p className="text-[10px] text-[#7b2ff2] dark:text-[#c4b8e8] truncate font-medium">
            {conv.listing_title}
          </p>
        )}
        <p className="text-xs text-gray-400 dark:text-[#8b949e] truncate mt-0.5">
          {conv.last_message ?? "No messages yet"}
        </p>
      </div>
    </button>
  );
}

// ─── ChatPanel ────────────────────────────────────────────────────────────────

function ChatPanel({
  conv, myId, onBack,
}: {
  conv: Conversation; myId: string; onBack: () => void;
}) {
  const { messages, loading, sending, sendMessage } = useMessages(conv.id);
  const [input, setInput]   = useState("");
  const [offerMode, setOfferMode] = useState(false);
  const [offerInput, setOfferInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const other = conv.buyer_id === myId ? conv.seller_name : conv.buyer_name;
  const initials = other.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (offerMode) {
      const amount = parseFloat(offerInput);
      if (!amount || amount <= 0) return;
      const content = `💰 Offer: ₦${amount.toLocaleString()} for ${conv.listing_title ?? "this listing"}`;
      await sendMessage(content, "offer", amount);
      setOfferInput("");
      setOfferMode(false);
    } else {
      if (!input.trim()) return;
      await sendMessage(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-[#2d1e5f] bg-white dark:bg-[#18122b]">
        <button onClick={onBack} className="md:hidden text-gray-400 hover:text-[#7b2ff2] transition mr-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-9 h-9 rounded-full bg-[#7b2ff2] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white text-sm">{other}</p>
          {conv.listing_title && (
            <p className="text-[10px] text-[#7b2ff2] truncate">{conv.listing_title}</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50 dark:bg-[#0a0822]">
        {loading ? (
          <div className="flex justify-center pt-10">
            <div className="w-6 h-6 border-2 border-[#7b2ff2] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400 dark:text-[#8b949e]">
            <MessageCircle className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm">No messages yet — say hello!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === myId || msg.sender_id === "__me__";
            const isOffer = msg.type === "offer";

            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                    isOffer
                      ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200"
                      : isMe
                      ? "bg-[#7b2ff2] text-white rounded-br-sm"
                      : "bg-white dark:bg-[#18122b] text-gray-800 dark:text-[#e0d7ff] border border-gray-100 dark:border-[#2d1e5f] rounded-bl-sm"
                  }`}>
                    {msg.content}
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-[#484f58] px-1">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Offer mode banner */}
      {offerMode && (
        <div className="px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border-t border-amber-200 dark:border-amber-700 flex items-center gap-3">
          <span className="text-sm font-medium text-amber-800 dark:text-amber-300 flex-shrink-0">
            💰 Offer amount (₦)
          </span>
          <input
            type="number"
            value={offerInput}
            onChange={(e) => setOfferInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter offer amount..."
            className="flex-1 text-sm bg-white dark:bg-[#0d1117] border border-amber-300 dark:border-amber-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-800 dark:text-white"
            autoFocus
          />
          <button
            onClick={() => { setOfferMode(false); setOfferInput(""); }}
            className="text-xs text-amber-600 hover:underline flex-shrink-0"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Input bar */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-[#2d1e5f] bg-white dark:bg-[#18122b] flex items-end gap-2">
        {/* Offer button — only show if this is a listing conversation */}
        {conv.listing_id && !offerMode && (
          <button
            onClick={() => setOfferMode(true)}
            className="flex-shrink-0 px-3 py-2 text-xs font-semibold rounded-xl border border-amber-300 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition whitespace-nowrap"
          >
            💰 Offer
          </button>
        )}

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send)"
          rows={1}
          className="flex-1 resize-none text-sm bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-[#30363d] rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#7b2ff2] text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-[#484f58] max-h-32 overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        />

        <button
          onClick={handleSend}
          disabled={sending || (!input.trim() && !offerInput.trim())}
          className="flex-shrink-0 w-10 h-10 bg-[#7b2ff2] hover:bg-[#651fff] disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-all active:scale-95"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Inbox component ─────────────────────────────────────────────────────

export default function Inbox() {
  const { user }   = useAuth();
  const searchParams = useSearchParams();
  const { conversations, loading } = useConversations();

  // Pre-select conversation if coming from listing page
  const [selectedId, setSelectedId] = useState<string | null>(
    searchParams.get("conversation")
  );

  const selected = conversations.find((c) => c.id === selectedId) ?? null;

  if (!user) return null;

  return (
    <div>
      <h2 className="font-bold text-2xl text-gray-900 dark:text-white mb-6">Inbox</h2>

      <div className="bg-white dark:bg-[#18122b] rounded-2xl border border-gray-100 dark:border-[#2d1e5f] overflow-hidden shadow-sm"
        style={{ height: "calc(100vh - 280px)", minHeight: "500px" }}
      >
        <div className="flex h-full">

          {/* ── Conversation list ──────────────────────────────────────────── */}
          <div className={`flex flex-col border-r border-gray-100 dark:border-[#2d1e5f] ${
            selected ? "hidden md:flex w-72 flex-shrink-0" : "flex flex-1 md:flex-none md:w-72 md:flex-shrink-0"
          }`}>
            <div className="px-4 py-4 border-b border-gray-100 dark:border-[#2d1e5f]">
              <h3 className="font-semibold text-gray-900 dark:text-white">Messages</h3>
              <p className="text-xs text-gray-400 dark:text-[#8b949e] mt-0.5">
                {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center pt-10">
                  <div className="w-5 h-5 border-2 border-[#7b2ff2] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400 dark:text-[#8b949e] px-6 text-center">
                  <MessageCircle className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm font-medium">No messages yet</p>
                  <p className="text-xs mt-1">
                    Message a seller from any listing page to start a conversation
                  </p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conv={conv}
                    isSelected={conv.id === selectedId}
                    myId={user.id}
                    onClick={() => setSelectedId(conv.id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* ── Chat panel ────────────────────────────────────────────────── */}
          <div className={`flex-1 min-w-0 ${!selected ? "hidden md:flex items-center justify-center" : "flex flex-col"}`}>
            {selected ? (
              <ChatPanel
                conv={selected}
                myId={user.id}
                onBack={() => setSelectedId(null)}
              />
            ) : (
              <div className="flex flex-col items-center text-gray-300 dark:text-[#484f58]">
                <MessageCircle className="w-16 h-16 mb-4" />
                <p className="text-lg font-semibold text-gray-500 dark:text-[#8b949e]">
                  Select a conversation
                </p>
                <p className="text-sm text-gray-400 dark:text-[#484f58] mt-1">
                  Choose a chat from the left to start messaging
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}