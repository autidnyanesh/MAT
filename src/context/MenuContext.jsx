import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import api from "../api/axiosConfig";
import { useAuth } from "./AuthContext";
import { useApplication } from "./ApplicationContext";
import { withBrand } from "../config/menuApiAdapter";

const MenuContext = createContext(null);

const EMPTY = { menus: [], profileMenus: [] };

export function MenuProvider({ children }) {
  const { user, booting } = useAuth();
  const { activeApp, appSelected } = useApplication();
  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadMenus = useCallback(async (app) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/menus", {
        params: { application: app === "MEA" ? "MEA" : "MAT" },
      });
      const data = res.data;
      if (!data || !Array.isArray(data.menus)) {
        throw new Error("Invalid menus response");
      }
      setMenuData(withBrand(data, app));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(
        "[MAT] menus API failed",
        err?.response?.status || err?.message
      );
      setError(err?.response?.data?.message || err?.message || "Unable to load menus");
      setMenuData(withBrand({ ...EMPTY, application: app }, app));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (booting) return;
    if (!user?.role || !appSelected) {
      setMenuData(null);
      setError(null);
      return;
    }
    loadMenus(activeApp);
  }, [booting, user?.role, activeApp, appSelected, loadMenus]);

  const value = useMemo(
    () => ({
      menus: menuData?.menus || [],
      profileMenus: menuData?.profileMenus || [],
      brand: menuData?.brand,
      application: menuData?.application,
      loading,
      error,
      reload: () => user?.role && appSelected && loadMenus(activeApp),
    }),
    [menuData, loading, error, loadMenus, user?.role, activeApp, appSelected]
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenus() {
  const ctx = useContext(MenuContext);
  if (!ctx) {
    throw new Error("useMenus must be used within MenuProvider");
  }
  return ctx;
}
