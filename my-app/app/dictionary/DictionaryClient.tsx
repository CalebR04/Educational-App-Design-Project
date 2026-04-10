"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Video, X, Image as ImageIcon, ChevronDown, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import Navbar from "../../components/Navbar";
import { createClient } from "@/lib/supabase/client";
import type { SignData } from './page';

type WordProgress = {
  attempts: number;
  correct: number;
};

type SortField = "alphabetical" | "understanding";
type SortDir = "asc" | "desc";

export default function DictionaryClient({ allSigns }: { allSigns: SignData[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSign, setSelectedSign] = useState<SignData | null>(null);
  const [sortField, setSortField] = useState<SortField>("alphabetical");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [wordProgress, setWordProgress] = useState<Record<string, WordProgress>>({});
  const [categoryOpen, setCategoryOpen] = useState(false);

  const supabase = createClient();

  // Load word progress from Supabase
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("word_progress")
        .select("word_key, attempts, correct")
        .eq("user_id", user.id);
      if (!data) return;
      const map: Record<string, WordProgress> = {};
      for (const row of data) {
        map[row.word_key] = { attempts: row.attempts, correct: row.correct };
      }
      setWordProgress(map);
    }
    load();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(allSigns.map(s => s.category));
    return ["All", ...Array.from(cats).sort()];
  }, [allSigns]);

  function getUnderstanding(sign: SignData): number | null {
    const p = wordProgress[sign.wordKey];
    if (!p || p.attempts === 0) return null;
    return Math.round((p.correct / p.attempts) * 100);
  }

  const filteredSorted = useMemo(() => {
    const queryWords = searchQuery.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    const filtered = allSigns.filter(sign => {
      const matchesSearch = queryWords.length === 0 || queryWords.some(w => sign.name.toLowerCase().includes(w));
      const matchesCategory = selectedCategory === "All" || sign.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortField === "alphabetical") {
        cmp = a.name.localeCompare(b.name);
      } else {
        const ua = getUnderstanding(a) ?? -1;
        const ub = getUnderstanding(b) ?? -1;
        cmp = ua - ub;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [allSigns, searchQuery, selectedCategory, sortField, sortDir, wordProgress]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />;
  };

  function understandingColor(pct: number) {
    if (pct >= 80) return "bg-green-500";
    if (pct >= 50) return "bg-yellow-400";
    return "bg-red-400";
  }

  function understandingLabel(pct: number) {
    if (pct >= 80) return "Strong";
    if (pct >= 50) return "Learning";
    return "Needs Work";
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar active="Dictionary" />

      <main className="max-w-7xl mx-auto px-4 py-4">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">ASL Dictionary</h1>
          <p className="text-gray-600">Browse and search ASL signs. Practice in lessons to track your understanding.</p>
        </div>

        {/* Search + Filter + Sort row */}
        <div className="flex flex-wrap gap-3 mt-6 mb-6 items-center">

          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search signs..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border-2 border-slate-200 bg-white pl-10 pr-4 py-2.5 text-slate-700 outline-none text-sm transition-colors focus:border-blue-500"
            />
          </div>

          {/* Category dropdown */}
          <div className="relative" onBlur={() => setTimeout(() => setCategoryOpen(false), 150)}>
            <button
              onClick={() => setCategoryOpen(o => !o)}
              className="flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-300 transition-colors min-w-36"
            >
              <span className="flex-1 text-left">{selectedCategory}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${categoryOpen ? "rotate-180" : ""}`} />
            </button>
            {categoryOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 rounded-xl border border-slate-200 bg-white shadow-lg z-20 overflow-y-auto max-h-64">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setSelectedCategory(cat); setCategoryOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                      selectedCategory === cat
                        ? "bg-blue-50 text-blue-600"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort buttons */}
          <div className="flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-1 py-1">
            <button
              onClick={() => toggleSort("alphabetical")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                sortField === "alphabetical" ? "bg-blue-500 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              A–Z <SortIcon field="alphabetical" />
            </button>
            <button
              onClick={() => toggleSort("understanding")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                sortField === "understanding" ? "bg-blue-500 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Understanding <SortIcon field="understanding" />
            </button>
          </div>
        </div>

        {/* Grid */}
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredSorted.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500">
              No signs found matching "{searchQuery}".
            </div>
          ) : (
            filteredSorted.map(sign => {
              const pct = getUnderstanding(sign);
              return (
                <button
                  key={`${sign.category}-${sign.name}`}
                  onClick={() => setSelectedSign(sign)}
                  className="group flex flex-col items-start rounded-2xl border-2 border-slate-200 bg-white p-4 transition-all hover:-translate-y-1 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 text-left"
                >
                  {/* Icon */}
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-500 transition-colors group-hover:bg-blue-500 group-hover:text-white">
                    {sign.mediaType === "image" ? <ImageIcon size={20} /> : <Video size={20} />}
                  </div>

                  <h2 className="text-base font-bold text-slate-900 leading-tight">{sign.name}</h2>
                  <p className="mt-0.5 text-xs font-medium text-slate-400 mb-3">{sign.category}</p>

                  {/* Understanding — always reserve space to keep card height fixed */}
                  <div className="w-full mt-auto">
                    {pct === null ? (
                      <>
                        <div className="h-1.5" />
                        <p className="text-xs mt-1 font-medium text-slate-300">Not Learned</p>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-slate-500">Understanding</span>
                          <span className={`text-xs font-bold ${pct >= 80 ? "text-green-600" : pct >= 50 ? "text-yellow-500" : "text-red-500"}`}>
                            {pct}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${understandingColor(pct)}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className={`text-xs mt-1 font-medium ${pct >= 80 ? "text-green-600" : pct >= 50 ? "text-yellow-500" : "text-red-500"}`}>
                          {understandingLabel(pct)}
                        </p>
                      </>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </section>
      </main>

      {/* Modal */}
      {selectedSign && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedSign(null)}
        >
          <div
            className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-start justify-between border-b border-slate-100 p-6 sm:p-8">
              <div>
                <h3 className="text-3xl font-black text-slate-900">{selectedSign.name}</h3>
                <p className="mt-1 font-medium text-slate-500">{selectedSign.category}</p>
                {(() => {
                  const pct = getUnderstanding(selectedSign);
                  return pct !== null ? (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${understandingColor(pct)}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className={`text-sm font-bold ${pct >= 80 ? "text-green-600" : pct >= 50 ? "text-yellow-500" : "text-red-500"}`}>
                        {pct}% — {understandingLabel(pct)}
                      </span>
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-slate-400">Not yet learned in lessons</p>
                  );
                })()}
              </div>
              <button
                onClick={() => setSelectedSign(null)}
                className="rounded-full bg-slate-100 p-2 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal media */}
            <div className="bg-slate-50 p-6 sm:p-8">
              <div className={`relative flex w-full items-center justify-center overflow-hidden rounded-2xl shadow-inner ${
                selectedSign.mediaType === "image" ? "aspect-video bg-white border border-slate-200" : "bg-slate-900"
              }`}>
                {selectedSign.mediaType === "image" ? (
                  <img src={selectedSign.mediaSrc} alt={`Sign for ${selectedSign.name}`} className="h-full w-full object-contain p-4" />
                ) : (
                  <video
                    key={selectedSign.mediaSrc}
                    src={selectedSign.mediaSrc}
                    autoPlay loop muted playsInline
                    className="w-full h-full object-cover pointer-events-none"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
