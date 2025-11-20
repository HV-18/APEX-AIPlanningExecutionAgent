import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export const useGestureNavigation = () => {
  const navigate = useNavigate();
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const touchEndY = useRef<number>(0);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      touchEndX.current = e.touches[0].clientX;
      touchEndY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = () => {
      const deltaX = touchEndX.current - touchStartX.current;
      const deltaY = touchEndY.current - touchStartY.current;
      
      // Minimum swipe distance (in pixels)
      const minSwipeDistance = 100;
      
      // Check if horizontal swipe is more significant than vertical
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0) {
          // Swipe right - go back
          navigate(-1);
        }
        // Swipe left could be used for forward navigation if history exists
        // For now, we'll just use it for going back
      }
    };

    // Also handle trackpad gestures on desktop
    let isGesturing = false;
    let gestureStartX = 0;

    const handleWheel = (e: WheelEvent) => {
      // Detect horizontal scrolling (trackpad swipe)
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        if (!isGesturing) {
          isGesturing = true;
          gestureStartX = e.deltaX;
        }

        // Accumulate horizontal scroll
        const threshold = 100;
        
        if (Math.abs(e.deltaX - gestureStartX) > threshold) {
          if (e.deltaX < 0) {
            // Swipe right (negative deltaX) - go back
            navigate(-1);
          }
          isGesturing = false;
        }
      }
    };

    const handleWheelEnd = () => {
      isGesturing = false;
    };

    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleTouchEnd);
    document.addEventListener("wheel", handleWheel, { passive: true });
    document.addEventListener("mouseup", handleWheelEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("wheel", handleWheel);
      document.removeEventListener("mouseup", handleWheelEnd);
    };
  }, [navigate]);
};
