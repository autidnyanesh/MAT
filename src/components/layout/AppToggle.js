import React, { useCallback, useEffect, useRef, useState } from "react";
import { APPS } from "../../context/ApplicationContext";

/**
 * Navbar MAT ↔ MEA drag switch.
 * Drag anywhere on the control, or click left/right half.
 */
function AppToggle({ activeApp, onSwitch }) {
  const trackRef = useRef(null);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const startXRef = useRef(0);
  const startOffsetRef = useRef(0);
  const offsetRef = useRef(0);

  const isMea = activeApp === APPS.MEA;
  const [offset, setOffset] = useState(isMea ? 1 : 0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!draggingRef.current) {
      const v = isMea ? 1 : 0;
      setOffset(v);
      offsetRef.current = v;
    }
  }, [isMea]);

  const commit = useCallback(
    (nextOffset) => {
      const target = nextOffset >= 0.5 ? APPS.MEA : APPS.MAT;
      const snapped = target === APPS.MEA ? 1 : 0;
      setOffset(snapped);
      offsetRef.current = snapped;
      if (target !== activeApp) onSwitch(target);
    },
    [activeApp, onSwitch]
  );

  const readX = (e) =>
    e.touches?.length ? e.touches[0].clientX : e.clientX;

  const onPointerDown = (e) => {
    if (!trackRef.current) return;
    // Left click / touch only
    if (e.button != null && e.button !== 0) return;

    e.preventDefault();
    draggingRef.current = true;
    movedRef.current = false;
    setDragging(true);
    startXRef.current = readX(e);
    startOffsetRef.current = offsetRef.current;

    // Optional: jump thumb toward press point for instant feedback
    const rect = trackRef.current.getBoundingClientRect();
    const pressRatio = (readX(e) - rect.left) / rect.width;
    if (pressRatio < 0.35 || pressRatio > 0.65) {
      // keep current; user is grabbing near an edge to drag
    }

    const onMove = (ev) => {
      if (!draggingRef.current || !trackRef.current) return;
      if (ev.cancelable) ev.preventDefault();
      const r = trackRef.current.getBoundingClientRect();
      const travel = Math.max(r.width / 2, 1);
      const dx = readX(ev) - startXRef.current;
      if (Math.abs(dx) > 4) movedRef.current = true;
      let next = startOffsetRef.current + dx / travel;
      next = Math.max(0, Math.min(1, next));
      offsetRef.current = next;
      setOffset(next);
    };

    const onUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      setDragging(false);
      commit(offsetRef.current);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
  };

  const onClick = () => {
    // If user dragged, ignore the trailing click
    if (movedRef.current) {
      movedRef.current = false;
      return;
    }
    // Tap without drag → flip to the other app
    commit(offsetRef.current >= 0.5 ? 0 : 1);
  };

  const thumbLeft = `calc(3px + ${offset} * (50% - 3px))`;
  const t = offset; // 0 = MAT blue, 1 = MEA teal

  return (
    <div
      className={`app-toggle ${offset > 0.5 ? "app-toggle-mea" : ""} ${
        dragging ? "is-dragging" : ""
      }`}
      role="switch"
      aria-checked={isMea}
      aria-label="Switch between MAT and MEA"
      title="Drag or click to switch MAT / MEA"
    >
      <div
        ref={trackRef}
        className="app-toggle-track"
        onPointerDown={onPointerDown}
        onClick={onClick}
      >
        <span className={`app-toggle-label ${offset < 0.5 ? "is-active" : ""}`}>
          MAT
        </span>
        <span className={`app-toggle-label ${offset >= 0.5 ? "is-active" : ""}`}>
          MEA
        </span>

        <div
          className="app-toggle-thumb"
          style={{
            left: thumbLeft,
            background: `linear-gradient(135deg,
              rgb(${Math.round(13 + t * 2)}, ${Math.round(110 + t * 8)}, ${Math.round(253 - t * 143)}),
              rgb(${Math.round(59 - t * 39)}, ${Math.round(130 + t * 54)}, ${Math.round(246 - t * 80)})
            )`,
            transition: dragging
              ? "none"
              : "left 0.22s ease, background 0.22s ease, box-shadow 0.22s ease",
          }}
        />
      </div>
    </div>
  );
}

export default AppToggle;
