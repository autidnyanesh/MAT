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

export const ACTIVE_APP_STORAGE_KEY = "mat_active_app";
export const SELECT_APP_PATH = "/select-app";

const ApplicationContext = createContext(null);

function readStoredApp() {
  try {
    const saved = sessionStorage.getItem(ACTIVE_APP_STORAGE_KEY);
    if (saved === APPS.MAT || saved === APPS.MEA) return saved;
  } catch {
    /* sessionStorage unavailable */
  }
  return null;
}

function normalizeAllowed(apps) {
  const next = Array.isArray(apps) && apps.length
    ? apps.filter((a) => a === APPS.MAT || a === APPS.MEA)
    : [APPS.MAT, APPS.MEA];
  return next.length ? next : [APPS.MAT];
}

export function ApplicationProvider({ children }) {
  const stored = readStoredApp();
  const [activeApp, setActiveAppState] = useState(stored || APPS.MAT);
  const [allowedApps, setAllowedAppsState] = useState([APPS.MAT, APPS.MEA]);
  const [appSelected, setAppSelected] = useState(() => stored != null);

  const setActiveApp = useCallback((app) => {
    const next = app === APPS.MEA ? APPS.MEA : APPS.MAT;
    setActiveAppState(next);
    try {
      sessionStorage.setItem(ACTIVE_APP_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    if (typeof document !== "undefined") {
      document.body.dataset.app = next;
    }
  }, []);

  const setAllowedApps = useCallback((apps) => {
    setAllowedAppsState(normalizeAllowed(apps));
  }, []);

  /** After credentials succeed: clear last app so the picker is required. */
  const beginAppSelection = useCallback((apps) => {
    setAllowedAppsState(normalizeAllowed(apps));
    setAppSelected(false);
    try {
      sessionStorage.removeItem(ACTIVE_APP_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  /** User (or auto-select) chose MAT/MEA. Home can load. */
  const selectApp = useCallback(
    (app) => {
      const next = app === APPS.MEA ? APPS.MEA : APPS.MAT;
      if (allowedApps.length && !allowedApps.includes(next)) {
        return false;
      }
      setActiveApp(next);
      setAppSelected(true);
      return true;
    },
    [allowedApps, setActiveApp]
  );

  /**
   * F5 / session restore: reuse stored choice, or skip picker when only one app is allowed.
   * Returns true when home can load without the picker.
   */
  const hydrateFromStorage = useCallback(
    (apps) => {
      const allowed = normalizeAllowed(apps);
      setAllowedAppsState(allowed);
      const storedApp = readStoredApp();
      if (storedApp && allowed.includes(storedApp)) {
        setActiveApp(storedApp);
        setAppSelected(true);
        return true;
      }
      if (allowed.length === 1) {
        setActiveApp(allowed[0]);
        setAppSelected(true);
        return true;
      }
      setAppSelected(false);
      return false;
    },
    [setActiveApp]
  );

  /** Switch active application without logging out. Returns false if not allowed. */
  const switchApp = useCallback(
    (app) => {
      const next = app === APPS.MEA ? APPS.MEA : APPS.MAT;
      if (!allowedApps.includes(next)) return false;
      setActiveApp(next);
      setAppSelected(true);
      return true;
    },
    [allowedApps, setActiveApp]
  );

  const resetApplication = useCallback(() => {
    setActiveAppState(APPS.MAT);
    setAllowedAppsState([APPS.MAT, APPS.MEA]);
    setAppSelected(false);
    try {
      sessionStorage.removeItem(ACTIVE_APP_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    if (typeof document !== "undefined") {
      document.body.dataset.app = APPS.MAT;
    }
  }, []);

  useEffect(() => {
    document.body.dataset.app = activeApp;
  }, [activeApp]);

  const value = useMemo(
    () => ({
      activeApp,
      allowedApps,
      appSelected,
      setActiveApp,
      setAllowedApps,
      beginAppSelection,
      selectApp,
      hydrateFromStorage,
      switchApp,
      resetApplication,
      isMAT: activeApp === APPS.MAT,
      isMEA: activeApp === APPS.MEA,
    }),
    [
      activeApp,
      allowedApps,
      appSelected,
      setActiveApp,
      setAllowedApps,
      beginAppSelection,
      selectApp,
      hydrateFromStorage,
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
