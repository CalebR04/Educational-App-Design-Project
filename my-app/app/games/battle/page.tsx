import Navbar from "../../../components/Navbar";

export default function BattlePage() {
  return (
    <div className="min-h-screen bg-white text-[#111827]">
      <Navbar active="Games" />

      <main className="w-full max-w-6xl mx-auto mt-8 px-4 pb-12">
        <h1 className="text-4xl font-bold text-black">Sign Battle</h1>
        <p className="mt-2 text-lg text-gray-600">
          Compete against opponents in ASL challenges.
        </p>
      </main>
    </div>
  );
}