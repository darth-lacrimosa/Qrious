"use client";
import { useState, useRef, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { RandomImage, useRandomImage } from "./utils/randomImage";
import { questions } from "./data/question";
import { FlipText } from "@/components/FlipText";
import { SettingsPanel } from "@/components/SettingsPanel";

const allQuestions = Object.values(questions).flat();

export default function Home() {
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentImage, setCurrentImage] = useState<RandomImage | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [cooldown, setCooldown] = useState(false);
  const [progress, setProgress] = useState(100);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const { getRandomImage, animateImage } = useRandomImage(9);

  const getRandomQuestion = () => {
    if (cooldown) return;

    const questionPool =
      selectedCategory === "all"
        ? allQuestions
        : questions[selectedCategory as keyof typeof questions];

    const random =
      questionPool[Math.floor(Math.random() * questionPool.length)];

    if (isFirstLoad) setIsFirstLoad(false);
    setCurrentQuestion(random);
    showRandomImage();

    setCooldown(true);
    setProgress(100);
    const duration = 6000;
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (elapsed >= duration) {
        clearInterval(interval);
        setCooldown(false);
      }
    }, 16);

    return () => clearInterval(interval);
  };

  const showRandomImage = async () => {
    const image = await getRandomImage();
    setCurrentImage(image);
  };

  useEffect(() => {
    if (currentImage && containerRef.current) {
      const imgElement =
        containerRef.current.querySelector<HTMLElement>(".random-image");
      animateImage(imgElement);
    }
  }, [currentImage]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <main
      className={`flex flex-col items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 p-4 md:p-8 relative overflow-hidden`}
      ref={containerRef}
    >
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1.5 z-[100]">
        <Progress
          value={progress}
          className="h-full rounded-none bg-transparent"
          indicatorColor="bg-neutral-900 dark:bg-neutral-50"
          style={{
            transform: "scaleX(-1)",
            transformOrigin: "center",
          }}
        />
      </div>

      {/* Brand - Top Left */}
      <div className="absolute top-4 md:top-8 left-4 md:left-8 z-50">
        <div className="text-neutral-900 dark:text-neutral-50 text-lg md:text-xl tracking-[0.3em] font-bold">
          QRIOUS
        </div>
      </div>
      {/* Category Filter - Top Right */}
      <div className="absolute top-4 md:top-8 right-4 md:right-8 z-50 flex items-center">
        {/* Category Filter - Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          {["all", ...Object.keys(questions)].map((category) => (
            <button
              key={category}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCategory(category);
              }}
              className={`text-neutral-900 dark:text-neutral-50 text-sm uppercase tracking-widest relative pb-1 ${
                selectedCategory === category
                  ? "after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-neutral-900 dark:after:bg-neutral-50"
                  : "opacity-70 hover:opacity-100"
              } transition-all`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Hamburger - Mobile */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
          className="md:hidden text-neutral-900 dark:text-neutral-50 text-xl"
        >
          ☰
        </button>
      </div>

      {/* Dropdown Menu - Mobile */}
      {menuOpen && (
        <div className="md:hidden absolute top-14 right-4 z-50 bg-neutral-100/90 dark:bg-neutral-900/90 backdrop-blur-md rounded shadow-lg px-6 py-4 text-neutral-900 dark:text-neutral-50 text-center space-y-3">
          {["all", ...Object.keys(questions)].map((category) => (
            <button
              key={category}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCategory(category);
                setMenuOpen(false);
              }}
              className={`block w-full text-base uppercase tracking-widest relative pb-1 ${
                selectedCategory === category
                  ? "after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-neutral-900 dark:after:bg-neutral-50"
                  : "opacity-70 hover:opacity-100"
              } transition-all`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {/* Random Images - Responsive size */}
      {currentImage && (
        <div
          className="random-image pixel-overlay absolute pointer-events-none"
          style={{
            width: `${
              currentImage.naturalSize.width *
              (window.innerWidth < 768 ? 0.5 : 1)
            }px`,
            height: `${
              currentImage.naturalSize.height *
              (window.innerWidth < 768 ? 0.5 : 1)
            }px`,
            left: `${currentImage.position.x}%`,
            top: `${currentImage.position.y}%`,
            transform: `translate(-50%, -50%)`,
            zIndex: 0,
            mixBlendMode: darkMode ? "lighten" : "multiply",
            willChange: "transform, opacity",
          }}
        >
          <img
            src={currentImage.src}
            alt=""
            className="w-full h-full object-cover"
            style={{
              filter: "grayscale(100%) contrast(120%)",
            }}
          />
          <div className="pixel-container absolute inset-0 pointer-events-none"></div>
        </div>
      )}

      {/* Decorative Lines */}
      <div className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none">
        {/* Horizontal lines */}
        <div className="absolute top-1/4 left-0 right-0 h-px bg-neutral-200 dark:bg-neutral-800 transform -translate-y-1/2"></div>
        <div className="absolute top-3/4 left-0 right-0 h-px bg-neutral-200 dark:bg-neutral-800 transform -translate-y-1/2"></div>

        {/* Vertical lines */}
        <div className="absolute left-3/4 top-0 bottom-0 w-px bg-neutral-200 dark:bg-neutral-800 transform -translate-x-1/2"></div>

        {/* Diagonal lines */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-0 left-1/3 w-0.5 h-full bg-neutral-200 dark:bg-neutral-800 transform -translate-x-1/2 rotate-45 origin-top"></div>
        </div>
      </div>

      {/* Main Content - Area yang bisa diklik untuk pengacakan */}
      <div
        className="w-full max-w-4xl mx-auto px-4 relative z-20"
        onClick={!cooldown ? getRandomQuestion : undefined}
        style={{ cursor: cooldown ? "not-allowed" : "pointer" }}
      >
        {currentQuestion ? (
          <div className="group relative py-8 md:py-16">
            <FlipText
              text={currentQuestion}
              className="text-3xl md:text-6xl font-bold leading-tight tracking-[.03em] text-center text-neutral-900 dark:text-neutral-50 font-marios"
              audioEnabled={audioEnabled}
            />
            <p className="mt-4 md:mt-8 text-neutral-500 dark:text-neutral-400 text-center text-xs md:text-sm tracking-widest">
              REFLECT • SHARE • CONNECT
            </p>
          </div>
        ) : isFirstLoad ? (
          <div className="relative py-8 md:py-16">
            <h1 className="text-3xl md:text-6xl font-bold text-center leading-tight tracking-[.03em] text-neutral-900 dark:text-neutral-50 font-marios">
              BEGIN THE CONVERSATION
            </h1>
            <p className="mt-4 md:mt-8 text-neutral-500 dark:text-neutral-400 text-center text-xs md:text-sm tracking-widest">
              CLICK HERE TO START
            </p>
          </div>
        ) : null}
      </div>

      {/* Copyright - Hidden on mobile */}
      <div className="hidden md:block absolute bottom-8 left-8 text-neutral-500 dark:text-neutral-400 text-sm">
        ©2025
      </div>

      {/* Settings Panel */}
      <div className="absolute bottom-8 right-8">
        <SettingsPanel
          audioEnabled={audioEnabled}
          setAudioEnabled={setAudioEnabled}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
      </div>
    </main>
  );
}
