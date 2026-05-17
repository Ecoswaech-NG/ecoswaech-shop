"use client";

interface Aggregations {
  makes:      { make: string;     _count: number }[];
  types:      { type: string;     _count: number }[];
  categories: { category: string; _count: number }[];
  locations:  { location: string; _count: number }[];
}

interface Filters {
  make:      string;
  model:     string;
  category:  string;
  type:      string;
  condition: string;
  location:  string;
  minPrice:  string;
  maxPrice:  string;
}

interface Props {
  filters:       Filters;
  aggregations:  Aggregations | null;
  onChange:      (key: keyof Filters, value: string) => void;
  onReset:       () => void;
  resultCount:   number;
}

const selectCls =
  "w-full text-sm bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-[#30363d] " +
  "text-gray-800 dark:text-[#e0d7ff] rounded-lg px-3 py-2 focus:outline-none " +
  "focus:ring-2 focus:ring-[#7b2ff2] transition";

const inputCls =
  "w-full text-sm bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-[#30363d] " +
  "text-gray-800 dark:text-[#e0d7ff] rounded-lg px-3 py-2 focus:outline-none " +
  "focus:ring-2 focus:ring-[#7b2ff2] transition";

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-gray-500 dark:text-[#8b949e] uppercase tracking-widest">
        {title}
      </p>
      {children}
    </div>
  );
}

export default function FilterSidebar({
  filters, aggregations, onChange, onReset, resultCount,
}: Props) {
  const hasFilters = Object.values(filters).some((v) => v !== "");

  return (
    <aside className="w-full space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-900 dark:text-white text-sm">Filters</p>
          <p className="text-xs text-gray-400 dark:text-[#8b949e] mt-0.5">
            {resultCount.toLocaleString()} result{resultCount !== 1 ? "s" : ""}
          </p>
        </div>
        {hasFilters && (
          <button
            onClick={onReset}
            className="text-xs text-[#7b2ff2] hover:underline font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Vehicle Type */}
      <FilterGroup title="Vehicle Type">
        <select className={selectCls} value={filters.type} onChange={(e) => onChange("type", e.target.value)}>
          <option value="">All Types</option>
          {aggregations?.types.map(({ type, _count }) => (
            <option key={type} value={type}>{type} ({_count})</option>
          ))}
        </select>
      </FilterGroup>

      {/* Category */}
      <FilterGroup title="Category">
        <select className={selectCls} value={filters.category} onChange={(e) => onChange("category", e.target.value)}>
          <option value="">All Categories</option>
          {aggregations?.categories.map(({ category, _count }) => (
            <option key={category} value={category}>{category} ({_count})</option>
          ))}
        </select>
      </FilterGroup>

      {/* Make */}
      <FilterGroup title="Make">
        <select className={selectCls} value={filters.make} onChange={(e) => onChange("make", e.target.value)}>
          <option value="">All Makes</option>
          {aggregations?.makes.map(({ make, _count }) => (
            <option key={make} value={make}>{make} ({_count})</option>
          ))}
        </select>
      </FilterGroup>

      {/* Model — free text when make selected */}
      {filters.make && (
        <FilterGroup title="Model">
          <input
            className={inputCls}
            value={filters.model}
            onChange={(e) => onChange("model", e.target.value)}
            placeholder="e.g. Camry, Model 3"
          />
        </FilterGroup>
      )}

      {/* Condition */}
      <FilterGroup title="Condition">
        <div className="flex gap-2">
          {["", "Brand New", "Used", "Certified Pre-Owned"].map((c) => (
            <button
              key={c}
              onClick={() => onChange("condition", c)}
              className={`flex-1 text-[11px] font-medium py-1.5 rounded-lg border transition-all ${
                filters.condition === c
                  ? "bg-[#7b2ff2] text-white border-[#7b2ff2]"
                  : "bg-white dark:bg-[#0d1117] text-gray-600 dark:text-[#8b949e] border-gray-200 dark:border-[#30363d] hover:border-[#7b2ff2]"
              }`}
            >
              {c || "Any"}
            </button>
          ))}
        </div>
      </FilterGroup>

      {/* Price range */}
      <FilterGroup title="Price Range (₦)">
        <div className="flex gap-2 items-center">
          <input
            type="number"
            className={inputCls}
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => onChange("minPrice", e.target.value)}
          />
          <span className="text-gray-400 text-xs flex-shrink-0">to</span>
          <input
            type="number"
            className={inputCls}
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => onChange("maxPrice", e.target.value)}
          />
        </div>

        {/* Quick price presets */}
        <div className="flex flex-wrap gap-1.5 mt-1">
          {[
            { label: "Under ₦5M",  min: "",         max: "5000000"   },
            { label: "₦5–20M",     min: "5000000",  max: "20000000"  },
            { label: "₦20–50M",    min: "20000000", max: "50000000"  },
            { label: "₦50M+",      min: "50000000", max: ""          },
          ].map(({ label, min, max }) => (
            <button
              key={label}
              onClick={() => { onChange("minPrice", min); onChange("maxPrice", max); }}
              className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                filters.minPrice === min && filters.maxPrice === max
                  ? "bg-[#7b2ff2] text-white border-[#7b2ff2]"
                  : "bg-white dark:bg-[#0d1117] text-gray-500 dark:text-[#8b949e] border-gray-200 dark:border-[#30363d] hover:border-[#7b2ff2]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </FilterGroup>

      {/* Location */}
      <FilterGroup title="Location">
        <select className={selectCls} value={filters.location} onChange={(e) => onChange("location", e.target.value)}>
          <option value="">All Locations</option>
          {aggregations?.locations.map(({ location, _count }) => (
            <option key={location} value={location}>{location} ({_count})</option>
          ))}
        </select>
      </FilterGroup>
    </aside>
  );
}