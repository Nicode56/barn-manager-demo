import { useState, useEffect } from "react";

const DESKTOP_BREAKPOINT = 1024;

export const useIsDesktop = (): boolean => {
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth >= DESKTOP_BREAKPOINT;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`);

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsDesktop(e.matches);
    };

    handleChange(mediaQuery); // sync in case it changed between initial state and mount
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return isDesktop;
};