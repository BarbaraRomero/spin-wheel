import React, { useState } from "react";
import Wheel from "./components/Wheel.jsx";

export default function App() {
  const [winner1, setWinner1] = useState(null);
  const [winnerIdx1, setWinnerIdx1] = useState(null);

  const [winner2, setWinner2] = useState(null);
  const [winnerIdx2, setWinnerIdx2] = useState(null);

  const wheelSize = 480;

  const soniaSegments = [
    { text: "French, b. Hradyz’k, Ukraine, 1885–1979" },
    { text: "French, b. Ukraine, 1885–1979" },
    { text: "Russian (b. Ukraine, active France), 1885–1979" },
    { text: "French, b. Gradizhsk, Russia (now Ukraine), active in France, 1885–1979" },
    { text: "Russian, active in France, 1885–1979" },
  ];

  const chagallSegments = [
    { text: "Belorussian, 1887–1985" },
    { text: "b. 1887, Vitebsk, Russian Empire (now Belarus)" },
    { text: "French, born in the Russian Empire, present-day Belarus (1887–1985)" },
    { text: "(Russian, 1887–1985), designer" },
    { text: "Vitebsk, Belarus, Europe" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 grid place-items-center p-6">
      <div className="w-full max-w-6xl">
        <h1 className="text-center text-3xl font-bold text-gray-900">
          Artists Location Wheel of Fortune
        </h1>

        <div className="mt-10 grid gap-12 md:grid-cols-2 items-start justify-items-center">
          {/* Wheel 1 */}
          <div className="flex flex-col items-center gap-14 w-full">
            <h2 className="text-xl font-semibold text-gray-900 text-center">
              Sonia Delaunay Terk
            </h2>

            <Wheel
              segments={soniaSegments}
              size={wheelSize}
              selectedIndex={winnerIdx1}
              onResult={(seg, idx) => {
                setWinner1(seg);
                setWinnerIdx1(idx);
              }}
            />

            <div className="winner-box w-full max-w-md aspect-square rounded-2xl bg-white p-6 shadow border border-gray-200">
              <div className="h-full w-full overflow-auto flex items-center justify-center">
                {winner1 ? (
                  <div className="whitespace-pre-wrap text-gray-800 leading-relaxed text-center">
                    {winner1.text}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Wheel 2 */}
          <div className="flex flex-col items-center gap-14 w-full">
            <h2 className="text-xl font-semibold text-gray-900 text-center">
              Marc Chagall
            </h2>

            <Wheel
              segments={chagallSegments}
              size={wheelSize}
              selectedIndex={winnerIdx2}
              onResult={(seg, idx) => {
                setWinner2(seg);
                setWinnerIdx2(idx);
              }}
            />

            <div className="winner-box w-full max-w-md aspect-square rounded-2xl bg-white p-6 shadow border border-gray-200">
              <div className="h-full w-full overflow-auto flex items-center justify-center">
                {winner2 ? (
                  <div className="whitespace-pre-wrap text-gray-800 leading-relaxed text-center">
                    {winner2.text}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-gray-600">
          The winning slice is highlighted directly on the wheel.
        </p>
      </div>
    </div>
  );
}




