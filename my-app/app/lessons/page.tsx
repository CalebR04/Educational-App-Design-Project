import Navbar from "@/components/Navbar";

export default function LessonsPage() {
  const lessons = [
    {
      title: "ASL Basics",
      description: "Learn foundational signs and gestures.",
      progress: "25%",
    },
    {
      title: "Common Greetings",
      description: "Practice everyday greeting signs.",
      progress: "60%",
    },
    {
      title: "Daily Conversations",
      description: "Build confidence with real-life signing.",
      progress: "10%",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <Navbar active="Lessons" />

      <main className="max-w-6xl mx-auto px-8 py-10">
        <section>
          <h1 className="text-4xl font-bold text-[#0f172a]">Lessons</h1>
          <p className="mt-2 text-lg text-gray-600">
            Learn ASL step by step with guided lessons
          </p>
        </section>

        <section className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {lessons.map((lesson) => (
            <div
              key={lesson.title}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-2xl font-bold text-[#0f172a]">
                {lesson.title}
              </h2>
              <p className="mt-2 text-gray-600">{lesson.description}</p>

              <div className="mt-6">
                <div className="flex justify-between text-sm font-medium text-[#0f172a] mb-2">
                  <span>Progress</span>
                  <span>{lesson.progress}</span>
                </div>

                <div className="h-3 rounded-full bg-gray-200">
                  <div
                    className="h-3 rounded-full bg-blue-500"
                    style={{ width: lesson.progress }}
                  />
                </div>
              </div>

              <button className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700 transition">
                Continue Lesson
              </button>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}