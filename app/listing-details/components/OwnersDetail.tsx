// PLACE AT: components/listing-details/OwnerDetails.tsx
// PURPOSE:  Contact card on listing details page.
//           "Message Seller" creates a conversation and opens the inbox.
//           "Make Offer" creates a conversation with an offer message.

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaPhone, FaWhatsapp } from "react-icons/fa";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { RiAuctionFill } from "react-icons/ri";

interface Props {
  listing: {
    id:           number;
    listingTitle: string | null;
    make:         string;
    model:        string;
    sellingPrice: number;
    userId:       string | null;
    userName:     string;
    createdBy:    string;
    userImageUrl: string | null;
    postedOn:     string | null;
    phone?:       string | null;
  };
}

export default function OwnerDetails({ listing }: Props) {
  const { user, userLoggedIn } = useAuth();
  const router = useRouter();

  const [messaging,    setMessaging]    = useState(false);
  const [offerOpen,    setOfferOpen]    = useState(false);
  const [offerAmount,  setOfferAmount]  = useState("");
  const [submitting,   setSubmitting]   = useState(false);
  const [toast,        setToast]        = useState<string | null>(null);

  const initials = listing.userName
    .split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const phone          = listing.phone?.replace(/[^0-9+]/g, "");
  const whatsappNumber = phone?.replace(/^\+/, "").replace(/^0/, "234");
  const displayTitle   = listing.listingTitle ?? `${listing.make} ${listing.model}`;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // ── Start a plain message conversation ────────────────────────────────────
  const handleMessage = async () => {
    if (!userLoggedIn) { router.push(`/login?redirect=/listing-details/${listing.id}`); return; }
    if (!listing.userId) return;
    setMessaging(true);
    try {
      const res  = await fetch("/api/conversations", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerId:       listing.userId,
          listingId:      listing.id,
          listingTitle:   displayTitle,
          initialMessage: `Hi, I'm interested in your listing: ${displayTitle}`,
        }),
      });
      const data = await res.json();
      if (data.conversationId) {
        router.push(`/user/dashboard?tab=inbox&conversation=${data.conversationId}`);
      }
    } finally {
      setMessaging(false);
    }
  };

  // ── Submit an offer via chat ───────────────────────────────────────────────
  const handleOffer = async () => {
    const amount = parseFloat(offerAmount);
    if (!amount || amount <= 0) return;
    if (!userLoggedIn) { router.push(`/login?redirect=/listing-details/${listing.id}`); return; }
    if (!listing.userId) return;

    setSubmitting(true);
    try {
      const res  = await fetch("/api/conversations", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerId:     listing.userId,
          listingId:    listing.id,
          listingTitle: displayTitle,
          offerAmount:  amount,
        }),
      });
      const data = await res.json();
      if (data.conversationId) {
        setOfferOpen(false);
        showToast("Offer sent! Opening your inbox…");
        setTimeout(() => {
          router.push(`/user/dashboard?tab=inbox&conversation=${data.conversationId}`);
        }, 1000);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const postedDate = listing.postedOn
    ? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        .format(new Date(listing.postedOn))
    : null;

  return (
    <>
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl bg-[#238636] text-white text-sm font-medium shadow-lg">
          {toast}
        </div>
      )}

      <div className="p-5 rounded-2xl border border-gray-100 dark:border-[#2d1e5f] shadow-md bg-white dark:bg-[#18122b]">
        <p className="text-xs font-semibold text-gray-500 dark:text-[#8b949e] tracking-widest uppercase mb-4">
          Owner&apos;s Contact
        </p>

        {/* Avatar + name */}
        <div className="flex items-center gap-3 mb-5">
          {listing.userImageUrl ? (
            <img src={listing.userImageUrl} alt={listing.userName}
              className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#7b2ff2] flex items-center justify-center text-white font-bold text-sm">
              {initials}
            </div>
          )}
          <div>
            {listing.userId ? (
              <Link href={`/profile/${listing.userId}`}
                className="font-bold text-gray-900 dark:text-white hover:text-[#7b2ff2] transition-colors text-sm">
                {listing.userName}
              </Link>
            ) : (
              <p className="font-bold text-gray-900 dark:text-white text-sm">{listing.userName}</p>
            )}
            <p className="text-xs text-gray-400 dark:text-[#8b949e]">{listing.createdBy}</p>
            {postedDate && (
              <p className="text-xs text-gray-400 dark:text-[#484f58] mt-0.5">Listed {postedDate}</p>
            )}
          </div>
        </div>

        {/* Contact actions */}
        <div className="space-y-2">

          {/* Message — creates conversation in inbox */}
          <Button
            onClick={handleMessage}
            disabled={messaging || !listing.userId}
            className="w-full bg-[#220a77] hover:bg-[#7b2ff2] text-white rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {messaging ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <MessageCircle className="w-4 h-4" />
            )}
            Message Seller
          </Button>

          {/* Make Offer — opens offer dialog then routes to inbox */}
          <Button
            onClick={() => {
              if (!userLoggedIn) { router.push(`/login?redirect=/listing-details/${listing.id}`); return; }
              setOfferOpen(true);
            }}
            variant="outline"
            className="w-full rounded-xl flex items-center justify-center gap-2 border-[#7b2ff2] text-[#7b2ff2] hover:bg-[#7b2ff2] hover:text-white transition-all"
          >
            <RiAuctionFill className="text-lg" /> Make Offer
          </Button>

          {/* Call */}
          {phone ? (
            <a href={`tel:${phone}`} className="block w-full">
              <Button variant="outline"
                className="w-full rounded-xl flex items-center justify-center gap-2 border-[#220a77] text-[#220a77] dark:text-[#c4b8e8] hover:bg-[#220a77] hover:text-white dark:hover:bg-[#7b2ff2] transition-all">
                <FaPhone className="w-3.5 h-3.5" /> Call Seller 📞
              </Button>
            </a>
          ) : (
            <Button variant="outline" disabled className="w-full rounded-xl opacity-40 flex items-center justify-center gap-2">
              <FaPhone className="w-3.5 h-3.5" /> Call Seller 📞
            </Button>
          )}

          {/* WhatsApp */}
          {whatsappNumber ? (
            <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer" className="block w-full">
              <Button variant="outline"
                className="w-full rounded-xl flex items-center justify-center gap-2 border-green-500 text-green-600 hover:bg-green-500 hover:text-white transition-all">
                <FaWhatsapp className="w-4 h-4" /> WhatsApp 💬
              </Button>
            </a>
          ) : (
            <Button variant="outline" disabled className="w-full rounded-xl opacity-40 flex items-center justify-center gap-2">
              <FaWhatsapp className="w-4 h-4" /> WhatsApp 💬
            </Button>
          )}
        </div>

        {listing.userId && (
          <Link href={`/profile/${listing.userId}`}
            className="block text-center text-xs text-[#7b2ff2] hover:underline mt-4 font-medium">
            View seller&apos;s profile →
          </Link>
        )}
      </div>

      {/* Make Offer dialog */}
      <Dialog open={offerOpen} onOpenChange={setOfferOpen}>
        <DialogContent className="max-w-sm bg-white dark:bg-[#18122b] text-gray-900 dark:text-white rounded-2xl">
          <DialogHeader>
            <DialogTitle>Make an Offer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div>
              <Label>Listing</Label>
              <p className="text-sm text-gray-700 dark:text-[#c4b8e8] mt-1">{displayTitle}</p>
            </div>
            <div>
              <Label>Asking Price</Label>
              <p className="text-sm font-semibold mt-1">₦{Number(listing.sellingPrice).toLocaleString()}</p>
            </div>
            <div>
              <Label htmlFor="offer-amount">Your Offer (₦)</Label>
              <Input
                id="offer-amount"
                type="number"
                className="mt-1"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                placeholder="Enter your offer"
                min={0}
              />
            </div>
            <p className="text-xs text-gray-400 dark:text-[#8b949e]">
              Your offer will be sent as a message to the seller in your inbox.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOfferOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={handleOffer}
              disabled={submitting || !offerAmount}
              className="bg-[#7b2ff2] text-white hover:bg-[#651fff]"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending…
                </span>
              ) : "Send Offer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}