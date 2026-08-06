import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export const APPS = Object.freeze({
  MAT: "MAT",
  MEA: "MEA",
});

const STORAGE_KEY = "mat_active_app";

const ApplicationContext = createContext(null);

function readStoredApp() {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved === APPS.MAT || saved === APPS.MEA) return saved;
  } catch {
    /* sessionStorage unavailable */
  }
  return APPS.MAT;
}

export function ApplicationProvider({ children }) {
  const [activeApp, setActiveAppState] = useState(readStoredApp);
  const [allowedApps, setAllowedAppsState] = useState([APPS.MAT, APPS.MEA]);

  const setActiveApp = useCallback((app) => {
    const next = app === APPS.MEA ? APPS.MEA : APPS.MAT;
    setActiveAppState(next);
    try {
      sessionStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    if (typeof document !== "undefined") {
      document.body.dataset.app = next;
    }
  }, []);

  const setAllowedApps = useCallback((apps) => {
    const next = Array.isArray(apps) && apps.length
      ? apps.filter((a) => a === APPS.MAT || a === APPS.MEA)
      : [APPS.MAT, APPS.MEA];
    setAllowedAppsState(next.length ? next : [APPS.MAT]);
  }, []);

  /** Switch active application without logging out. Returns false if not allowed. */
  const switchApp = useCallback(
    (app) => {
      const next = app === APPS.MEA ? APPS.MEA : APPS.MAT;
      if (!allowedApps.includes(next)) return false;
      setActiveApp(next);
      return true;
    },
    [allowedApps, setActiveApp]
  );

  const resetApplication = useCallback(() => {
    setActiveApp(APPS.MAT);
    setAllowedAppsState([APPS.MAT, APPS.MEA]);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, [setActiveApp]);

  useEffect(() => {
    document.body.dataset.app = activeApp;
  }, [activeApp]);

  const value = useMemo(
    () => ({
      activeApp,
      allowedApps,
      setActiveApp,
      setAllowedApps,
      switchApp,
      resetApplication,
      isMAT: activeApp === APPS.MAT,
      isMEA: activeApp === APPS.MEA,
    }),
    [
      activeApp,
      allowedApps,
      setActiveApp,
      setAllowedApps,
      switchApp,
      resetApplication,
    ]
  );

  return (
    <ApplicationContext.Provider value={value}>
      {children}
    </ApplicationContext.Provider>
  );
}

export function useApplication() {
  const ctx = useContext(ApplicationContext);
  if (!ctx) {
    throw new Error("useApplication must be used within ApplicationProvider");
  }
  return ctx;
}
