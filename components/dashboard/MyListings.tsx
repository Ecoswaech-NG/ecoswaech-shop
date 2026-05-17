"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { BsTrash3Fill } from "react-icons/bs";
import { FiEdit2, FiEye } from "react-icons/fi";
import { Button } from "@/components/ui/button";

interface Listing {
  id:           number;
  listingTitle: string | null;
  make:         string;
  model:        string;
  year:         number;
  sellingPrice: number;
  status:       string;
  viewCount:    number;
  saveCount:    number;
  images:       { imageUrl: string }[];
}

function ConfirmDialog({
  open, title, onClose, onConfirm,
}: { open: boolean; title: string; onClose: () => void; onConfirm: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-[#18122b] rounded-2xl shadow-2xl p-6 w-80 border border-gray-100 dark:border-[#2d1e5f]">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Delete Listing</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-5">
          Are you sure you want to delete <span className="font-semibold">"{title}"</span>? This cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm}>Delete</Button>
        </div>
      </div>
    </div>
  );
}

const FALLBACK = "https://cloudfront-eu-central-1.images.arcpublishing.com/thenational/C7BBKEO5NNNFT6CUY7TGRDHX44.jpg";

export default function MyListings() {
  const { user } = useAuth();
  const [listings, setListings]   = useState<Listing[]>([]);
  const [loading,  setLoading]    = useState(true);
  const [deleteId, setDeleteId]   = useState<number | null>(null);
  const [deleteTitle, setDeleteTitle] = useState("");

  useEffect(() => {
    if (!user) return;
    fetch("/api/listings/mine")
      .then((r) => r.json())
      .then((d) => setListings(d.listings ?? []))
      .finally(() => setLoading(false));
  }, [user]);

  const handleDelete = (id: number, title: string) => {
    setDeleteId(id);
    setDeleteTitle(title);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await fetch(`/api/listings/vehicles/${deleteId}`, { method: "DELETE" });
    setListings((prev) => prev.filter((l) => l.id !== deleteId));
    setDeleteId(null);
  };

  const statusColor = (s: string) =>
    s === "active"  ? "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400" :
    s === "sold"    ? "text-blue-600  bg-blue-50  dark:bg-blue-900/20  dark:text-blue-400"  :
    s === "expired" ? "text-red-500   bg-red-50   dark:bg-red-900/20   dark:text-red-400"   :
                      "text-gray-500  bg-gray-100 dark:bg-gray-800     dark:text-gray-400";

  if (loading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({length:3}).map((_,i)=>(
        <div key={i} className="h-64 rounded-2xl bg-gray-100 dark:bg-[#18122b] animate-pulse"/>
      ))}
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-bold text-2xl text-gray-900 dark:text-white">My Listings</h2>
          <p className="text-sm text-gray-400 dark:text-[#8b949e] mt-0.5">{listings.length} listing{listings.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/add-listing">
          <Button className="bg-[#7b2ff2] hover:bg-[#651fff] text-white rounded-full px-5">
            + Add Listing
          </Button>
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🚗</p>
          <p className="font-semibold text-gray-700 dark:text-white text-lg">No listings yet</p>
          <p className="text-gray-400 dark:text-[#8b949e] text-sm mt-1 mb-6">Add your first vehicle to start selling</p>
          <Link href="/add-listing">
            <Button className="bg-[#7b2ff2] text-white rounded-full px-6">List a Vehicle</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white dark:bg-[#18122b] rounded-2xl border border-gray-100 dark:border-[#2d1e5f] overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <div className="relative h-44">
                <img
                  src={listing.images[0]?.imageUrl || FALLBACK}
                  alt={listing.listingTitle ?? ""}
                  className="w-full h-full object-cover"
                />
                <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor(listing.status)}`}>
                  {listing.status}
                </span>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1">
                  {listing.listingTitle || `${listing.year} ${listing.make} ${listing.model}`}
                </h3>
                <p className="font-bold text-[#7b2ff2] dark:text-[#c4b8e8] mt-1">
                  ₦{Number(listing.sellingPrice).toLocaleString()}
                </p>

                {/* Analytics */}
                <div className="flex gap-4 mt-2 text-xs text-gray-400 dark:text-[#8b949e]">
                  <span className="flex items-center gap-1">
                    <FiEye className="w-3 h-3" /> {listing.viewCount} views
                  </span>
                  <span>🔖 {listing.saveCount} saves</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3">
                  <Link href={`/listing-details/${listing.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs rounded-lg">
                      View
                    </Button>
                  </Link>
                  <Link href={`/edit-listing/${listing.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs rounded-lg gap-1">
                      <FiEdit2 className="w-3 h-3" /> Edit
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="px-3 text-xs rounded-lg"
                    onClick={() => handleDelete(listing.id, listing.listingTitle ?? `${listing.make} ${listing.model}`)}
                  >
                    <BsTrash3Fill />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title={deleteTitle}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}