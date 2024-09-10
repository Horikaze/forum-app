import { gameCodeRecord } from "../constants/games";
import { ReplayApiInfo } from "../types/gameTypes";

export const getGameInt = (gameCode: string) => {
  return gameCodeRecord[gameCode] || 6;
};
export const getGameString = (gameNumber: number) => {
  const gameCode = Object.keys(gameCodeRecord).find(
    (key) => gameCodeRecord[key] === gameNumber,
  );
  return gameCode || "EOSD";
};

export const getCCstring = (CCNumber: number) => {
  const AchievementRank = {
    CC: 1,
    NM: 2,
    NB: 3,
    NMNB: 4,
    NNN: 5,
    NNNN: 6,
  };
  const CCString = Object.keys(AchievementRank).find(
    //@ts-ignore
    (key) => AchievementRank[key] === CCNumber,
  );
  return CCString || "CC";
};
export const getGameNumberFromReplayName = (replayName: string) => {
  try {
    const game = parseInt(replayName.split("_")[0].substring(2));
    return game;
  } catch (error) {
    return 6;
  }
};
export const getCharacterFromData = (
  replyData: ReplayApiInfo,
  includeType: boolean = false,
) => {
  const { character, shotType } = replyData;
  if (!character) {
    return "";
  }
  if (character instanceof Array) {
    const characterWithoutSpaces = character[0]
      .split(" vs ")[0]
      .replace(/\s/g, "");
    return includeType
      ? `${characterWithoutSpaces} ${shotType}`
      : characterWithoutSpaces;
  }
  return includeType ? `${character} ${shotType}` : character;
};
