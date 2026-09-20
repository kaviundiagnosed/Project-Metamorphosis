export interface ExerciseItem {
  id: string;
  name: string;
  instruction: string;
  prescriptionType: string;
  prescriptionValue: string;
  userNotes?: string;
  possibleNextVariation?: string;
}

export interface TestResults {
  pullUps: string;
  pushUps: string;
  squat: string;
  wallSit: string;
  deadHang: string;
  verticalJump: string;
  broadJump: string;
  endurance: string;
  notes: string;
}

export interface CycleData {
  phase: number;
  completedDays: number[];
  circuit: ExerciseItem[];
  recoveryCardio: ExerciseItem[];
  power: ExerciseItem[];
  testResults: TestResults | null;
}

export interface AppState {
  currentCycle: number;
  currentDay: number;
  cycles: Record<number, CycleData>;
}

export type TabType = 'TODAY' | 'CYCLE' | 'EDIT' | 'DATA';
