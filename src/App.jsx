import React, { useState } from "react";
import Wheel from "./components/Wheel.jsx";

export default function App() {
  const [winner, setWinner] = useState(null);

  const segments = [
    { text: "Paragraph 1: Put a longer prompt here. Multiple sentences are fine." },
    { text: "Paragraph 2: This slice contains a short paragraph that will wrap on the wheel." },
    { text: "Paragraph 3: The wheel shows a preview. The full text is shown in the panel." },
    { text: "Paragraph 4: Add as many slices as you want." },
    { text: "Paragraph 5: You can later load these from a JSON file too." },
    { text: "Paragraph 6: Example content." },
  ];

return (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
    <div className="w-full max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 text-center">Spin Wheel</h1>
      <p className="mt-2 text-gray-600 text-center">
        Each slice supports paragraph text. Spin, then read the full selection.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-[560px_1fr] items-center">
        <div className="flex justify-center">
          <Wheel segments={segments} onResult={(seg) => setWinner(seg)} size={520} />
        </div>

        <div className="rounded-2xl bg-white p-5 shadow">
          <h2 className="text-lg font-semibold text-gray-900">Selected</h2>
          {winner ? (
            <div className="mt-3 whitespace-pre-wrap text-gray-800 leading-relaxed">
              {winner.text}
            </div>
          ) : (
            <p className="mt-3 text-gray-600">Click SPIN to pick a segment.</p>
          )}

          <hr className="my-5" />

          <p className="text-sm text-gray-600">
            Tip: If your paragraphs are very long, keep the wheel preview short and rely on this panel for full readability.
          </p>
        </div>
      </div>
    </div>
  </div>
);
}

