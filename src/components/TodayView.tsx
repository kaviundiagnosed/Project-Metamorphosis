import React, { useState, useEffect } from 'react';
import { AppState, ExerciseItem, TestResults } from '../types';
import { WORKOUT_PATTERN, BENCHMARK_FIELDS } from '../data';
import { Check, ArrowRight, RotateCcw, Timer, Play, Pause } from 'lucide-react';

interface TodayViewProps {
  state: AppState;
  completeWorkout: () => void;
  completeTest: (results: TestResults) => void;
}

export function TodayView({ state, completeWorkout, completeTest }: TodayViewProps) {
  const { currentCycle, currentDay, cycles } = state;
  const cycle = cycles[currentCycle];

  if (currentDay > 30) {
    return (
      <TestView
        cycleNum={currentCycle}
        previousCycle={cycles[currentCycle - 1]}
        onSave={completeTest}
      />
    );
  }

  const workoutType = WORKOUT_PATTERN[(currentDay - 1) % 4];
  let workoutList: ExerciseItem[] = [];
  if (workoutType === 'CIRCUIT') workoutList = cycle?.circuit || [];
  if (workoutType === 'RECOVERY + CARDIO') workoutList = cycle?.recoveryCardio || [];
  if (workoutType === 'POWER') workoutList = cycle?.power || [];

  return (
    <WorkoutRunner
      cycleNum={currentCycle}
      dayNum={currentDay}
      workoutType={workoutType}
      list={workoutList}
      onComplete={completeWorkout}
    />
  );
}

interface WorkoutRunnerProps {
  cycleNum: number;
  dayNum: number;
  workoutType: string;
  list: ExerciseItem[];
  onComplete: () => void;
}

