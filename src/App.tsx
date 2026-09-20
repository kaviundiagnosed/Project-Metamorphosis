import { useState, useEffect } from 'react';
import { AppState, TabType, TestResults } from './types';
import { INITIAL_STATE, generateDefaultCycle } from './data';
import { TodayView } from './components/TodayView';
import { CycleOverview } from './components/CycleOverview';
import { EditorView } from './components/EditorView';
import { DataView } from './components/DataView';
import { InstallModal } from './components/InstallModal';
import { Dumbbell, CalendarDays, Sliders, Database } from 'lucide-react';

export default function App() {
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem('metamorphosis_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.cycles && parsed.currentCycle) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse saved state', e);
    }
    return INITIAL_STATE;
  });

  const [currentTab, setCurrentTab] = useState<TabType>('TODAY');

  useEffect(() => {
    try {
      localStorage.setItem('metamorphosis_data', JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
  }, [state]);

  const updateState = (updater: ((prev: AppState) => AppState) | Partial<AppState>) => {
    setState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      return { ...prev, ...next };
    });
  };

  const completeWorkout = () => {
    updateState(prev => {
      const cycleData = prev.cycles[prev.currentCycle] || generateDefaultCycle(1);
      const newCompleted = [...(cycleData.completedDays || [])];
      if (!newCompleted.includes(prev.currentDay)) {
        newCompleted.push(prev.currentDay);
      }
      return {
        ...prev,
        currentDay: prev.currentDay + 1,
        cycles: {
          ...prev.cycles,
          [prev.currentCycle]: { ...cycleData, completedDays: newCompleted }
        }
      };
    });
  };

  const completeTest = (results: TestResults) => {
    updateState(prev => {
      const nextCycleNum = prev.currentCycle + 1;
      const newCycles = { ...prev.cycles };

      // Save test results on completed cycle
      newCycles[prev.currentCycle] = {
        ...newCycles[prev.currentCycle],
        testResults: results
      };

      // Initialize next cycle if it hasn't been prepared in advance
      if (!newCycles[nextCycleNum]) {
        const cloned = JSON.parse(
          JSON.stringify(newCycles[prev.currentCycle] || generateDefaultCycle(1))
        );
        cloned.completedDays = [];
        cloned.testResults = null;
        cloned.phase = newCycles[prev.currentCycle]?.phase || 1;
        newCycles[nextCycleNum] = cloned;
      } else {
        newCycles[nextCycleNum].completedDays = [];
      }

      return {
        currentCycle: nextCycleNum,
        currentDay: 1,
        cycles: newCycles
      };
    });
  };

  const handleToggleDay = (cycleNum: number, dayNum: number) => {
    updateState(prev => {
      const cycle = prev.cycles[cycleNum];
      if (!cycle) return prev;
      const completed = cycle.completedDays.includes(dayNum)
        ? cycle.completedDays.filter(d => d !== dayNum)
        : [...cycle.completedDays, dayNum];
      return {
        ...prev,
        cycles: {
          ...prev.cycles,
          [cycleNum]: {
            ...cycle,
            completedDays: completed
          }
        }
      };
    });
  };

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-black text-white border-x border-zinc-900 overflow-hidden font-sans select-none">
      {/* Top Header */}
      <header className="no-print pt-10 pb-3 px-4 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-900 flex justify-between items-center z-10 shrink-0">
        <div>
          <h1 className="text-lg font-black tracking-widest text-white uppercase font-mono">
            METAMORPHOSIS
          </h1>
          <span className="text-[10px] text-zinc-500 font-mono tracking-widest block uppercase">
            C{state.currentCycle} • DAY {Math.min(state.currentDay, 30)}/30
          </span>
        </div>
        <div className="flex items-center gap-2">
          <InstallModal />
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative bg-black">
        {currentTab === 'TODAY' && (
          <TodayView
            state={state}
            completeWorkout={completeWorkout}
            completeTest={completeTest}
          />
        )}
        {currentTab === 'CYCLE' && (
          <CycleOverview state={state} onToggleDay={handleToggleDay} />
        )}
        {currentTab === 'EDIT' && (
          <EditorView state={state} updateState={updateState} />
        )}
        {currentTab === 'DATA' && (
          <DataView state={state} setState={setState} />
        )}
      </main>

      {/* iPhone PWA Navigation Bar */}
      <nav className="no-print flex border-t border-zinc-900 bg-zinc-950/95 backdrop-blur-md pb-6 pt-1.5 px-2 z-10 shrink-0">
        {[
          { tab: 'TODAY' as const, label: 'TODAY', icon: Dumbbell },
          { tab: 'CYCLE' as const, label: 'CYCLE', icon: CalendarDays },
          { tab: 'EDIT' as const, label: 'EDIT', icon: Sliders },
          { tab: 'DATA' as const, label: 'DATA', icon: Database }
        ].map(({ tab, label, icon: Icon }) => {
          const isActive = currentTab === tab;
          return (
            <button
              key={tab}
              id={`nav-tab-${tab.toLowerCase()}`}
              onClick={() => setCurrentTab(tab)}
              className={`flex-1 flex flex-col items-center py-2 transition cursor-pointer relative ${
                isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon className={`w-4 h-4 mb-1 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className={`text-[10px] font-bold tracking-wider ${isActive ? 'text-white' : ''}`}>
                {label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-white rounded-full" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
