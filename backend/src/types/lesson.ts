export type Representation = 'number_line' | 'bar' | 'circle' | 'symbolic';
export type StepType = 'info' | 'question' | 'checkpoint';
export type AnswerType = 'placement' | 'shading' | 'choice' | 'none';

export interface StepDefinition {
  id: string;
  order: number;
  conceptId: 'fractions-as-magnitudes';
  representation: Representation;
  stepType: StepType;
  prompt: string;
  answerType: AnswerType;
  correctAnswer: Record<string, unknown> | null;
  metadata?: {
    difficulty?: 'intro' | 'core' | 'challenge';
    tags?: string[];
    alternateFor?: string;
  };
}

export interface AdaptiveInfo {
  reason: string;
  accuracy?: number;
  attempts?: number;
  switchedRepresentation?: Representation;
}
