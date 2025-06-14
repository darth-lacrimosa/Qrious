"use client";
import { useState, useEffect, useRef } from "react";
import { questions } from "./data/question";
import { FlipText } from "../components/FlipText";
import gsap from "gsap";
import { Progress } from "@/components/ui/progress";

const allQuestions = Object.values(questions).flat();

export default function Home() {
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentImage, setCurrentImage] = useState<{
    src: string;
    position: { x: number; y: number };
    naturalSize: { width: number; height: number };
    aspect: string;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageIndex = useRef(0);
  const totalImages = 9;
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [cooldown, setCooldown] = useState(false);
  const [progress, setProgress] = useState(100);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [menuOpen, setMenuOpen] = useState(false);

  const getRandomQuestion = () => {
    if (cooldown) return;

    // Get questions based on selected category
    const questionPool =
      selectedCategory === "all"
        ? allQuestions
        : questions[selectedCategory as keyof typeof questions];

    const random =
      questionPool[Math.floor(Math.random() * questionPool.length)];

    if (isFirstLoad) setIsFirstLoad(false);
    setCurrentQuestion(random);
    showRandomImage();

    // Cooldown logic
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

  const showRandomImage = () => {
    if (imageIndex.current >= totalImages) {
      imageIndex.current = 0; // Reset if we've shown all images
    }

    const randomNum = (imageIndex.current % totalImages) + 1;
    imageIndex.current++;

    // Random position (avoiding center where text appears)
    let x = 0;
    let y = 0;
    const positionCase = Math.floor(Math.random() * 4);

    switch (positionCase) {
      case 0: // Top-right
        x = Math.random() * 30 + 60;
        y = Math.random() * 30 + 10;
        break;
      case 1: // Bottom-left
        x = Math.random() * 30 + 10;
        y = Math.random() * 30 + 60;
        break;
      case 2: // Top-left
        x = Math.random() * 30 + 10;
        y = Math.random() * 30 + 10;
        break;
      case 3: // Bottom-right
        x = Math.random() * 30 + 60;
        y = Math.random() * 30 + 60;
        break;
    }

    // Create a new image element to get natural dimensions
    const img = new Image();
    img.src = `/images/${randomNum}.jpg`;
    img.onload = () => {
      const aspect = img.width > img.height ? "landscape" : "portrait";

      // Calculate 80% of original size while maintaining aspect ratio
      const scaleFactor = 0.3;
      const width = img.width * scaleFactor;
      const height = img.height * scaleFactor;

      setCurrentImage({
        src: `/images/${randomNum}.jpg`,
        position: { x, y },
        naturalSize: { width, height },
        aspect,
      });
    };
  };

  // Animate image when it appears
  useEffect(() => {
    if (!currentImage || !containerRef.current) return;

    const imgElement = containerRef.current.querySelector(".random-image");
    if (!imgElement) return;

    // Pixelated reveal effect
    gsap.fromTo(
      imgElement,
      {
        scale: 0.5,
        opacity: 0,
      },
      {
        scale: 1,
        opacity: 0.4,
        duration: 1.2,
        ease: "power3.out",
      }
    );

    // Pixel grid animation
    const pixels = Array.from({ length: 100 }, (_, i) => {
      const pixel = document.createElement("div");
      pixel.className = "absolute bg-black";
      pixel.style.width = "10%";
      pixel.style.height = "10%";
      pixel.style.left = `${(i % 10) * 10}%`;
      pixel.style.top = `${Math.floor(i / 10) * 10}%`;
      pixel.style.opacity = "1";
      return pixel;
    });

    const pixelContainer = imgElement.querySelector(".pixel-container");
    if (pixelContainer) {
      pixels.forEach((pixel) => pixelContainer.appendChild(pixel));

      // Animate pixels with random delays
      gsap.to(pixels, {
        opacity: 0,
        duration: 0.5,
        stagger: {
          each: 0.02,
          from: "random",
        },
        ease: "power2.out",
        onComplete: () => {
          // Remove pixels after animation
          while (pixelContainer.firstChild) {
            pixelContainer.removeChild(pixelContainer.firstChild);
          }
        },
      });
    }
  }, [currentImage]);

  return (
    <main
      className={`flex flex-col items-center justify-center min-h-screen bg-black p-4 md:p-8 relative overflow-hidden ${
        cooldown ? "cursor-not-allowed" : "cursor-pointer"
      }`}
      onClick={getRandomQuestion}
      ref={containerRef}
    >
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1.5 z-[100]">
        <Progress
          value={progress}
          className="h-full rounded-none bg-transparent"
          indicatorColor="bg-slate-50"
          style={{
            transform: "scaleX(-1)",
            transformOrigin: "center",
          }}
        />
      </div>

      {/* Brand & Filter Container - Kiri Atas */}
      <div className="absolute top-4 md:top-8 left-4 md:left-8 z-50 flex items-center space-x-6 w-auto">
        {/* Brand QRIOUS */}
        <div className="text-white text-lg md:text-xl tracking-[0.3em] font-bold">
          QRIOUS
        </div>

        {/* Category Filter - Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          {["all", ...Object.keys(questions)].map((category) => (
            <button
              key={category}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCategory(category);
              }}
              className={`text-white text-sm uppercase tracking-widest relative pb-1 ${
                selectedCategory === category
                  ? "after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-white"
                  : "opacity-70 hover:opacity-100"
              } transition-all`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Hamburger - Mobile */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen(!menuOpen);
        }}
        className="md:hidden absolute top-4 right-4 text-white text-xl z-50"
      >
        ☰
      </button>

      {/* Dropdown Menu - Mobile */}
      {menuOpen && (
        <div className="md:hidden absolute top-14 left-1/2 -translate-x-1/2 z-50 bg-black/90 backdrop-blur-md rounded shadow-lg px-6 py-4 text-white text-center space-y-3">
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
                  ? "after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-white"
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
            mixBlendMode: "lighten",
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

      {/* Desain Baru: Garis Dekoratif */}
      <div className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none">
        {/* Garis horizontal */}
        <div className="absolute top-1/4 left-0 right-0 h-px bg-gray-700 transform -translate-y-1/2"></div>
        <div className="absolute top-3/4 left-0 right-0 h-px bg-gray-700 transform -translate-y-1/2"></div>

        {/* Garis vertikal */}
        <div className="absolute left-3/4 top-0 bottom-0 w-px bg-gray-700 transform -translate-x-1/2"></div>

        {/* Garis diagonal */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-0 left-1/3 w-0.5 h-full bg-gray-700 transform -translate-x-1/2 rotate-45 origin-top"></div>
        </div>
      </div>

      {/* Konten Utama - Desain Baru */}
      <div className="w-full max-w-4xl mx-auto cursor-pointer px-4 relative z-20">
        {currentQuestion ? (
          <div className="group relative py-8 md:py-16">
            <FlipText
              text={currentQuestion}
              className="text-3xl md:text-6xl font-bold leading-tight tracking-[.03em] text-center text-white font-marios"
            />

            {/* Teks kecil di bawah pertanyaan */}
            <p className="mt-4 md:mt-8 text-gray-500 text-center text-xs md:text-sm tracking-widest">
              REFLECT • SHARE • CONNECT
            </p>
          </div>
        ) : isFirstLoad ? (
          <div className="relative py-8 md:py-16">
            <h1 className="text-3xl md:text-6xl font-bold text-center leading-tight tracking-[.03em] text-white font-marios">
              BEGIN THE CONVERSATION
            </h1>

            <p className="mt-4 md:mt-8 text-gray-500 text-center text-xs md:text-sm tracking-widest">
              CLICK ANYWHERE TO START
            </p>
          </div>
        ) : null}
      </div>

      {/* Copyright - Hidden on mobile */}
      <div className="hidden md:block absolute bottom-8 left-8 text-gray-600 text-sm">
        ©2025
      </div>

      {/* Instruksi - Hidden on mobile */}
      <div className="hidden md:block absolute bottom-8 right-8 text-gray-500 text-sm font-light">
        CLICK TO CONTINUE
      </div>
    </main>
  );
}
