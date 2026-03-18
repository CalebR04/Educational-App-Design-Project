"use client";

import { useState } from "react";
import { Search, BookOpen, Video, X, Camera, Image as ImageIcon } from "lucide-react";
import Navbar from "../../components/Navbar";
import Link from "next/link";

// --- TYPES ---
type SignData = {
  name: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  mediaType: "image" | "video";
  mediaSrc: string;
};

// --- DATA ---
// Alphabet Data
const alphabetSigns: SignData[] = Array.from({ length: 26 }, (_, i) => {
  const letter = String.fromCharCode(65 + i);
  return {
    name: letter,
    category: "Alphabet",
    difficulty: "Easy",
    mediaType: "image",
    mediaSrc: `/asl_images/${letter.toLowerCase()}.png`,
  };
});


// Words
const wordSigns: SignData[] = [
  { name: "Hello", category: "Greetings", difficulty: "Easy", mediaType: "video", mediaSrc: "" },
  { name: "Thank You", category: "Greetings", difficulty: "Easy", mediaType: "video", mediaSrc: "" },
  { name: "Please", category: "Greetings", difficulty: "Easy", mediaType: "video", mediaSrc: "" },
  { name: "Sorry", category: "Greetings", difficulty: "Easy", mediaType: "video", mediaSrc: "" },
  { name: "Help", category: "Daily Life", difficulty: "Easy", mediaType: "video", mediaSrc: "" },
  { name: "Friend", category: "Relationships", difficulty: "Medium", mediaType: "video", mediaSrc: "" },
  { name: "Family", category: "Relationships", difficulty: "Medium", mediaType: "video", mediaSrc: "" },
  { name: "Mother", category: "Relationships", difficulty: "Easy", mediaType: "video", mediaSrc: "" },
  { name: "Father", category: "Relationships", difficulty: "Easy", mediaType: "video", mediaSrc: "" },
  { name: "Brother", category: "Relationships", difficulty: "Medium", mediaType: "video", mediaSrc: "" },
  { name: "Sister", category: "Relationships", difficulty: "Medium", mediaType: "video", mediaSrc: "" },
  { name: "Love", category: "Relationships", difficulty: "Medium", mediaType: "video", mediaSrc: "" },
  { name: "Food", category: "Daily Life", difficulty: "Easy", mediaType: "video", mediaSrc: "" },
  { name: "Water", category: "Daily Life", difficulty: "Easy", mediaType: "video", mediaSrc: "" },
  { name: "Home", category: "Daily Life", difficulty: "Easy", mediaType: "video", mediaSrc: "https://player.vimeo.com/video/344359901?title=0&byline=0&portrait=0&background=1&loop=1" },
  { name: "School", category: "Daily Life", difficulty: "Easy", mediaType: "video", mediaSrc: "https://player.vimeo.com/video/345801623?title=0&byline=0&portrait=0&background=1&loop=1" },
  { name: "Me (I)", category: "Daily Life", difficulty: "Easy", mediaType: "video", mediaSrc: "https://player.vimeo.com/video/344400170?title=0&byline=0&portrait=0&background=1&loop=1"  }
];

// Combine both data sets
const allSigns = [...alphabetSigns, ...wordSigns];

const categories = [
  "All",
  "Alphabet",
  "Greetings",
  "Relationships",
  "Daily Life",
];

export default function DictionaryPage() {
  // --- STATE ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSign, setSelectedSign] = useState<SignData | null>(null);

  // --- FILTERING LOGIC ---
  const filteredSigns = allSigns.filter((sign) => {
    const matchesSearch = sign.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || sign.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar active="Dictionary" />

      <main className="w-full max-w-6xl mx-auto mt-8 px-4 pb-12">
        {/* Header */}
        <section>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">ASL Dictionary</h1>
          <p className="mt-2 text-lg text-slate-600">
            Browse and learn over 100 core ASL signs, including the full alphabet.
          </p>
        </section>

        {/* Search Bar */}
        <section className="mt-8 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search for a sign (e.g., 'Hello', 'A')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border-2 border-slate-200 bg-white pl-12 pr-4 py-4 text-slate-700 outline-none transition-colors focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />
        </section>

        {/* Category Tabs */}
        <section className="mt-6 flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-xl border-2 px-5 py-2.5 text-sm font-bold transition-all active:scale-95 ${
                selectedCategory === category
                  ? "border-blue-500 bg-blue-500 text-white shadow-md shadow-blue-500/20"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {category}
            </button>
          ))}
        </section>

        {/* The Grid */}
        <section className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredSigns.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500">
              No signs found matching "{searchQuery}".
            </div>
          ) : (
            filteredSigns.map((sign) => (
              <button
                key={sign.name}
                onClick={() => setSelectedSign(sign)}
                className="group flex flex-col items-start rounded-2xl border-2 border-slate-200 bg-white p-5 transition-all hover:-translate-y-1 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 text-left"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-500 transition-colors group-hover:bg-blue-500 group-hover:text-white">
                  {sign.mediaType === "image" ? <ImageIcon size={24} /> : <Video size={24} />}
                </div>

                <h2 className="text-xl font-bold text-slate-900">{sign.name}</h2>
                <p className="mt-1 text-sm font-medium text-slate-500">{sign.category}</p>

                <div className="mt-4 mt-auto">
                  <span
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                      sign.difficulty === "Easy"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {sign.difficulty}
                  </span>
                </div>
              </button>
            ))
          )}
        </section>
      </main>

      {/* --- THE MODAL OVERLAY --- */}
      {selectedSign && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedSign(null)}
        >
          <div 
            className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 p-6 sm:p-8">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-3xl font-black text-slate-900">{selectedSign.name}</h3>
                  <span className={`rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                      selectedSign.difficulty === "Easy" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}>
                    {selectedSign.difficulty}
                  </span>
                </div>
                <p className="mt-1 font-medium text-slate-500">{selectedSign.category}</p>
              </div>
              <button 
                onClick={() => setSelectedSign(null)} 
                className="rounded-full bg-slate-100 p-2 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Media Player */}
            <div className="bg-slate-50 p-6 sm:p-8">
              <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-900 shadow-inner">
                
                {selectedSign.mediaType === "image" ? (
                  // ALPHABET IMAGES
                  <img 
                    src={selectedSign.mediaSrc} 
                    alt={`Sign for ${selectedSign.name}`} 
                    className="h-full w-full object-contain p-4"
                  />
                ) : (
                  // VIDEOS
                  <iframe 
                    src={`${selectedSign.mediaSrc}?title=0&byline=0&portrait=0&autoplay=1&loop=1&muted=1`}
                    className="absolute inset-0 h-full w-full"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                  />
                )}

              </div>

              {/* Instructions / CTA */}
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">Ready to try it yourself?</h4>
                  <p className="text-sm text-slate-600">Practice your handshape using the AI camera.</p>
                </div>
                <Link 
                  href="/lessons"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-blue-500 px-6 py-4 font-bold text-white transition-colors hover:bg-blue-600 active:scale-95 sm:w-auto w-full"
                >
                  <Camera size={20} /> Practice Now
                </Link>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}