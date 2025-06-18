
import { gsap } from "gsap";
import { useRef } from "react";

export interface RandomImage {
  src: string;
  position: { x: number; y: number };
  naturalSize: { width: number; height: number };
  aspect: string;
}

export const useRandomImage = (totalImages: number) => {
  const imageIndex = useRef(0);
  
  const getRandomImage = (): Promise<RandomImage> => {
    return new Promise((resolve) => {
      if (imageIndex.current >= totalImages) {
        imageIndex.current = 0;
      }

      const randomNum = (imageIndex.current % totalImages) + 1;
      imageIndex.current++;

      const positionCase = Math.floor(Math.random() * 4);
      let x = 0;
      let y = 0;

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

      const img = new Image();
      img.src = `/images/${randomNum}.jpg`;
      img.onload = () => {
        const aspect = img.width > img.height ? "landscape" : "portrait";
        const scaleFactor = 0.3;
        const width = img.width * scaleFactor;
        const height = img.height * scaleFactor;

        resolve({
          src: `/images/${randomNum}.jpg`,
          position: { x, y },
          naturalSize: { width, height },
          aspect,
        });
      };
    });
  };

  const animateImage = (imageElement: HTMLElement | null) => {
    if (!imageElement) return;

    gsap.fromTo(
      imageElement,
      { scale: 0.5, opacity: 0 },
      { scale: 1, opacity: 0.4, duration: 1.2, ease: "power3.out" }
    );

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

    const pixelContainer = imageElement.querySelector(".pixel-container");
    if (pixelContainer) {
      pixels.forEach((pixel) => pixelContainer.appendChild(pixel));

      gsap.to(pixels, {
        opacity: 0,
        duration: 0.5,
        stagger: {
          each: 0.02,
          from: "random",
        },
        ease: "power2.out",
        onComplete: () => {
          while (pixelContainer.firstChild) {
            pixelContainer.removeChild(pixelContainer.firstChild);
          }
        },
      });
    }
  };

  return { getRandomImage, animateImage };
};