import type { Tournament } from "../types/models";

// function to calculate elapsed match time
export const calculateElapsedTime = (
  elapsedTime: number,
  timerStart: Date | null,
  matchTime: number,
  isOvertime: boolean
): number => {
  if (timerStart !== null) {
    const currentTime = new Date();
    const startTimestamp = new Date(timerStart);

    const elapsedMilliseconds =
      currentTime.getTime() - startTimestamp.getTime();
    elapsedTime += elapsedMilliseconds;

    if (elapsedTime > matchTime && !isOvertime) {
      elapsedTime = matchTime;
    }
    return elapsedTime;
  } else {
    return elapsedTime;
  }
};

// finds player name from tournament (since MatchPlayer does not include names)
export const findPlayerName = (
  playerId: string,
  tournament: Tournament
): { firstName: string; lastName: string } => {
  const player = tournament.players.find((p) => p.id === playerId);

  if (player !== undefined) {
    return { firstName: player.firstName, lastName: player.lastName };
  }

  return { firstName: "", lastName: "" };
};

export const findPlayerNationality = (
  playerId: string,
  tournament: Tournament
): string | null => {
  const player = tournament.players.find((p) => p.id === playerId);

  if (player !== undefined) {
    return player.nationality;
  }

  return null;
};

export const findPlayerDanRank = (
  playerId: string,
  tournament: Tournament
): string | null => {
  const player = tournament.players.find((p) => p.id === playerId);

  if (player !== undefined) {
    return player.danRank;
  }

  return null;
};
