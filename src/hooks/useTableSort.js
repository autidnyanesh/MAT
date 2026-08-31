import { useMemo, useState, useCallback } from "react";

/**
 * Parse a cell value into a comparable primitive.
 * Supports: numbers, currency (₹ 1,500), dates (10-Jun-2026, 02-Jul-2026 10:15 AM,
 * yyyy-mm-dd, dd-mm-yyyy), and plain strings.
 */
export function coerceSortValue(value) {
  if (value == null || value === "" || value === "—" || value === "-") {
    return { kind: "empty", value: null };
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return { kind: "number", value };
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return { kind: "date", value: value.getTime() };
  }

  if (typeof value === "boolean") {
    return { kind: "number", value: value ? 1 : 0 };
  }

  const str = String(value).trim();

  // Currency / amount: "₹ 1,500" or "1,500.00"
  const currency = str.replace(/[₹,\s]/g, "");
  if (/^-?\d+(\.\d+)?$/.test(currency) && /[\d₹,]/.test(str)) {
    const n = Number(currency);
    if (Number.isFinite(n)) return { kind: "number", value: n };
  }

  // Pure number string
  if (/^-?\d+(\.\d+)?$/.test(str)) {
    return { kind: "number", value: Number(str) };
  }

  // ISO date yyyy-mm-dd[ time]
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const t = Date.parse(str);
    if (!Number.isNaN(t)) return { kind: "date", value: t };
  }

  // dd-MMM-yyyy[ time] e.g. 10-Jun-2026 / 02-Jul-2026 10:15 AM
  const mmm = str.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})(?:\s+(.+))?$/);
  if (mmm) {
    const t = Date.parse(`${mmm[2]} ${mmm[1]}, ${mmm[3]}${mmm[4] ? ` ${mmm[4]}` : ""}`);
    if (!Number.isNaN(t)) return { kind: "date", value: t };
  }

  // dd-mm-yyyy or dd/mm/yyyy
  const dmy = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:\s+(.+))?$/);
  if (dmy) {
    const iso = `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}${
      dmy[4] ? ` ${dmy[4]}` : ""
    }`;
    const t = Date.parse(iso);
    if (!Number.isNaN(t)) return { kind: "date", value: t };
  }

  return { kind: "string", value: str.toLowerCase() };
}

export function compareSortValues(a, b, direction = "asc") {
  const av = coerceSortValue(a);
  const bv = coerceSortValue(b);
  const dir = direction === "desc" ? -1 : 1;

  if (av.kind === "empty" && bv.kind === "empty") return 0;
  if (av.kind === "empty") return 1; // empties last
  if (bv.kind === "empty") return -1;

  if (av.kind === bv.kind) {
    if (av.kind === "string") {
      return av.value.localeCompare(bv.value, undefined, {
        numeric: true,
        sensitivity: "base",
      }) * dir;
    }
    if (av.value < bv.value) return -1 * dir;
    if (av.value > bv.value) return 1 * dir;
    return 0;
  }

  const as = a == null ? "" : String(a);
  const bs = b == null ? "" : String(b);
  return as.localeCompare(bs, undefined, { numeric: true, sensitivity: "base" }) * dir;
}

function getRowValue(row, key, accessors) {
  if (accessors && typeof accessors[key] === "function") {
    return accessors[key](row);
  }
  if (key && String(key).includes(".")) {
    return String(key).split(".").reduce((acc, part) => acc?.[part], row);
  }
  return row?.[key];
}

/**
 * @param {Array} rows already-filtered rows (sort before pagination)
 * @param {{ key?: string|null, direction?: 'asc'|'desc', accessors?: Record<string, function> }} [options]
 */
export default function useTableSort(rows, options = {}) {
  const [sortKey, setSortKey] = useState(options.key ?? null);
  const [sortDir, setSortDir] = useState(options.direction ?? "asc");
  const accessors = options.accessors;

  const requestSort = useCallback((key) => {
    if (!key) return;
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        return prev;
      }
      setSortDir("asc");
      return key;
    });
  }, []);

  const sortedRows = useMemo(() => {
    if (!Array.isArray(rows)) return [];
    if (!sortKey) return rows;
    const copy = [...rows];
    copy.sort((a, b) =>
      compareSortValues(
        getRowValue(a, sortKey, accessors),
        getRowValue(b, sortKey, accessors),
        sortDir
      )
    );
    return copy;
  }, [rows, sortKey, sortDir, accessors]);

  return {
    sortedRows,
    sortKey,
    sortDir,
    requestSort,
    getSortProps: (key) => ({
      sortKey: key,
      activeKey: sortKey,
      direction: sortDir,
      onSort: requestSort,
    }),
  };
}
