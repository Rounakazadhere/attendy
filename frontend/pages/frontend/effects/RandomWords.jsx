import { useState, useRef } from "react";

const HackerText = ({ text, className }) => {
  const [displayText, setDisplayText] = useState(text);
  const intervalRef = useRef(null);
  
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

  const handleMouseEnter = () => {
    let iteration = 0;
    
    // Clear any existing interval to prevent chaos
    clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setDisplayText((prev) => 
        text
          .split("")
          .map((char, index) => {
            if (index < iteration) {
              return text[index]; // Return original character if revealed
            }
            // Return random character
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join("")
      );

      // Stop the effect when all letters are revealed
      if (iteration >= text.length) {
        clearInterval(intervalRef.current);
      }

      iteration += 1 / 3; // Speed control (lower number = slower reveal)
    }, 30);
  };

  return (
    <h1 
      className={className} 
      onMouseEnter={handleMouseEnter}
      style={{ fontFamily: 'monospace', cursor: 'default' }} // Monospace looks better for this
    >
      {displayText}
    </h1>
  );
};

export default HackerText;