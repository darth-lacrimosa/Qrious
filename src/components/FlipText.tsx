import { useEffect, useState, useRef } from "react";

interface FlipTextProps {
  text: string;
  className?: string;
}

const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789?!. ";

export const FlipText = ({ text, className }: FlipTextProps) => {
  const words = text.toUpperCase().split(" ");
  const [displayWords, setDisplayWords] = useState<string[][]>([]);
  const lastHoverTimes = useRef<Record<string, number>>({});
  const audioPool = useRef<HTMLAudioElement[]>([]);
  const audioInitialized = useRef(false);

  // Initialize audio pool
  useEffect(() => {
    if (!audioInitialized.current) {
      audioPool.current = Array(10)
        .fill(null)
        .map(() => {
          const audio = new Audio("/audio/flap.wav");
          audio.volume = 0.3;
          audio.load(); // Force load audio
          return audio;
        });
      audioInitialized.current = true;
    }
  }, []);

  const playAudio = () => {
    const audio = audioPool.current.find((a) => a.readyState === 4 && a.paused);
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  };

  useEffect(() => {
    let currentIndex = 0;
    let timeout: NodeJS.Timeout;

    const animateWord = (index: number) => {
      const word = words[index];
      let frame = 0;
      const maxFrames = 15;

      // Play initial audio immediately
      playAudio();

      const interval = setInterval(() => {
        setDisplayWords((prev) => {
          const newWords = [...prev];
          newWords[index] = word
            .split("")
            .map((char, i) =>
              frame >= maxFrames
                ? word[i]
                : Math.random() > 0.5
                ? characters[Math.floor(Math.random() * characters.length)]
                : char
            );
          return newWords;
        });

        // Play audio randomly during animation
        if (frame % 2 === 0 && Math.random() > 0.1) {
          playAudio();
        }

        frame++;
        if (frame > maxFrames) clearInterval(interval);
      }, 30);
    };

    setDisplayWords(words.map(() => []));
    const loop = () => {
      if (currentIndex < words.length) {
        animateWord(currentIndex);
        currentIndex++;
        timeout = setTimeout(loop, 100);
      }
    };
    loop();

    return () => clearTimeout(timeout);
  }, [text]);

  const handleHover = (wordIndex: number, charIndex: number) => {
    const key = `${wordIndex}-${charIndex}`;
    const now = Date.now();
    const last = lastHoverTimes.current[key] || 0;
    const cooldown = 5000; // 5 detik

    if (now - last < cooldown) return;
    lastHoverTimes.current[key] = now;

    let frame = 0;
    const maxFrames = 5;
    const interval = setInterval(() => {
      setDisplayWords((prev) => {
        const newWords = [...prev];
        const word = newWords[wordIndex] ?? [];
        if (!word[charIndex]) return prev;

        word[charIndex] =
          frame >= maxFrames
            ? words[wordIndex][charIndex]
            : characters[Math.floor(Math.random() * characters.length)];
        newWords[wordIndex] = word;
        return [...newWords];
      });

      frame++;
      if (frame > maxFrames) clearInterval(interval);
    }, 25);
  };

  return (
    <div
      className={`whitespace-pre-wrap break-words ${className}`}
      style={{ wordBreak: "break-word" }}
    >
      {displayWords.map((word, wIdx) => (
        <span key={wIdx} className="inline-block mr-2 mb-1">
          {word.map((char, cIdx) => (
            <span
              key={cIdx}
              onMouseEnter={() => handleHover(wIdx, cIdx)}
              className="inline-block transition-all duration-75"
            >
              {char}
            </span>
          ))}
          {/* Tambahkan spasi setelah setiap kata */}
          {wIdx < displayWords.length - 1 && (
            <span className="inline-block w-2" aria-hidden="true">
              &nbsp;
            </span>
          )}
        </span>
      ))}
    </div>
  );
};
