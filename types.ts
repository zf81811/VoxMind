
export enum SceneMode {
  ALL = 'All',
  IDEA = 'Idea',
  MEETING = 'Meeting',
  STUDY = 'Study',
  PERSONAL = 'Personal',
  TODO = 'To-do'
}

export enum MemoType {
  NOTE = 'Note',
  TODO = 'Todo'
}

export interface MindMapNode {
  id: string;
  label: string;
  children?: MindMapNode[];
}

export interface MemoStructuredData {
  title: string;
  summary: string;
  categories: string[]; // Changed from category: string to categories: string[]
  type: MemoType;
  dueDate?: string; // YYYY-MM-DD format extracted by AI
  keyPoints: string[];
  actionItems: string[];
  mindMapNodes?: MindMapNode[];
}

export interface Memo {
  id: string;
  timestamp: number;
  audioUrl?: string;
  transcription: string;
  analysis?: MemoStructuredData;
  sceneMode: SceneMode; // This acts as the primary mode or initial context
  isProcessing: boolean;
}

export interface UserProfile {
  isPro: boolean;
  dailyMemosCount: number;
}
