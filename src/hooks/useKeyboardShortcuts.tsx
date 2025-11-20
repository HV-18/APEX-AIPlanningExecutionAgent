import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Esc - Go back
      if (event.key === "Escape") {
        event.preventDefault();
        navigate(-1);
      }

      // Alt + H - Go home
      if (event.altKey && event.key === "h") {
        event.preventDefault();
        navigate("/");
      }

      // Alt + S - Go to study rooms
      if (event.altKey && event.key === "s") {
        event.preventDefault();
        navigate("/study-rooms");
      }

      // Alt + P - Go to profile
      if (event.altKey && event.key === "p") {
        event.preventDefault();
        navigate("/profile");
      }

      // Alt + C - Go to chat
      if (event.altKey && event.key === "c") {
        event.preventDefault();
        navigate("/chat");
      }

      // Alt + T - Go to timetable
      if (event.altKey && event.key === "t") {
        event.preventDefault();
        navigate("/timetable");
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [navigate, location]);
};
