import { IoCalendarSharp, IoSpeedometer } from "react-icons/io5";
import { PiGearFineFill } from "react-icons/pi";
import { FaCarSide } from "react-icons/fa";

interface Props {
  listing: {
    listingTitle: string | null;
    year:         number;
    mileage:      number;
    range:        number;
    batterySize:  number;
    location:     string;
    condition:    string;
    offerType:    string | null;
  };
}

function Badge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex gap-2 items-center bg-blue-50 dark:bg-[#1f1340] rounded-full px-3 py-2">
      <span className="text-blue-900 dark:text-[#c4b8e8]">{icon}</span>
      <span className="text-blue-900 dark:text-[#c4b8e8] text-xs sm:text-sm font-medium">{label}</span>
    </div>
  );
}

export default function DetailHeader({ listing }: Props) {
  if (!listing.listingTitle) {
    return <div className="w-full h-[100px] rounded-xl bg-slate-200 dark:bg-[#18122b] animate-pulse" />;
  }

  return (
    <div className="bg-white dark:bg-[#18122b] rounded-2xl p-5 border border-gray-100 dark:border-[#2d1e5f] shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-bold text-2xl sm:text-3xl text-gray-900 dark:text-white leading-tight">
            {listing.listingTitle}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            📍 {listing.location} &nbsp;·&nbsp; {listing.condition}
          </p>
        </div>
        {listing.offerType && (
          <span className="flex-shrink-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            {listing.offerType}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <Badge icon={<IoCalendarSharp className="h-4 w-4" />} label={String(listing.year)} />
        <Badge icon={<IoSpeedometer    className="h-4 w-4" />} label={`${listing.mileage.toLocaleString()} km`} />
        <Badge icon={<PiGearFineFill   className="h-4 w-4" />} label={`${listing.range} km range`} />
        <Badge icon={<FaCarSide        className="h-4 w-4" />} label={`${listing.batterySize} kWh`} />
      </div>
    </div>
  );
}