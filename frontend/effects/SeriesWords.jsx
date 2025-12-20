import React, { useState, useEffect } from 'react';

const SeriesWords = ({ text, speed = 30 }) => {
  const [displayText, setDisplayText] = useState(text);
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

  useEffect(() => {
    let iteration = 0;
    let interval = null;

    interval = setInterval(() => {
      setDisplayText((prev) => 
        text
          .split("")
          .map((letter, index) => {
            // If the iteration has passed this index, show the real letter
            if (index < iteration) {
              return text[index];
            }
            // Otherwise, show a random character
            // return characters[Math.floor(Math.random() * characters.length)];
          })
          .join("")
      );

      // Stop the animation when all letters are revealed
      if (iteration >= text.length) {
        clearInterval(interval);
      }

      // 0.2 controls how fast the "decoding" wave moves
      iteration += 1 / 3; 
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return <span>{displayText}</span>;
};

export default SeriesWords;