import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface CoinProps {
  isFlipping: boolean;
  result?: 'heads' | 'tails' | null;
  className?: string;
  onFlipDone?: () => void; // Optional callback for when the animation finishes
}

/**
 * Renders a 3D coin flip animation using CSS transforms controlled by JavaScript.
 */
export const Coin: React.FC<CoinProps> = ({ isFlipping, result, className, onFlipDone }) => {
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    // This effect triggers when the isFlipping prop changes.
    if (isFlipping) {
      // Add the 'is-flipping' class to start the animation.
      setAnimationClass('is-flipping');

      // Set a timer for when the animation should end.
      const timer = setTimeout(() => {
        // If a result is provided, show it. Otherwise, default to heads.
        const finalResult = result || 'heads';
        setAnimationClass(finalResult === 'heads' ? 'show-heads' : 'show-tails');
        
        // Call the callback function if it exists
        if (onFlipDone) {
          onFlipDone();
        }
      }, 1200); // This duration must match the transition duration in CSS.

      return () => clearTimeout(timer);
    }
  }, [isFlipping, result, onFlipDone]);
  
  // This effect handles setting a static result without animation.
  useEffect(() => {
      if (!isFlipping && result) {
          setAnimationClass(result === 'heads' ? 'show-heads' : 'show-tails');
      }
  }, [isFlipping, result]);


  return (
    <div className={`coin-container ${className || ''}`}>
      <div className={`coin ${animationClass}`}>
        <div className="coin-face heads">
          <Image src="/coin-heads.png" alt="Heads" width={200} height={200} priority />
        </div>
        <div className="coin-face tails">
          <Image src="/coin-tails.png" alt="Tails" width={200} height={200} priority />
        </div>
      </div>
    </div>
  );
};