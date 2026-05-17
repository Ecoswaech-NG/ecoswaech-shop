// PLACE AT: lib/supabase-messaging.ts
// PURPOSE:  Supabase client used specifically for messaging + Realtime.
//           Reuses your existing NEXT_PUBLIC_SUPABASE_* env vars.

import { createClient } from "@supabase/supabase-js";

export const supabaseMsg = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    realtime: {
      params: { eventsPerSecond: 10 },
    },
  }
);

// ── Table names ──────────────────────────────────────────────────────────────
export const CONV_TABLE = "conversations";
export const MSG_TABLE  = "messages";

// ── Types matching the Supabase schema ───────────────────────────────────────

export interface Conversation {
  id:            string;
  listing_id:    number | null;
  listing_title: string | null;
  buyer_id:      string;
  seller_id:     string;
  buyer_name:    string;
  seller_name:   string;
  last_message:  string | null;
  last_at:       string;
  created_at:    string;
}

export interface Message {
  id:              string;
  conversation_id: string;
  sender_id:       string;
  sender_name:     string;
  content:         string;
  type:            "text" | "offer";
  offer_amount:    number | null;
  read:            boolean;
  created_at:      string;
}