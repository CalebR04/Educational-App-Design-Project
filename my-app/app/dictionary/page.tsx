import Navbar from "../../components/Navbar";

export default function DictionaryPage() {
  const signs = [
    { name: "Hello", category: "Greetings", difficulty: "Easy" },
    { name: "Thank You", category: "Greetings", difficulty: "Easy" },
    { name: "Please", category: "Greetings", difficulty: "Easy" },
    { name: "Sorry", category: "Greetings", difficulty: "Easy" },
    { name: "Help", category: "Common", difficulty: "Easy" },
    { name: "Friend", category: "Relationships", difficulty: "Medium" },
    { name: "Family", category: "Relationships", difficulty: "Medium" },
    { name: "Mother", category: "Relationships", difficulty: "Easy" },
    { name: "Father", category: "Relationships", difficulty: "Easy" },
    { name: "Brother", category: "Relationships", difficulty: "Medium" },
    { name: "Sister", category: "Relationships", difficulty: "Medium" },
    { name: "Love", category: "Relationships", difficulty: "Medium" },
    { name: "Food", category: "Daily Life", difficulty: "Easy" },
    { name: "Water", category: "Daily Life", difficulty: "Easy" },
    { name: "House", category: "Daily Life", difficulty: "Easy" },
    { name: "School", category: "Daily Life", difficulty: "Easy" },
  ];

  const categories = [
    "All",
    "Greetings",
    "Relationships",
    "Emotions",
    "Daily Life",
    "Common",
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar active="Dictionary" />

      <main className="w-full max-w-6xl mx-auto mt-8 px-4 pb-12">
        <section>
          <h1 className="text-4xl font-bold text-black">ASL Dictionary</h1>
          <p className="mt-2 text-lg text-gray-600">
            Browse and learn over 100 core ASL signs
          </p>
        </section>

        <section className="mt-6">
          <input
            type="text"
            placeholder="Search for a sign..."
            className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-700 outline-none focus:border-blue-400"
          />
        </section>

        <section className="mt-4 flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category}
              className={`rounded-lg border-2 px-4 py-2 text-sm font-semibold transition ${
                category === "All"
                  ? "border-blue-500 bg-blue-500 text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {category}
            </button>
          ))}
        </section>

        <section className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {signs.map((sign) => (
            <div
              key={sign.name}
              className="rounded-xl border-2 border-gray-200 bg-white p-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{sign.name}</h2>
                <span className="text-green-500 text-lg font-bold">✓</span>
              </div>

              <p className="mt-8 text-xs font-medium text-gray-500">
                {sign.category}
              </p>

              <div className="mt-3">
                <span
                  className={`rounded px-2 py-1 text-xs font-semibold ${
                    sign.difficulty === "Easy"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {sign.difficulty}
                </span>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}