import { useEffect, useRef, useCallback } from "react";

const TIMEOUT_MS = 2 * 60 * 1000;
const WARNING_MS = 1 * 60 * 1000;

/**
 * Idle warning at 14 min, logout at 15 min.
 * Callbacks are read from refs so re-renders do not restart the clock.
 * While the warning is open, activity does not postpone logout.
 */
const useSessionTimeout = (onLogout, onWarning, { warningOpen = false } = {}) => {
  const logoutTimer = useRef(null);
  const warningTimer = useRef(null);
  const onLogoutRef = useRef(onLogout);
  const onWarningRef = useRef(onWarning);
  const warningOpenRef = useRef(warningOpen);

  useEffect(() => {
    onLogoutRef.current = onLogout;
  }, [onLogout]);
  useEffect(() => {
    onWarningRef.current = onWarning;
  }, [onWarning]);
  useEffect(() => {
    warningOpenRef.current = warningOpen;
  }, [warningOpen]);

  const clearTimers = useCallback(() => {
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);
  }, []);

  const resetTimers = useCallback(() => {
    clearTimers();
    if (onWarningRef.current) {
      warningTimer.current = setTimeout(() => {
        onWarningRef.current?.();
      }, WARNING_MS);
    }
    logoutTimer.current = setTimeout(() => {
      onLogoutRef.current?.();
    }, TIMEOUT_MS);
  }, [clearTimers]);

  useEffect(() => {
    const onActivity = () => {
      if (warningOpenRef.current) return;
      resetTimers();
    };

    const events = ["keydown", "mousedown", "touchstart"];
    events.forEach((e) => window.addEventListener(e, onActivity));
    resetTimers();

    return () => {
      clearTimers();
      events.forEach((e) => window.removeEventListener(e, onActivity));
    };
  }, [resetTimers, clearTimers]);

  return resetTimers;
};

export default useSessionTimeout;
