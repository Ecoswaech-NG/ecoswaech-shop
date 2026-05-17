import { FaCheck } from "react-icons/fa";
 
export function Features({ features }: { features: Record<string, boolean> }) {
  const active = Object.entries(features)
    .filter(([, v]) => v)
    .map(([k]) => k.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()));
 
  if (active.length === 0) return null;
 
  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-[#18122b] border border-gray-100 dark:border-[#2d1e5f] shadow-sm">
      <h2 className="text-xs font-semibold text-gray-500 dark:text-[#8b949e] mb-4 tracking-widest uppercase">
        Features
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {active.map((feat) => (
          <div key={feat} className="flex gap-2 items-center text-sm text-gray-700 dark:text-[#c4b8e8]">
            <FaCheck className="text-xs p-1 w-5 h-5 rounded-full bg-blue-100 dark:bg-[#2d1e5f] text-blue-600 dark:text-[#58a6ff] flex-shrink-0" />
            {feat}
          </div>
        ))}
      </div>
    </div>
  );
}