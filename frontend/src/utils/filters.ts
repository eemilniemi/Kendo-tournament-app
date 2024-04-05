import type { Tournament, TournamentType, Category } from "types/models";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";

// Filter tournaments that are happening / have happened within given dates
export const filterByTime = (
  tournaments: Tournament[],
  startingFrom: Dayjs,
  endingAt: Dayjs
): Tournament[] => {
  const filtered = tournaments.filter((tournament) => {
    const starts = dayjs(tournament.startDate);
    const ends = dayjs(tournament.endDate);

    // Set hours and minutes to zero to ignore them in comparisons, only dates matter
    starts.startOf("day");
    ends.startOf("day");

    // Check that the event is ongoing during user given dates
    return (
      (starts.isBefore(startingFrom) || starts.isSame(startingFrom)) &&
      (ends.isAfter(endingAt) || ends.isSame(endingAt))
    );
  });
  return filtered;
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
