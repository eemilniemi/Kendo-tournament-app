import type { Tournament, TournamentType, Category } from "types/models";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";

// Filter tournaments that are happening / have happened within given dates
export const filterByTime = (
  tournaments: Tournament[],
  startingFrom: Dayjs | null,
  endingAt: Dayjs | null
): Tournament[] => {
  return tournaments.filter((tournament) => {
    const starts = dayjs(tournament.startDate).startOf("day");
    const ends = dayjs(tournament.endDate).startOf("day");

    if (startingFrom === null && endingAt === null) {
      return true; // Include all tournaments when both criteria are null
    }

    if (startingFrom !== null && endingAt !== null) {
      return starts.isBefore(endingAt) && ends.isAfter(startingFrom);
    }

    if (startingFrom !== null && endingAt === null) {
      return starts.isBefore(startingFrom) && ends.isAfter(startingFrom);
    }

    if (startingFrom === null && endingAt !== null) {
      return starts.isBefore(endingAt) && ends.isAfter(endingAt);
    }

    return false; // Exclude the tournament if none of the conditions match
  });
};

// Filter tournaments the user participates/has participated in
export const filterByParticipation = (
  tournaments: Tournament[],
  userId: string
): Tournament[] => {
  const filtered = tournaments.filter((tournament) =>
    tournament.players.some((player) => player.id === userId)
  );
  return filtered;
};

export const filterByTournamentType = (
  tournaments: Tournament[],
  typesOfTournament: TournamentType[]
): Tournament[] => {
  const filtered = tournaments.filter((tournament) =>
    typesOfTournament.includes(tournament.type)
  );
  return filtered;
};

export const filterByCategory = (
  tournaments: Tournament[],
  categoriesOfTournament: Category[]
): Tournament[] => {
  const filtered = tournaments.filter((tournament) =>
    categoriesOfTournament.includes(tournament.category)
  );
  return filtered;
};

export const filterByLocation = (
  tournaments: Tournament[],
  locationOfTournament: string
): Tournament[] => {
  const filtered = tournaments.filter(
    (tournament) => tournament.location === locationOfTournament
  );
  return filtered;
};
