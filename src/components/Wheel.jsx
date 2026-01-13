import React, { useEffect, useMemo, useRef, useState } from "react";

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function wrapLines(ctx, text, maxWidth) {
  const clean = (text || "").replace(/\s+/g, " ").trim();
  const words = clean ? clean.split(" ") : [""];
  const lines = [];
  let line = "";

  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width <= maxWidth) {
      line = test;
    } else {
      if (line) lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export default function Wheel({ segments, onResult, size = 520 }) {
  const canvasRef = useRef(null);
  const dprRef = useRef(window.devicePixelRatio || 1);

  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);

  const colors = useMemo(
    () => ["#FDE68A", "#BFDBFE", "#BBF7D0", "#FBCFE8", "#DDD6FE", "#FED7AA"],
    []
  );

  const arc = (Math.PI * 2) / Math.max(segments.length, 1);
  const pointerAngle = -Math.PI / 2;

  function getWinnerIndex(rot) {
    const twoPi = Math.PI * 2;
    const a = ((pointerAngle - rot) % twoPi + twoPi) % twoPi;
    const idx = Math.floor(a / arc);
    return clamp(idx, 0, segments.length - 1);
  }

  function resizeCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    dprRef.current = dpr;

    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
  }

  function draw(rot) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = dprRef.current;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    const cx = size / 2;
    const cy = size / 2;
    const r = Math.min(size, size) * 0.46;
    const twoPi = Math.PI * 2;

    // outer ring
    ctx.beginPath();
    ctx.arc(cx, cy, r + 8, 0, twoPi);
    ctx.fillStyle = "#111827";
    ctx.fill();

    if (!segments.length) return;

    for (let i = 0; i < segments.length; i++) {
      const start = rot + i * arc;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, start + arc);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();

      ctx.strokeStyle = "rgba(17, 24, 39, 0.35)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // text
      const mid = start + arc / 2;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(mid);
      ctx.translate(r * 0.62, 0);

      // text always upright
      ctx.rotate(Math.PI / 2);
      let finalAngle = (mid + Math.PI / 2) % twoPi;
      if (finalAngle < 0) finalAngle += twoPi;
      if (finalAngle > Math.PI / 2 && finalAngle < (3 * Math.PI) / 2) {
        ctx.rotate(Math.PI);
      }

      const maxWidth = r * 0.55;
      const fontSize = Math.max(12, Math.floor(r / 24));
      const lineHeight = Math.floor(fontSize * 1.25);

      ctx.fillStyle = "#111827";
      ctx.font = `900 ${fontSize}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const lines = wrapLines(ctx, segments[i].text, maxWidth);
      const shown = lines.slice(0, 6);
      if (lines.length > 6 && shown.length) {
        shown[shown.length - 1] += " …";
      }

      const blockHeight = shown.length * lineHeight;
      let y = -blockHeight / 2 + lineHeight / 2;

      for (const ln of shown) {
        ctx.fillText(ln, 0, y);
        y += lineHeight;
      }

      ctx.restore();
    }

    // center circle
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.12, 0, twoPi);
    ctx.fillStyle = "#111827";
    ctx.fill();
  }

  useEffect(() => {
    resizeCanvas();
    draw(rotation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, segments.length]);

  useEffect(() => {
    draw(rotation);
  }, [rotation]);

  function spin() {
    if (spinning || !segments.length) return;

    const target = Math.floor(Math.random() * segments.length);
    const base = pointerAngle - (target + 0.5) * arc;
    const minSpins = 5;
    const twoPi = Math.PI * 2;
    const current = rotation;
    const m = Math.ceil((current + minSpins * twoPi - base) / twoPi);
    const final = base + m * twoPi;
    const durationMs = 4200;
    const startTime = performance.now();
    const startRot = current;
    const delta = final - startRot;

    setSpinning(true);

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function frame(now) {
      const t = Math.min(1, (now - startTime) / durationMs);
      const next = startRot + delta * (1 - Math.pow(1 - t, 3));
      setRotation(next);
      if (t < 1) requestAnimationFrame(frame);
      else {
        setSpinning(false);
        const winnerIdx = getWinnerIndex(next);
        onResult?.(segments[winnerIdx], winnerIdx);
      }
    }

    requestAnimationFrame(frame);
  }

  return (
  <div className="relative inline-block" style={{ width: size, height: size }}>
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      className="rounded-2xl shadow bg-white"
    />

    {/* pointer (inline styles so it cannot drift due to missing classes) */}
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        top: "50%",
        right: "-18px",
        transform: "translateY(-50%)",
        width: 0,
        height: 0,
        borderTop: "14px solid transparent",
        borderBottom: "14px solid transparent",
        borderLeft: "26px solid #111827",
      }}
    />

    <button
      onClick={spin}
      disabled={spinning}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white px-5 py-3 text-sm font-semibold shadow disabled:opacity-60"
    >
      {spinning ? "Spinning..." : "SPIN"}
    </button>
  </div>
);
}
