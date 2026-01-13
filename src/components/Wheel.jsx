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

export default function Wheel({
  segments,
  onResult,
  size = 520,
  selectedIndex = null,
}) {
  const canvasRef = useRef(null);
  const dprRef = useRef(1);

  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);

  const colors = useMemo(
    () => ["#FDE68A", "#BFDBFE", "#BBF7D0", "#FBCFE8", "#DDD6FE", "#FED7AA"],
    []
  );

  const arc = (Math.PI * 2) / Math.max(segments.length, 1);
  const pointerAngle = -Math.PI / 2; // top

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

    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
  }

  function draw(rot) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = dprRef.current || 1;

    // clear in device pixels
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw in CSS pixels
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cx = size / 2;
    const cy = size / 2;
    const baseR = Math.min(size, size) * 0.46;
    const twoPi = Math.PI * 2;

    // outer ring
    ctx.beginPath();
    ctx.arc(cx, cy, baseR + 8, 0, twoPi);
    ctx.fillStyle = "#111827";
    ctx.fill();

    if (!segments.length) return;

    const sel =
      typeof selectedIndex === "number" &&
      selectedIndex >= 0 &&
      selectedIndex < segments.length
        ? selectedIndex
        : null;

    for (let i = 0; i < segments.length; i++) {
      const start = rot + i * arc;
      const end = start + arc;
      const isSelected = sel === i;

      // Pop-out radius for selected slice
      const sliceR = isSelected ? baseR + 12 : baseR;

      // Dim non-selected slices when a winner exists
      const alpha = sel !== null && !isSelected ? 0.35 : 1;

      ctx.save();
      ctx.globalAlpha = alpha;

      // slice
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, sliceR, start, end);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();

      // border
      ctx.strokeStyle = "rgba(17, 24, 39, 0.35)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // selected emphasis
      if (isSelected) {
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = "#111827";
        ctx.lineWidth = 7;
        ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();

      // text
      const mid = start + arc / 2;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(mid);

      // Move text further out so it won’t clash with the central SPIN button
      ctx.translate(sliceR * 0.72, 0);

      // orient text downwards along the radius, never upside down
      ctx.rotate(Math.PI / 2);
      let finalAngle = (mid + Math.PI / 2) % twoPi;
      if (finalAngle < 0) finalAngle += twoPi;
      if (finalAngle > Math.PI / 2 && finalAngle < (3 * Math.PI) / 2) {
        ctx.rotate(Math.PI);
      }

      const maxWidth = baseR * 0.55;
      const fontSize = Math.max(12, Math.floor(baseR / 24));
      const lineHeight = Math.floor(fontSize * 1.25);

      ctx.fillStyle = "#111827";
      ctx.font = `900 ${fontSize}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const lines = wrapLines(ctx, segments[i].text, maxWidth);

      // fewer lines to keep clear space in the center
      const maxLines = 5;
      const shown = lines.slice(0, maxLines);
      if (lines.length > maxLines && shown.length) {
        shown[shown.length - 1] = `${shown[shown.length - 1]} …`;
      }

      const blockHeight = shown.length * lineHeight;
      let y = -blockHeight / 2 + lineHeight / 2;

      for (const ln of shown) {
        ctx.fillText(ln, 0, y);
        y += lineHeight;
      }

      ctx.restore();
    }

    // center circle (slightly larger = more safe space for SPIN)
    ctx.beginPath();
    ctx.arc(cx, cy, baseR * 0.15, 0, twoPi);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rotation, selectedIndex, segments]);

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
      const t = clamp((now - startTime) / durationMs, 0, 1);
      const eased = easeOutCubic(t);
      const next = startRot + delta * eased;

      setRotation(next);

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        setSpinning(false);
        const winnerIdx = getWinnerIndex(next);
        onResult?.(segments[winnerIdx], winnerIdx);
      }
    }

    requestAnimationFrame(frame);
  }

  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <canvas ref={canvasRef} className="rounded-2xl shadow bg-white" />

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



