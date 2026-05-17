import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ImageGallery from "../components/Imagegallery";
import DetailHeader from "../components/DetailHeader";
import { Description } from "../components/Description";
import { Specification } from "../components/Specifications";
import { Features } from "../components/Features";
import Pricing from "../components/Pricing";
import OwnerDetails from "../components/OwnersDetail";
import { FinancialCalculator } from "../components/FinancialCalculator";
import BatteryBadge from "../components/BatteryBadge";
import Navbar from "@/components/Navbar";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ListingDetailsPage({ params }: Props) {
  const { id } = await params;

  const listing = await prisma.carListing.findUnique({
    where:   { id: Number(id) },
    include: {
      images:        true,
      batteryReport: {
        select: { id: true, grade: true, sohScore: true, vin: true },
      },
      user: {
        select: { id: true, fullName: true, email: true, createdAt: true },
      },
    },
  });

  if (!listing) return notFound();

  const images  = listing.images.map((img) => ({ imageUrl: img.imageUrl }));
  const features = listing.features as Record<string, boolean> | null;

  return (
    <div>
        <Navbar />
    
    <div className="min-h-screen bg-gray-50 dark:bg-[#f8f8f9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Main two-column layout ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left — media + details */}
          <div className="lg:col-span-2 space-y-4">
            <DetailHeader listing={listing} />
            <ImageGallery images={images} />
            
            {/* Battery Passport badge — only shown if linked */}
            
            <Description description={listing.listingDescription} />
            <Specification listing={listing} />

           
            <FinancialCalculator sellingPrice={listing.sellingPrice} />
          </div>

          {/* Right — pricing + owner */}
          <div className="space-y-4">
            {listing.batteryReport && (
              <BatteryBadge report={listing.batteryReport} />
            )}
            <Pricing listing={listing} />
            <OwnerDetails listing={listing} />
             {features && Object.keys(features).length > 0 && (
              <Features features={features} />
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}