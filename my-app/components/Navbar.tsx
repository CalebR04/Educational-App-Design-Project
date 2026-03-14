import Link from "next/link";

type NavbarProps = {
  active: string;
};

export default function Navbar({ active }: NavbarProps) {
  const tabs = [
    { name: "Home", href: "/", icon: "⌂" },
    { name: "Lessons", href: "/lessons", icon: "✎" },
    { name: "Dictionary", href: "/dictionary", icon: "📖" },
    { name: "Games", href: "/games", icon: "🎮" },
    { name: "Translate", href: "/translator", icon: "💬" },
    { name: "Profile", href: "/profile", icon: "◔" },
  ];

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-lg font-bold text-white">
            SQ
          </div>
          <span className="text-4xl font-bold text-[#0f172a]">SignQuest</span>
        </div>

        <nav className="flex items-center gap-2">
          {tabs.map((tab) => {
            const isActive = tab.name === active;

            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`flex items-center gap-2 rounded-xl px-4 py-3 text-xl font-semibold transition ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-[#334155] hover:bg-gray-50"
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.name}</span>
              </Link>
            );
          })}
        </nav>

        <button className="text-2xl text-[#475569] hover:text-[#0f172a] transition">
          ⚙
        </button>
      </div>
    </header>
  );
}