export interface LearnerState {
  sessionId: string;
  conceptId: 'fractions-as-magnitudes';
  mastery: number;
  errorPatterns: string[];
  bestRepresentation?: string | null;
  hintUsageRate: number;
  avgDwellTime: number;
}
