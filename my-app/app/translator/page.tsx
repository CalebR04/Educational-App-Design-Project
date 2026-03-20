"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";
import Navbar from "../../components/Navbar";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const CAPTURE_INTERVAL = 500;

export default function TranslatorPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastLetterRef = useRef<string | null>(null);
  const holdCountRef = useRef(0);
  const requestInFlightRef = useRef(false);
  const HOLD_FRAMES = 3;

  const [cameraOn, setCameraOn] = useState(false);
  const [error, setError] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [letter, setLetter] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [word, setWord] = useState<string>("");
  const [holding, setHoldProgress] = useState(0);
  const [showInfo, setShowInfo] = useState(false);

  const capture_and_detect = useCallback(async () => {
    const video = videoRef.current;

    if (
      !video ||
      video.readyState < 2 ||
      !video.videoWidth ||
      !video.videoHeight ||
      requestInFlightRef.current
    ) {
      return;
    }

    requestInFlightRef.current = true;

    const offscreen = document.createElement("canvas");
    offscreen.width = video.videoWidth;
    offscreen.height = video.videoHeight;

    const ctx = offscreen.getContext("2d");
    if (!ctx) {
      requestInFlightRef.current = false;
      return;
    }

    ctx.drawImage(video, 0, 0);

    const b64 = offscreen.toDataURL("image/jpeg", 0.8);

    try {
      const res = await fetch(`${API_URL}/detect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: b64 }),
      });

      if (!res.ok) {
        console.error("Detect request failed:", res.status, res.statusText);
        return;
      }

      const data = await res.json();
      console.log("detect response:", data);

      setLetter(data.letter ?? null);
      setConfidence(data.confidence ?? null);
      setWord(data.word ?? "");

      if (data.letter) {
        if (data.letter === lastLetterRef.current) {
          holdCountRef.current = Math.min(
            holdCountRef.current + 1,
            HOLD_FRAMES
          );
        } else {
          holdCountRef.current = 1;
          lastLetterRef.current = data.letter;
        }

        setHoldProgress(holdCountRef.current / HOLD_FRAMES);
      } else {
        holdCountRef.current = 0;
        lastLetterRef.current = null;
        setHoldProgress(0);
      }
    } catch (err) {
      console.error("Detect error:", err);
    } finally {
      requestInFlightRef.current = false;
    }
  }, []);

  const startCamera = async () => {
    try {
      setError("");

      const video = videoRef.current;
      if (!video) {
        setError("Video element not ready.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      streamRef.current = stream;
      video.srcObject = stream;

      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => resolve();
      });

      await video.play();
      setCameraOn(true);
    } catch (err) {
      setError("Camera access denied or unavailable.");
      console.error(err);
    }
  };

  const startDetection = () => {
    const video = videoRef.current;

    if (!cameraOn || !video || !video.videoWidth || !video.videoHeight) {
      setError("Camera not ready yet. Try again.");
      return;
    }

    setError("");
    setDetecting(true);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(capture_and_detect, CAPTURE_INTERVAL);
  };

  const stopDetection = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    requestInFlightRef.current = false;
    setDetecting(false);
    setLetter(null);
    setConfidence(null);
    setHoldProgress(0);
  };

  const clearWord = async () => {
    try {
      await fetch(`${API_URL}/word`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear" }),
      });

      setWord("");
      holdCountRef.current = 0;
      lastLetterRef.current = null;
      setHoldProgress(0);
    } catch (err) {
      console.error(err);
    }
  };

  const backspaceWord = async () => {
    try {
      const res = await fetch(`${API_URL}/word`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "backspace" }),
      });

      if (!res.ok) return;

      const data = await res.json();
      setWord(data.word);
    } catch (err) {
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    requestInFlightRef.current = false;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }

    setCameraOn(false);
    setDetecting(false);
    setLetter(null);
    setConfidence(null);
    setHoldProgress(0);
    holdCountRef.current = 0;
    lastLetterRef.current = null;
  };

  useEffect(() => {
    return () => {
      requestInFlightRef.current = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#111827]">
      <Navbar active="Translate" />

      <main className="max-w-7xl mx-auto px-4 py-4">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">ASL Translator</h1>
            <p className="text-gray-600">
              Translate between ASL signs and text in real-time
            </p>
          </div>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 font-bold text-sm transition-all ${
              showInfo
                ? "border-blue-500 bg-blue-500 text-white"
                : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <Info className="w-4 h-4" /> Info
          </button>
        </div>

        {showInfo && (
          <div className="mb-4 rounded-2xl border-2 border-blue-200 bg-blue-50 px-6 py-6">
            <h3 className="flex items-center gap-2 text-2xl font-bold text-blue-900">
              🈯 How Translation Works
            </h3>
            <div className="mt-4 space-y-4 text-base text-blue-800">
              <p>
                <span className="font-bold">Sign to Text:</span> Use your camera to
                perform ASL signs. Our AI model detects hand landmarks and
                classifies signs in real-time.
              </p>
              <p>
                <span className="font-bold">Text to Sign:</span> Type any text and get
                a sequence of ASL signs to perform. Each sign includes video
                demonstrations.
              </p>
              <p className="text-sm text-blue-600">
                Note: This is a prototype. Real implementation would use trained
                gesture classification models.
              </p>
            </div>
          </div>
        )}

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border-2 border-gray-200 bg-white p-6">
            <h2 className="mb-5 text-2xl font-bold">📷 Sign Input</h2>

            <div className="relative flex h-[320px] items-center justify-center overflow-hidden rounded-2xl bg-[#071633]">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`h-full w-full object-cover ${cameraOn ? "block" : "hidden"}`}
              />

              {!cameraOn && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
                  <div className="text-5xl">📹</div>
                  <p className="mt-4 text-lg text-white/80">
                    Camera feed for sign detection
                  </p>
                </div>
              )}

              {detecting && letter && (
                <div className="absolute top-3 left-3 rounded-xl border border-blue-400 bg-black/70 px-4 py-2">
                  <span className="block text-center font-mono text-3xl font-bold text-blue-400">
                    {letter}
                  </span>
                  <div className="mt-1 h-1 w-full rounded-full bg-white/20">
                    <div
                      className="h-full rounded-full bg-blue-400 transition-all duration-100"
                      style={{ width: `${holding * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {detecting && confidence !== null && (
                <div className="absolute top-3 right-3 rounded-full bg-black/70 px-3 py-1 text-sm font-mono text-blue-300">
                  {(confidence * 100).toFixed(1)}%
                </div>
              )}
            </div>

            {error && (
              <p className="mt-4 text-sm font-medium text-red-600">{error}</p>
            )}

            <div className="mt-5 flex gap-3">
              {!cameraOn ? (
                <button
                  onClick={startCamera}
                  className="flex-1 rounded-xl bg-blue-500 px-6 py-4 text-lg font-semibold text-white hover:bg-blue-600"
                >
                  Start Camera
                </button>
              ) : (
                <>
                  {!detecting ? (
                    <button
                      onClick={startDetection}
                      className="flex-1 rounded-xl bg-green-500 px-6 py-4 text-lg font-semibold text-white hover:bg-green-600"
                    >
                      Start Detection
                    </button>
                  ) : (
                    <button
                      onClick={stopDetection}
                      className="flex-1 rounded-xl bg-yellow-500 px-6 py-4 text-lg font-semibold text-white hover:bg-yellow-600"
                    >
                      Stop Detection
                    </button>
                  )}

                  <button
                    onClick={stopCamera}
                    className="flex-1 rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Stop Camera
                  </button>
                </>
              )}
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={clearWord}
                className="flex-1 rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-200"
              >
                Clear Word
              </button>
              <button
                onClick={backspaceWord}
                className="flex-1 rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-200"
              >
                Backspace
              </button>
            </div>
          </div>

          <div className="rounded-2xl border-2 border-gray-200 bg-white p-6">
            <h2 className="mb-5 text-2xl font-bold">
              <span className="text-green-500">T</span> Text Output
            </h2>

            <div className="flex min-h-[200px] flex-wrap content-start gap-1 rounded-2xl bg-gray-50 p-4">
              {word ? (
                word.split("").map((ch, i) => (
                  <span
                    key={i}
                    className="font-mono text-2xl font-bold text-gray-800"
                  >
                    {ch}
                  </span>
                ))
              ) : (
                <p className="text-xl italic text-gray-400">
                  Translated text will appear here...
                </p>
              )}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}