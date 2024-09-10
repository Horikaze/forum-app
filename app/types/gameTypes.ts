export type ReplayApiInfo = {
  character: string | string[];
  date: string;
  player: string;
  rank: string;
  rpyName: string;
  shotType: string;
  slowRate: number;
  stage: string;
  stageScore: number[];
};

export type ReplayFormData = {
  CC?: string;
  comment?: string;
  character?: string;
  date?: string;
  player?: string;
  rank?: string;
  selectReplay?: File;
  slowRate?: string;
  type?: string;
  stage?: string;
  score?: string;
  fileDate?: string;
  videoLink?: string;
};

type DiffReplay = {
  score: number | null;
  id: string | null;
  CC: number | null;
  char: string | null;
};

export type ScoreObject = {
  EASY: DiffReplay;
  NORMAL: DiffReplay;
  HARD: DiffReplay;
  LUNATIC: DiffReplay;
  EXTRA: DiffReplay;
  PHANTASM?: DiffReplay;
  [key: string]: DiffReplay | undefined;
};
