export function Description({ description }: { description: string }) {
  if (!description) {
    return <div className="w-full h-[100px] rounded-xl bg-slate-100 dark:bg-[#18122b] animate-pulse" />;
  }
  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-[#18122b] border border-gray-100 dark:border-[#2d1e5f] shadow-sm">
      <h2 className="text-xs font-semibold text-gray-500 dark:text-[#8b949e] mb-3 tracking-widest uppercase">
        Description
      </h2>
      <p className="text-gray-700 dark:text-[#c4b8e8] text-sm leading-relaxed whitespace-pre-line">
        {description}
      </p>
    </div>
  );
}