// components/FlipText.tsx
import { useEffect, useState, useRef } from "react";

interface FlipTextProps {
  text: string;
  className?: string;
  audioEnabled?: boolean;
}

const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789?!. ";

export const FlipText = ({
  text,
  className,
  audioEnabled = true,
}: FlipTextProps) => {
  const words = text.toUpperCase().split(" ");
  const [displayWords, setDisplayWords] = useState<string[][]>([]);
  const lastHoverTimes = useRef<Record<string, number>>({});
  const audioPool = useRef<HTMLAudioElement[]>([]);
  const animationRefs = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    // Initialize audio pool
    if (audioEnabled) {
      audioPool.current = Array(10)
        .fill(null)
        .map(() => {
          const audio = new Audio("/audio/flap.wav");
          audio.volume = 0.3;
          audio.load();
          return audio;
        });
    }

    return () => {
      // Cleanup audio and animations
      audioPool.current.forEach((audio) => audio.pause());
      animationRefs.current.forEach(clearTimeout);
    };
  }, [audioEnabled]);

  const playAudio = () => {
    if (!audioEnabled) return;
    const audio = audioPool.current.find((a) => a.readyState === 4 && a.paused);
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  };

  useEffect(() => {
    // Clear any ongoing animations
    animationRefs.current.forEach(clearTimeout);
    animationRefs.current = [];

    setDisplayWords(words.map(() => []));

    const animateAllWords = async () => {
      for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
        await new Promise<void>((resolve) => {
          const word = words[wordIndex];
          let frame = 0;
          const maxFrames = 15;

          // Play initial audio
          playAudio();

          const interval = setInterval(() => {
            setDisplayWords((prev) => {
              const newWords = [...prev];
              newWords[wordIndex] = word
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
            if (frame > maxFrames) {
              clearInterval(interval);
              resolve();
            }
          }, 30);

          animationRefs.current.push(interval as unknown as NodeJS.Timeout);
        });

        // Small delay between words
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    };

    const timeout = setTimeout(animateAllWords, 100);
    animationRefs.current.push(timeout);

    return () => {
      animationRefs.current.forEach(clearTimeout);
    };
  }, [text, audioEnabled]);

  const handleHover = (wordIndex: number, charIndex: number) => {
    const key = `${wordIndex}-${charIndex}`;
    const now = Date.now();
    const last = lastHoverTimes.current[key] || 0;
    const cooldown = 5000;

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

    animationRefs.current.push(interval as unknown as NodeJS.Timeout);
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
          {wIdx < displayWords.length - 1 && (
            <span className="inline-block w-2">&nbsp;</span>
          )}
        </span>
      ))}
    </div>
  );
};
