import { ScoreObject } from "../types/gameTypes";

export const allGamesString = [
  "HRtP",
  "SoEW",
  "PoDD",
  "LLS",
  "MS",
  "EoSD",
  "PCB",
  "IN",
  "PoFV",
  "MoF",
  "SA",
  "UFO",
  "GFW",
  "TD",
  "DDC",
  "LoLK",
  "HSiFS",
  "WBaWC",
  "UM",
  "UDoALG",
];

export const achievementList = ["CC", "NM", "NB", "NMNB", "NNN", "NNNN"];

export const touhouDifficulty = [
  "Easy",
  "Normal",
  "Hard",
  "Lunatic",
  "Extra",
  "Phantasm",
];
export const touhouDifficultysTable = touhouDifficulty.slice(0, -1);

export const shotTypeList = ["A", "B", "C", "Wolf", "Otter", "Eagle"];

export const achievementRankValues: Record<string, number> = {
  CC: 1,
  NM: 2,
  NB: 3,
  NMNB: 4,
  NNN: 5,
  NNNN: 6,
};
export const gameCodeRecord: Record<string, number> = {
  hrtp: 6,
  soew: 6,
  podd: 6,
  lls: 6,
  ms: 6,
  pcb: 7,
  in: 8,
  pofv: 9,
  mof: 10,
  sa: 11,
  ufo: 12,
  gfw: 128,
  td: 13,
  ddc: 14,
  lolk: 15,
  hsifs: 16,
  wbawc: 17,
  um: 18,
};

export const emptyScoreObject: ScoreObject = {
  EASY: {
    score: 0,
    id: null,
    CC: 0,
    char: null,
  },
  NORMAL: {
    score: 0,
    id: null,
    CC: 0,
    char: null,
  },
  HARD: {
    score: 0,
    id: null,
    CC: 0,
    char: null,
  },
  LUNATIC: {
    score: 0,
    id: null,
    CC: 0,
    char: null,
  },
  EXTRA: {
    score: 0,
    id: null,
    CC: 0,
    char: null,
  },
  PHANTASM: {
    score: 0,
    id: null,
    CC: 0,
    char: null,
  },
};
const newUserGameRow = JSON.stringify(emptyScoreObject);
export const emptyScoreObjectNewUser = {
  hrtp: newUserGameRow,
  soew: newUserGameRow,
  podd: newUserGameRow,
  lls: newUserGameRow,
  ms: newUserGameRow,
  eosd: newUserGameRow,
  pcb: newUserGameRow,
  in: newUserGameRow,
  pofv: newUserGameRow,
  mof: newUserGameRow,
  sa: newUserGameRow,
  ufo: newUserGameRow,
  gfw: newUserGameRow,
  td: newUserGameRow,
  ddc: newUserGameRow,
  lolk: newUserGameRow,
  hsifs: newUserGameRow,
  wbawc: newUserGameRow,
  um: newUserGameRow,
};
