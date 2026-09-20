import { ExerciseItem, CycleData, AppState } from './types';

export const DEFAULT_CIRCUIT: ExerciseItem[] = [
  { id: 'c1', name: 'Pull-ups', instruction: 'Stop when another clean repetition cannot be completed.', prescriptionType: 'Technical failure', prescriptionValue: '' },
  { id: 'c2', name: 'Squats', instruction: 'Perform to technical failure.', prescriptionType: 'Technical failure', prescriptionValue: '' },
  { id: 'c3', name: 'Pull-ups', instruction: 'Perform to technical failure.', prescriptionType: 'Technical failure', prescriptionValue: '' },
  { id: 'c4', name: 'Squats', instruction: 'Perform to technical failure.', prescriptionType: 'Technical failure', prescriptionValue: '' },
  { id: 'c5', name: 'Pull-ups', instruction: 'Perform to technical failure.', prescriptionType: 'Technical failure', prescriptionValue: '' },
  { id: 'c6', name: 'Squats', instruction: 'Perform to technical failure.', prescriptionType: 'Technical failure', prescriptionValue: '' },
  { id: 'c7', name: '90-SECOND BREAK', instruction: 'Rest and recover.', prescriptionType: 'Rest period', prescriptionValue: '90s' },
  { id: 'c8', name: 'Push-ups', instruction: 'Perform to technical failure.', prescriptionType: 'Technical failure', prescriptionValue: '' },
  { id: 'c9', name: 'Wall sit', instruction: 'Perform to technical failure.', prescriptionType: 'Technical failure', prescriptionValue: '' },
  { id: 'c10', name: 'Push-ups', instruction: 'Perform to technical failure.', prescriptionType: 'Technical failure', prescriptionValue: '' },
  { id: 'c11', name: 'Wall sit', instruction: 'Perform to technical failure.', prescriptionType: 'Technical failure', prescriptionValue: '' },
  { id: 'c12', name: 'Push-ups', instruction: 'Perform to technical failure.', prescriptionType: 'Technical failure', prescriptionValue: '' },
  { id: 'c13', name: 'Wall sit', instruction: 'Perform to technical failure.', prescriptionType: 'Technical failure', prescriptionValue: '' }
];

export const DEFAULT_RECOVERY: ExerciseItem[] = [
  { id: 'r1', name: 'Easy mobility', instruction: 'Focus on loosening joints.', prescriptionType: 'User-defined instruction', prescriptionValue: 'Duration determined by feel' },
  { id: 'r2', name: 'Easy jump rope', instruction: 'Light, continuous bouncing.', prescriptionType: 'User-defined instruction', prescriptionValue: 'Determined by feel' },
  { id: 'r3', name: 'Easy walking / very easy jogging', instruction: 'Conversational pace.', prescriptionType: 'User-defined instruction', prescriptionValue: 'Determined by feel' },
  { id: 'r4', name: 'Easy mobility / cooldown', instruction: 'Static stretching and relaxing.', prescriptionType: 'User-defined instruction', prescriptionValue: 'Determined by feel' }
];

const pwrStep: ExerciseItem[] = [
  { id: 'p1', name: 'Explosive Squat', instruction: 'Controlled squat, drive upward explosively. Jump vertically. Prioritize height.', prescriptionType: 'Rounds', prescriptionValue: 'Quality reps' },
  { id: 'p2', name: 'Broad Jump', instruction: 'Load hips, jump forward explosively. Land on both feet and stabilize.', prescriptionType: 'Rounds', prescriptionValue: 'Quality reps' },
  { id: 'p3', name: 'Lateral Bound', instruction: 'Push explosively from one leg laterally to the other. Land and stabilize.', prescriptionType: 'Rounds', prescriptionValue: 'Quality reps' },
  { id: 'p4', name: 'Short Acceleration Sprint', instruction: 'Controlled start, accelerate hard over short distance, decelerate safely.', prescriptionType: 'Rounds', prescriptionValue: 'Quality reps' }
];

export const DEFAULT_POWER: ExerciseItem[] = [
  ...pwrStep.map(e => ({ ...e, id: e.id + '_1' })),
  ...pwrStep.map(e => ({ ...e, id: e.id + '_2' })),
  ...pwrStep.map(e => ({ ...e, id: e.id + '_3' }))
];

export const WORKOUT_PATTERN = ['CIRCUIT', 'RECOVERY + CARDIO', 'POWER', 'RECOVERY + CARDIO'] as const;

export const PRESCRIPTION_OPTIONS = [
  'Technical failure',
  'Timed',
  'Repetitions',
  'Distance',
  'Duration',
  'Sets',
  'Rounds',
  'Rest period',
  'User-defined instruction'
];

export const BENCHMARK_FIELDS = [
  { key: 'pullUps', label: 'Pull-ups' },
  { key: 'pushUps', label: 'Push-ups' },
  { key: 'squat', label: 'Squat' },
  { key: 'wallSit', label: 'Wall Sit' },
  { key: 'deadHang', label: 'Dead Hang' },
  { key: 'verticalJump', label: 'Vertical Jump' },
  { key: 'broadJump', label: 'Broad Jump' },
  { key: 'endurance', label: 'Endurance' }
] as const;

export const generateDefaultCycle = (phase: number = 1): CycleData => ({
  phase,
  completedDays: [],
  circuit: JSON.parse(JSON.stringify(DEFAULT_CIRCUIT)),
  recoveryCardio: JSON.parse(JSON.stringify(DEFAULT_RECOVERY)),
  power: JSON.parse(JSON.stringify(DEFAULT_POWER)),
  testResults: null
});

export const INITIAL_STATE: AppState = {
  currentCycle: 1,
  currentDay: 1,
  cycles: {
    1: generateDefaultCycle(1)
  }
};
