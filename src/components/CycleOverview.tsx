import { useState } from 'react';
import { AppState } from '../types';
import { WORKOUT_PATTERN } from '../data';
import { Printer, Calendar, CheckCircle2 } from 'lucide-react';

interface CycleOverviewProps {
  state: AppState;
  onToggleDay?: (cycleNum: number, dayNum: number) => void;
}

export function CycleOverview({ state, onToggleDay }: CycleOverviewProps) {
  const { currentCycle, cycles } = state;
  const [viewCycle, setViewCycle] = useState(currentCycle);
  const cycleData = cycles[viewCycle] || cycles[currentCycle];

  if (!cycleData) return null;

  const completedCount = cycleData.completedDays.length;
  const percent = Math.round((completedCount / 30) * 100);

  return (
    <div id="cycle-overview-view" className="p-4 sm:p-6 max-w-lg mx-auto pb-24">
      {/* Header controls (hidden when printing) */}
      <div className="no-print flex justify-between items-center mb-5">
        <div>
          <span className="text-zinc-500 font-mono text-[11px] uppercase tracking-widest block">
            Plan Progress
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight">OVERVIEW</h2>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="cycle-select" className="sr-only">Select Cycle</label>
          <select
            id="cycle-select"
            className="w-32 bg-zinc-900 border border-zinc-800 text-white text-xs font-bold py-2 px-3 rounded-lg"
            value={viewCycle}
            onChange={e => setViewCycle(Number(e.target.value))}
          >
            {Object.keys(state.cycles).map(c => (
              <option key={c} value={c}>
                Cycle {c} {Number(c) === currentCycle ? '(Active)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Print only banner */}
      <div className="print-only hidden mb-6">
        <h1 className="text-2xl font-black tracking-tight text-black border-b-2 border-black pb-2">
          PROJECT METAMORPHOSIS — CYCLE {viewCycle}
        </h1>
        <div className="flex justify-between text-sm text-gray-700 mt-2">
          <span>Phase: {cycleData.phase}</span>
          <span>Target: 30-Day Training Block</span>
        </div>
      </div>

      {/* Summary Stat Card */}
      <div className="no-print bg-zinc-950 border border-zinc-900 p-4 rounded-2xl mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white uppercase tracking-wider">
                Phase {cycleData.phase}
              </span>
              {viewCycle === currentCycle && (
                <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Current
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              {completedCount} of 30 days completed ({percent}%)
            </p>
          </div>
        </div>

        <button
          id="print-tracker-btn"
          onClick={() => window.print()}
          className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>PRINT</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="no-print mb-5">
        <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* 30-Day Table */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-zinc-900/90 text-zinc-400 text-xs uppercase tracking-wider font-semibold">
            <tr>
              <th className="py-3 px-4 w-16 text-center">Day</th>
              <th className="py-3 px-4">Workout Session</th>
              <th className="py-3 px-4 w-20 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {Array.from({ length: 30 }).map((_, i) => {
              const day = i + 1;
              const workoutType = WORKOUT_PATTERN[(day - 1) % 4];
              const isDone = cycleData.completedDays.includes(day);
              const isToday = viewCycle === currentCycle && day === state.currentDay;

              return (
                <tr
                  key={day}
                  className={`transition-colors ${
                    isToday ? 'bg-zinc-900/60' : 'hover:bg-zinc-900/30'
                  }`}
                >
                  <td className="py-3 px-4 text-center font-mono font-bold text-zinc-400">
                    <span className={isToday ? 'text-white font-black' : ''}>
                      {day}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold text-xs sm:text-sm ${
                        workoutType === 'POWER'
                          ? 'text-amber-300'
                          : workoutType === 'CIRCUIT'
                          ? 'text-white'
                          : 'text-zinc-400'
                      }`}>
                        {workoutType}
                      </span>
                      {isToday && (
                        <span className="bg-white text-black text-[10px] font-black px-1.5 py-0.5 rounded uppercase">
                          Today
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {onToggleDay ? (
                      <button
                        id={`toggle-day-${day}-btn`}
                        onClick={() => onToggleDay(viewCycle, day)}
                        className="p-1 hover:scale-110 transition cursor-pointer"
                        title={isDone ? 'Mark uncompleted' : 'Mark completed'}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" />
                        ) : (
                          <div className="w-5 h-5 rounded-md border border-zinc-700 hover:border-zinc-500 mx-auto" />
                        )}
                      </button>
                    ) : (
                      <div>
                        {isDone ? (
                          <span className="text-emerald-400 font-bold text-base">✓</span>
                        ) : (
                          <span className="text-zinc-700 text-lg">☐</span>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
