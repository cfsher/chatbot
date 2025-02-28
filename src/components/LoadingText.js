import React, { useState, useEffect } from 'react';

function LoadingText() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    let dotCount = 0;

    const interval = setInterval(() => {
      // Cycle through 0 -> 3 dots
      dotCount = (dotCount + 1) % 4; // 0, 1, 2, 3
      setDots('.'.repeat(dotCount));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      thinking{dots}
    </div>
  );
}

export default LoadingText;
