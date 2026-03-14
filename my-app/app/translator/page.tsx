"use client";

import { useEffect, useRef, useState } from "react";
import Navbar from "../../components/Navbar";

export default function TranslatorPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [error, setError] = useState("");

  const startCamera = async () => {
    try {
      setError("");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraOn(true);
    } catch (err) {
      setError("Camera access denied or unavailable.");
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOn(false);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#111827]">
      <Navbar active="Translate" />

      <main className="w-full max-w-6xl mx-auto mt-8 px-4 pb-12">
        <section>
          <h1 className="text-4xl font-bold text-[#0f172a]">ASL Translator</h1>
          <p className="mt-2 text-lg text-gray-600">
            Translate between ASL signs and text in real-time
          </p>
        </section>

        <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border-2 border-gray-200 bg-white p-6">
            <h2 className="mb-5 text-2xl font-bold">📷 Sign Input</h2>

            <div className="flex h-[320px] items-center justify-center overflow-hidden rounded-2xl bg-[#071633]">
              {cameraOn ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-center text-white">
                  <div className="text-5xl">📹</div>
                  <p className="mt-4 text-lg text-white/80">
                    Camera feed for sign detection
                  </p>
                </div>
              )}
            </div>

            {error && (
              <p className="mt-4 text-sm font-medium text-red-600">{error}</p>
            )}

            <div className="mt-5 flex gap-3">
              <button
                onClick={startCamera}
                className="flex-1 rounded-xl bg-blue-500 px-6 py-4 text-lg font-semibold text-white hover:bg-blue-600"
              >
                Start Camera
              </button>

              <button
                onClick={stopCamera}
                className="flex-1 rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg font-semibold text-gray-700 hover:bg-gray-50"
              >
                Stop Camera
              </button>
            </div>
          </div>

          <div className="rounded-2xl border-2 border-gray-200 bg-white p-6">
            <h2 className="mb-5 text-2xl font-bold">
              <span className="text-green-500">T</span> Text Output
            </h2>

            <div className="flex h-[320px] items-center justify-center rounded-2xl bg-gray-50 text-center">
              <p className="text-xl text-gray-400">
                Translated text will appear here...
              </p>
            </div>
          </div>
        </section>
        <section className="mt-8 rounded-2xl border-2 border-blue-200 bg-blue-50 px-6 py-6">
            <h3 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
                🈯 How Translation Works
            </h3>

            <div className="mt-4 space-y-4 text-base text-blue-800">

                <p>
                <span className="font-bold">Sign to Text:</span> Use your camera to
                perform ASL signs. Our AI model (MediaPipe + CNN) detects hand
                landmarks and classifies signs in real-time.
                </p>

                <p>
                <span className="font-bold">Text to Sign:</span> Type any text and get a
                sequence of ASL signs to perform. Each sign includes video
                demonstrations.
                </p>

                <p className="text-sm text-blue-600">
                Note: This is a prototype. Real implementation would use trained
                gesture classification models.
                </p>

            </div>
            </section>
      </main>
    </div>
  );
}