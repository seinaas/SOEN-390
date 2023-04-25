/*
 *		Return Window Size Utility
 *
 *
 *		This is a custom React hook called useWindowSize that returns the current window size as an object with width and height properties. It initializes the state with an undefined width 
 *    and height to ensure that server and client renders match. It sets up an event listener for the window resize event and updates the state with the new width and height values. It also 
 *    removes the event listener on cleanup to prevent memory leaks. Finally, it returns the windowSize state.
 */
import { useState, useEffect } from 'react';

export function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    // only execute all the code below in client side
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures that effect is only run on mount
  return windowSize;
}
