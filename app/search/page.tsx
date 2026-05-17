"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import SearchCard, { type SearchListing } from "@/components/search/SearchCard";
import FilterSidebar from "@/components/search/FilterSidebar";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

// ─── Types ────────────────────────────────────────────────────────────────────

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

const EMPTY_FILTERS: Filters = {
  make: "", model: "", category: "", type: "",
  condition: "", location: "", minPrice: "", maxPrice: "",
};

const SORT_OPTIONS = [
  { value: "newest",     label: "Newest"       },
  { value: "price_asc",  label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "year_desc",  label: "Year: Newest" },
  { value: "year_asc",   label: "Year: Oldest" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const { user }     = useAuth();

  // ── State ──────────────────────────────────────────────────────────────────

  const [keyword,      setKeyword]      = useState(searchParams.get("q") ?? "");
  const [filters,      setFilters]      = useState<Filters>({
    make:      searchParams.get("make")      ?? "",
    model:     searchParams.get("model")     ?? "",
    category:  searchParams.get("category")  ?? "",
    type:      searchParams.get("type")      ?? "",
    condition: searchParams.get("condition") ?? "",
    location:  searchParams.get("location")  ?? "",
    minPrice:  searchParams.get("minPrice")  ?? "",
    maxPrice:  searchParams.get("maxPrice")  ?? "",
  });
  const [sort,         setSort]         = useState(searchParams.get("sort") ?? "newest");
  const [listings,     setListings]     = useState<SearchListing[]>([]);
  const [aggregations, setAggregations] = useState<any>(null);
  const [total,        setTotal]        = useState(0);
  const [page,         setPage]         = useState(1);
  const [totalPages,   setTotalPages]   = useState(1);
  const [loading,      setLoading]      = useState(true);
  const [mobileFilters, setMobileFilters] = useState(false);

  // Bookmarks — keyed by user email so different users get different lists
  const storageKey = `favs_${user?.email ?? "guest"}`;
  const [favourites, setFavourites] = useState<number[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem(storageKey) ?? "[]"); }
    catch { return []; }
  });

  // Debounce keyword
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchListings = useCallback(async (
    kw: string, f: Filters, s: string, p: number
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q:         kw,
        sort:      s,
        page:      String(p),
        ...(f.make      && { make:      f.make      }),
        ...(f.model     && { model:     f.model     }),
        ...(f.category  && { category:  f.category  }),
        ...(f.type      && { type:      f.type      }),
        ...(f.condition && { condition: f.condition }),
        ...(f.location  && { location:  f.location  }),
        ...(f.minPrice  && { minPrice:  f.minPrice  }),
        ...(f.maxPrice  && { maxPrice:  f.maxPrice  }),
      });

      const res  = await fetch(`/api/search?${params}`);
      const data = await res.json();

      if (p === 1) {
        setListings(data.listings ?? []);
        if (data.aggregations) setAggregations(data.aggregations);
      } else {
        setListings((prev) => [...prev, ...(data.listings ?? [])]);
      }

      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + filter/sort changes
  useEffect(() => {
    setPage(1);
    fetchListings(keyword, filters, sort, 1);
  }, [filters, sort]);

  // Debounced keyword search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchListings(keyword, filters, sort, 1);
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [keyword]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setKeyword("");
  };

  const toggleFavourite = (id: number) => {
    setFavourites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchListings(keyword, filters, sort, next);
  };

  const hasActiveFilters =
    keyword !== "" || Object.values(filters).some((v) => v !== "");

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div>
        <Navbar />
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0822]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Search EVs
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Find your perfect electric vehicle
          </p>
        </div>

        {/* ── Search bar ──────────────────────────────────────────────────── */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search by make, model, keyword…"
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#0d1117] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#484f58] focus:outline-none focus:ring-2 focus:ring-[#7b2ff2] text-sm transition"
            />
            {keyword && (
              <button onClick={() => setKeyword("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="hidden sm:block px-4 py-3 rounded-xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#0d1117] text-gray-800 dark:text-[#e0d7ff] text-sm focus:outline-none focus:ring-2 focus:ring-[#7b2ff2] transition"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setMobileFilters(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#0d1117] text-gray-700 dark:text-[#c4b8e8] text-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            {keyword && (
              <Chip label={`"${keyword}"`} onRemove={() => setKeyword("")} />
            )}
            {(Object.entries(filters) as [keyof Filters, string][])
              .filter(([, v]) => v)
              .map(([key, value]) => (
                <Chip
                  key={key}
                  label={`${key}: ${key.includes("Price") ? `₦${Number(value).toLocaleString()}` : value}`}
                  onRemove={() => handleFilterChange(key, "")}
                />
              ))
            }
            <button onClick={resetFilters} className="text-xs text-[#7b2ff2] hover:underline font-medium px-2">
              Clear all
            </button>
          </div>
        )}

        {/* ── Main layout ─────────────────────────────────────────────────── */}
        <div className="flex gap-8">

          {/* Desktop sidebar */}
          <div className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-24 bg-white dark:bg-[#18122b] rounded-2xl border border-gray-100 dark:border-[#2d1e5f] p-5">
              <FilterSidebar
                filters={filters}
                aggregations={aggregations}
                onChange={handleFilterChange}
                onReset={resetFilters}
                resultCount={total}
              />
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 min-w-0">

            {/* Sort — mobile */}
            <div className="sm:hidden mb-4">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#0d1117] text-sm text-gray-800 dark:text-[#e0d7ff] focus:outline-none"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {loading && page === 1 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-64 rounded-2xl bg-gray-200 dark:bg-[#18122b] animate-pulse" />
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-4xl mb-4">🔍</p>
                <p className="text-lg font-semibold text-gray-700 dark:text-white">
                  No vehicles found
                </p>
                <p className="text-sm text-gray-400 dark:text-[#8b949e] mt-2">
                  Try adjusting your filters or search term
                </p>
                {hasActiveFilters && (
                  <button onClick={resetFilters} className="mt-4 text-sm text-[#7b2ff2] hover:underline font-medium">
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <p className="text-xs text-gray-400 dark:text-[#8b949e] mb-4">
                  {total.toLocaleString()} listing{total !== 1 ? "s" : ""}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                  {listings.map((listing) => (
                    <SearchCard
                      key={listing.id}
                      listing={listing}
                      isFavourite={favourites.includes(listing.id)}
                      onToggleFav={toggleFavourite}
                    />
                  ))}
                </div>

                {/* Load more */}
                {page < totalPages && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={loadMore}
                      disabled={loading}
                      className="px-8 py-3 rounded-full border border-[#7b2ff2] text-[#7b2ff2] font-semibold text-sm hover:bg-[#7b2ff2] hover:text-white transition-all disabled:opacity-40"
                    >
                      {loading ? "Loading…" : `Load more (${total - listings.length} remaining)`}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile filter drawer ─────────────────────────────────────────────── */}
      {mobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white dark:bg-[#18122b] p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <p className="font-semibold text-gray-900 dark:text-white">Filters</p>
              <button onClick={() => setMobileFilters(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <FilterSidebar
              filters={filters}
              aggregations={aggregations}
              onChange={handleFilterChange}
              onReset={resetFilters}
              resultCount={total}
            />
            <button
              onClick={() => setMobileFilters(false)}
              className="w-full mt-6 py-3 bg-[#7b2ff2] text-white rounded-full font-semibold text-sm"
            >
              Show {total.toLocaleString()} results
            </button>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

// ─── Filter chip ──────────────────────────────────────────────────────────────

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-[#7b2ff2]/10 text-[#7b2ff2] border border-[#7b2ff2]/30 px-2.5 py-1 rounded-full">
      {label}
      <button onClick={onRemove} className="hover:opacity-70">
        <X className="w-3 h-3" />
      </button>
    </span>
    
  );
}