"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { FaStar } from "react-icons/fa";
import { Button } from "@/components/ui/button";

interface Props {
  subjectId:   string;
  subjectName: string;
}

export default function ReviewForm({ subjectId, subjectName }: Props) {
  const { user, userLoggedIn } = useAuth();
  const [rating,   setRating]   = useState(0);
  const [hover,    setHover]    = useState(0);
  const [comment,  setComment]  = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done,     setDone]     = useState(false);

  if (!userLoggedIn) {
    return (
      <p className="text-xs text-gray-400 dark:text-[#8b949e]">
        <a href="/login" className="text-[#7b2ff2] hover:underline">Sign in</a> to leave a review
      </p>
    );
  }

  if (user?.id === subjectId) return null;

  if (done) {
    return <p className="text-xs text-[#3fb950] font-medium">✓ Review submitted!</p>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return;
    setSubmitting(true);
    try {
      await fetch("/api/reviews", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ subjectId, rating, comment }),
      });
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-xs font-semibold text-gray-700 dark:text-[#c4b8e8]">
        Rate {subjectName}
      </p>

      {/* Star picker */}
      <div className="flex gap-1">
        {[1,2,3,4,5].map((n) => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(n)}
          >
            <FaStar className={`w-6 h-6 transition-colors ${
              n <= (hover || rating) ? "text-amber-400" : "text-gray-200 dark:text-[#2d1e5f]"
            }`} />
          </button>
        ))}
      </div>

      <textarea
        className="w-full text-xs border border-gray-200 dark:border-[#2d1e5f] bg-white dark:bg-[#0d1117] text-gray-800 dark:text-[#e0d7ff] rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#7b2ff2] resize-none"
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience (optional)..."
      />

      <Button
        type="submit"
        disabled={!rating || submitting}
        className="w-full bg-[#7b2ff2] hover:bg-[#651fff] text-white rounded-full text-xs py-2 disabled:opacity-40"
      >
        {submitting ? "Submitting…" : "Submit Review"}
      </Button>
    </form>
  );
}