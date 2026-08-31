import React from "react";

/**
 * Clickable table header cell with asc/desc indicator.
 *
 * Usage:
 *   const { sortedRows, getSortProps } = useTableSort(filtered);
 *   <SortableTh label="Request ID" {...getSortProps("requestId")} />
 */
function SortableTh({
  label,
  sortKey,
  activeKey,
  direction = "asc",
  onSort,
  className = "",
  style,
  disabled = false,
  ...rest
}) {
  const active = activeKey === sortKey;
  const ariaSort = !active ? "none" : direction === "asc" ? "ascending" : "descending";

  return (
    <th
      {...rest}
      className={`sortable-th ${active ? "is-sorted" : ""} ${className}`.trim()}
      style={style}
      onClick={() => {
        if (!disabled && onSort) onSort(sortKey);
      }}
      aria-sort={ariaSort}
      title={disabled ? undefined : `Sort by ${label}`}
    >
      <span className="sortable-th-inner">
        <span className="sortable-th-label">{label}</span>
        {!disabled && (
          <span className={`sortable-th-icon ${active ? "active" : ""}`} aria-hidden="true">
            {active ? (direction === "asc" ? "▲" : "▼") : "⇅"}
          </span>
        )}
      </span>
    </th>
  );
}

export default SortableTh;
