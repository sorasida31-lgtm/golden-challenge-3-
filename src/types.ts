export interface QuizItem {
  question: string;
  question_kr: string;
  options: string[];
  correctAnswer: string;
}

export interface QuizItemL2 {
  question: string;
  question_kr: string;
  answerPrompt: string; // e.g., "Yes, I ___."
  correctAnswers: string[]; // e.g., ["do"] or ["can't", "cannot"]
}

export interface QuizItemL3 {
  question: string;
  question_kr: string;
  answerPrompt: string; // e.g., "Yes___ I am___"
  correctAnswers: string[]; // e.g., [",", "."]
}

export type Gender = 'male' | 'female' | null;

export interface StudentInfo {
  grade: string;
  class: string;
  name: string;
  gender: Gender;
}

export enum GameState {
  Start,
  Playing,
  Finished,
}

export interface Rewards {
  rubyKeys: number;
  sapphireKeys: number;
  goldenKeys: number;
}