function WorkoutRunner({ cycleNum, dayNum, workoutType, list, onComplete }: WorkoutRunnerProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    setStepIndex(0);
    setTimerSeconds(null);
    setTimerRunning(false);
  }, [cycleNum, dayNum]);

  const step = list && list.length > 0 ? list[stepIndex] : null;

  // Auto-detect seconds in rest step prescription
  useEffect(() => {
    if (step && (step.prescriptionType === 'Rest period' || step.name.toLowerCase().includes('break') || step.name.toLowerCase().includes('rest'))) {
      const match = step.prescriptionValue.match(/(\d+)\s*s/i) || step.name.match(/(\d+)\s*sec/i);
      const secs = match ? parseInt(match[1], 10) : 90;
      setTimerSeconds(secs);
      setTimerRunning(false);
    } else {
      setTimerSeconds(null);
      setTimerRunning(false);
    }
  }, [stepIndex, step]);

  // Handle countdown interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning && timerSeconds !== null && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, timerSeconds]);

  if (!list || list.length === 0) {
    return (
      <div id="workout-empty-view" className="p-8 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-red-400 font-bold mb-4 tracking-wide">Workout configuration is empty for this category.</p>
        <button
          id="skip-empty-day-btn"
          onClick={onComplete}
          className="w-full max-w-xs bg-zinc-800 hover:bg-zinc-700 text-white p-4 font-bold rounded-xl transition"
        >
          SKIP DAY
        </button>
      </div>
    );
  }

  const isLast = stepIndex === list.length - 1;

  const handleNext = () => {
    setStepIndex(s => s + 1);
  };

  return (
    <div id="workout-runner" className="flex flex-col h-full p-6 justify-between animate-in fade-in duration-200">
      {/* Top Program Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <p className="text-zinc-500 font-bold tracking-widest text-xs uppercase">
            CYCLE {cycleNum} • DAY {dayNum} / 30
          </p>
          <span className="text-zinc-600 text-xs font-mono">
            {Math.round(((dayNum - 1) / 30) * 100)}% cycle
          </span>
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight mt-1">{workoutType}</h2>
        {/* Progress bar */}
        <div className="w-full bg-zinc-900 h-1.5 rounded-full mt-3 overflow-hidden">
          <div
            className="bg-white h-full transition-all duration-300"
            style={{ width: `${((stepIndex + 1) / list.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Movement Presentation */}
      <div className="flex-1 flex flex-col justify-center items-center text-center py-4 my-auto">
        <p className="text-zinc-600 font-bold tracking-wider text-sm mb-3">
          STEP {stepIndex + 1} OF {list.length}
        </p>
        
        <h3 className="text-3xl sm:text-4xl font-black mb-4 tracking-tight text-white px-2">
          {step?.name}
        </h3>

        {step?.prescriptionValue ? (
          <div className="bg-zinc-900/90 border border-zinc-800 px-5 py-2.5 rounded-xl mb-6 inline-flex items-center gap-2">
            <span className="font-bold text-white text-lg tracking-wide">{step.prescriptionValue}</span>
            <span className="text-zinc-400 text-xs uppercase tracking-wider">({step.prescriptionType})</span>
          </div>
        ) : (
          <div className="mb-6">
            <span className="text-zinc-400 text-xs uppercase tracking-widest bg-zinc-900 px-3 py-1.5 rounded-md border border-zinc-800">
              Type: {step?.prescriptionType}
            </span>
          </div>
        )}

        {/* Optional Timer Widget if resting */}
        {timerSeconds !== null && (
          <div className="mb-6 flex flex-col items-center bg-zinc-950 border border-zinc-800 rounded-2xl p-4 w-full max-w-xs shadow-inner">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Timer className="w-4 h-4 text-white" />
              <span>Rest Counter</span>
            </div>
            <div className={`text-4xl font-mono font-black mb-3 ${timerSeconds === 0 ? 'text-green-400 animate-pulse' : 'text-white'}`}>
              {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
            </div>
            <div className="flex items-center gap-2">
              <button
                id="timer-toggle-btn"
                onClick={() => setTimerRunning(!timerRunning)}
                className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
              >
                {timerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {timerRunning ? 'PAUSE' : timerSeconds === 0 ? 'RESTART' : 'START'}
              </button>
              <button
                id="timer-reset-btn"
                onClick={() => {
                  setTimerRunning(false);
                  const match = step?.prescriptionValue.match(/(\d+)\s*s/i) || step?.name.match(/(\d+)\s*sec/i);
                  setTimerSeconds(match ? parseInt(match[1], 10) : 90);
                }}
                className="p-2 text-zinc-500 hover:text-white transition"
                title="Reset timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step?.instruction && (
          <p className="text-zinc-300 text-base sm:text-lg leading-relaxed max-w-sm font-normal">
            {step.instruction}
          </p>
        )}

        {step?.userNotes && (
          <div className="mt-5 text-zinc-400 italic text-xs max-w-xs border-t border-zinc-800/80 pt-3">
            <span className="font-semibold text-zinc-500 not-italic uppercase tracking-wider text-[10px] block mb-1">
              Personal Notes
            </span>
            "{step.userNotes}"
          </div>
        )}

        {step?.possibleNextVariation && (
          <div className="mt-3 text-sky-400 text-xs max-w-xs bg-sky-950/30 border border-sky-900/40 px-3 py-2 rounded-lg">
            <span className="font-bold text-[10px] uppercase tracking-wider block text-sky-300">
              Future Progression Idea
            </span>
            {step.possibleNextVariation}
          </div>
        )}
      </div>

      {/* Primary Action Button */}
      <div className="mt-6 pb-2">
        {!isLast ? (
          <button
            id="workout-next-step-btn"
            onClick={handleNext}
            className="w-full bg-white hover:bg-zinc-200 active:scale-[0.99] text-black text-xl font-black py-5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>NEXT</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            id="workout-complete-btn"
            onClick={onComplete}
            className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-black text-xl font-black py-5 rounded-xl transition-all shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="w-6 h-6 stroke-[3]" />
            <span>TRAINING COMPLETE</span>
          </button>
        )}
      </div>
    </div>
  );
}

interface TestViewProps {
  cycleNum: number;
  previousCycle?: { testResults: TestResults | null };
  onSave: (results: TestResults) => void;
}

function TestView({ cycleNum, previousCycle, onSave }: TestViewProps) {
  const [results, setResults] = useState<TestResults>({
    pullUps: '',
    pushUps: '',
    squat: '',
    wallSit: '',
    deadHang: '',
    verticalJump: '',
    broadJump: '',
    endurance: '',
    notes: ''
  });

  const prevTest = previousCycle?.testResults || null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(results);
  };

  return (
    <div id="test-view-container" className="p-6 max-w-lg mx-auto pb-16">
      <div className="mb-6">
        <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-full">
          30-Day Milestone
        </span>
        <h2 className="text-3xl font-black mt-2 tracking-tight text-white uppercase">
          CYCLE {cycleNum} COMPLETE
        </h2>
        <p className="text-zinc-400 text-sm mt-1">
          Record your athletic testing benchmarks before graduating to the next cycle.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {BENCHMARK_FIELDS.map(({ key, label }) => {
          const prevVal = prevTest ? prevTest[key as keyof TestResults] : null;
          return (
            <div key={key} className="bg-zinc-950 border border-zinc-900 p-3.5 rounded-xl">
              <div className="flex justify-between items-baseline mb-1">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  {label}
                </label>
                {prevVal && (
                  <span className="text-[11px] text-zinc-500 font-mono">
                    Prev: {prevVal}
                  </span>
                )}
              </div>
              <input
                id={`test-input-${key}`}
                type="text"
                value={results[key as keyof TestResults]}
                onChange={e => setResults({ ...results, [key]: e.target.value })}
                placeholder="Result (reps, time, or distance)..."
                className="mt-1"
              />
            </div>
          );
        })}

        <div className="bg-zinc-950 border border-zinc-900 p-3.5 rounded-xl">
          <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1">
            Performance & Conditioning Notes
          </label>
          <textarea
            id="test-input-notes"
            rows={3}
            value={results.notes}
            onChange={e => setResults({ ...results, notes: e.target.value })}
            placeholder="Recovery observations, fatigue, diet adjustments..."
          />
        </div>

        <button
          id="test-save-next-cycle-btn"
          type="submit"
          className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-black font-black py-4 rounded-xl transition text-base uppercase tracking-wider shadow-lg shadow-emerald-950/40 cursor-pointer"
        >
          SAVE & START NEXT CYCLE
        </button>
      </form>
    </div>
  );
}
