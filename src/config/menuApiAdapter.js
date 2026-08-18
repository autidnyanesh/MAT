import { APP_BRAND } from "./menuConfig";

export function withBrand(menuResponse, activeApp) {
  return {
    ...menuResponse,
    brand: activeApp === "MEA" ? APP_BRAND.MEA : APP_BRAND.MAT,
  };
}

/** Icon hint from backend menu label/path (not a hardcoded menu list). */
export function iconForMenu(item) {
  const t = `${item?.label || ""} ${item?.path || ""}`.toLowerCase();
  if (t.includes("dashboard") || item?.path === "/") return "dashboard";
  if (t.includes("file") || t.includes("sftp") || t.includes("arn")) return "file";
  if (t.includes("report")) return "reports";
  if (t.includes("user") || t.includes("profile")) return "users";
  return "request";
}
