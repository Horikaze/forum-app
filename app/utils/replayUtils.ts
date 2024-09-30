import { achievementRankValues, gameCodeRecord } from "../constants/games";
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
  const CCString = Object.keys(achievementRankValues).find(
    (key) => achievementRankValues[key] === CCNumber,
  );
  return CCString || "";
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
  replyData: ReplayApiInfo | any,
  includeType: boolean = false,
) => {
  try {
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
  } catch (error) {
    return "";
  }
};
