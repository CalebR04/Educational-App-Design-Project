import Link from "next/link";

export default function TranslatorPage() {
  const tabs = [
    { name: "Home", href: "/" },
    { name: "Lessons", href: "/lessons" },
    { name: "Dictionary", href: "/dictionary" },
    { name: "Games", href: "/games" },
    { name: "Translate", href: "/translator" },
    { name: "Profile", href: "/profile" },
  ];

  const activeTab = "Translate";

  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center border-b border-gray-200 p-4 relative">
        <div className="text-2xl font-bold text-black">SignQuest</div>

        <nav className="absolute left-1/2 -translate-x-1/2 transform flex space-x-6">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              href={tab.href}
              className={`font-bold ${
                tab.name === activeTab
                  ? "text-blue-600"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              {tab.name}
            </Link>
          ))}
        </nav>
      </header>

      <main className="px-8 py-10">
        <h1 className="text-4xl font-bold text-black">Translator</h1>
        <p className="text-gray-500 text-xl mt-2">Translate ASL in real time</p>

        <div className="mt-8 w-full max-w-6xl h-[420px] bg-black flex flex-col items-center justify-center">
          <div className="w-28 h-20 bg-gray-300 rounded-2xl relative mb-6">
            <div className="absolute top-1/2 -right-4 -translate-y-1/2 w-6 h-10 bg-gray-300 rounded-r-md"></div>
          </div>
          <p className="text-white text-2xl">Begin signing to your camera</p>
        </div>

        <h2 className="text-3xl font-semibold mt-8 text-black">
          Real time translation...
        </h2>
      </main>
    </div>
  );
}