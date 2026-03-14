import Link from "next/link";

type NavbarProps = {
  active: string;
};

export default function Navbar({ active }: NavbarProps) {
  const tabs = [
    { name: "Home", href: "/" },
    { name: "Lessons", href: "/lessons" },
    { name: "Dictionary", href: "/dictionary" },
    { name: "Games", href: "/games" },
    { name: "Translate", href: "/translator" },
    { name: "Profile", href: "/profile" },
  ];

  return (
    <header className="flex items-center border-b border-gray-200 p-4 relative bg-white">
      <div className="text-2xl font-bold text-black">SignQuest</div>

      <nav className="absolute left-1/2 -translate-x-1/2 transform flex space-x-6">
        {tabs.map((tab) => (
          <Link
            key={tab.name}
            href={tab.href}
            className={`font-bold ${
              tab.name === active
                ? "text-blue-600"
                : "text-gray-700 hover:text-gray-900"
            }`}
          >
            {tab.name}
          </Link>
        ))}
      </nav>

      <div className="w-[120px]" />
    </header>
  );
}