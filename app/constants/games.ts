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
export const games618 = allGamesString.splice(5);

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
export const emptyScoreObject = {
  EASY: { score: 0, id: "", CC: 0, char: "" },
  NORMAL: { score: 0, id: "", CC: 0, char: "" },
  HARD: { score: 0, id: "", CC: 0, char: "" },
  LUNATIC: { score: 0, id: "", CC: 0, char: "" },
  EXTRA: { score: 0, id: "", CC: 0, char: "" },
  PHANTASM: { score: 0, id: "", CC: 0, char: "" },
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
