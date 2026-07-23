import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SearchCard, { type SearchListing } from "@/components/search/SearchCard";
import { FavouriteWrapper } from "@/components/search/FavouriteWrapper";

interface Props {
  params: Promise<{ category: string }>;
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const decoded = decodeURIComponent(category);

  const listings = await prisma.carListing.findMany({
    where: {
      status:   "active",
      category: { contains: decoded, mode: "insensitive" },
    },
    include: {
      images:        { take: 1, select: { imageUrl: true } },
      batteryReport: { select: { id: true, grade: true, sohScore: true } },
    },
    orderBy: { id: "desc" },
    take:    40,
  });

  const formatted: SearchListing[] = listings.map((l: any) => ({
    ...l,
    images: l.images.map((img: any) => ({ imageUrl: img.imageUrl })),
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0822]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 dark:text-[#8b949e] mb-6 flex items-center gap-1.5">
          <Link href="/home" className="hover:text-[#7b2ff2]">Home</Link>
          <span>/</span>
          <Link href="/search" className="hover:text-[#7b2ff2]">Search</Link>
          <span>/</span>
          <span className="text-gray-700 dark:text-white font-medium">{decoded}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {decoded}
          </h1>
          <p className="text-gray-400 dark:text-[#8b949e] text-sm mt-1">
            {formatted.length} listing{formatted.length !== 1 ? "s" : ""} available
          </p>
        </div>

        {/* Results */}
        {formatted.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-4xl mb-4">🚗</p>
            <p className="text-lg font-semibold text-gray-700 dark:text-white">
              No {decoded} listings yet
            </p>
            <p className="text-sm text-gray-400 dark:text-[#8b949e] mt-2">
              Be the first to list one!
            </p>
            <Link
              href="/add-listing"
              className="mt-6 inline-block bg-[#7b2ff2] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#651fff] transition"
            >
              Add Listing
            </Link>
          </div>
        ) : (
          <FavouriteWrapper listings={formatted} />
        )}
      </div>
    </div>
  );
}