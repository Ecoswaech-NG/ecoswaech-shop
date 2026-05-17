"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RiAuctionFill } from "react-icons/ri";
import { useAuth } from "@/context/AuthContext";

interface Props {
  listing: {
    id:           number;
    listingTitle: string | null;
    sellingPrice: number;
    make:         string;
    model:        string;
    createdBy:    string;
    userName:     string;
  };
}

export default function Pricing({ listing }: Props) {
  const { user, userLoggedIn } = useAuth();
  const [open, setOpen]           = useState(false);
  const [amount, setAmount]       = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent]           = useState(false);

  const handleOffer = async () => {
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) return;

    setSubmitting(true);
    try {
      // Placeholder — wire to your messaging system when ready
      await new Promise((r) => setTimeout(r, 800));
      setSent(true);
      setTimeout(() => { setOpen(false); setSent(false); setAmount(""); }, 1500);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-5 rounded-2xl border border-gray-100 dark:border-[#2d1e5f] shadow-md bg-white dark:bg-[#18122b]">
      <p className="text-xs font-semibold text-gray-500 dark:text-[#8b949e] tracking-widest uppercase mb-2">
        Price
      </p>
      <p className="font-bold text-4xl text-[#220a77] dark:text-[#c4b8e8]">
        ₦{Number(listing.sellingPrice).toLocaleString()}
      </p>

      <Button
        className="w-full mt-6 bg-[#220a77] hover:bg-[#00C8FF] text-white hover:text-[#18122b] py-3 rounded-full font-medium transition-all flex items-center justify-center gap-2"
        size="lg"
        onClick={() => setOpen(true)}
        disabled={!userLoggedIn}
      >
        <RiAuctionFill className="text-xl" /> Make Offer
      </Button>

      {!userLoggedIn && (
        <p className="text-xs text-center text-gray-400 dark:text-[#484f58] mt-2">
          Sign in to make an offer
        </p>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm bg-white dark:bg-[#18122b] text-gray-900 dark:text-white rounded-2xl">
          <DialogHeader>
            <DialogTitle>Make an Offer</DialogTitle>
          </DialogHeader>
          {sent ? (
            <div className="py-8 text-center">
              <p className="text-[#238636] font-semibold text-lg">✓ Offer sent!</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                The seller will be notified.
              </p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div>
                <Label>Listing</Label>
                <p className="text-sm text-gray-700 dark:text-[#c4b8e8] mt-1">
                  {listing.listingTitle || `${listing.make} ${listing.model}`}
                </p>
              </div>
              <div>
                <Label>Asking Price</Label>
                <p className="text-sm font-semibold mt-1">
                  ₦{Number(listing.sellingPrice).toLocaleString()}
                </p>
              </div>
              <div>
                <Label htmlFor="offer">Your Offer (₦)</Label>
                <Input
                  id="offer"
                  type="number"
                  className="mt-1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter your offer"
                  min={0}
                />
              </div>
            </div>
          )}
          {!sent && (
            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button
                onClick={handleOffer}
                disabled={submitting || !amount}
                className="bg-[#7b2ff2] text-white hover:bg-[#651fff]"
              >
                {submitting ? "Sending..." : "Submit Offer"}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}