import type { Tournament } from "types/models";

export const sortTournamentsByMostRecent = (
  tournaments: Tournament[]
): Tournament[] => {
  return tournaments.sort((a, b) => {
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });
};

export const sortTournamentsByOldest = (
  tournaments: Tournament[]
): Tournament[] => {
  return tournaments.sort((a, b) => {
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });
};

export const sortTournamentsByName = (
  tournaments: Tournament[]
): Tournament[] => {
  return tournaments.sort((a, b) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    if (nameA < nameB) {
      return -1;
    } else if (nameA > nameB) {
      return 1;
    } else {
      return 0;
    }
  });
};

export const sortTournamentsByDescName = (
  tournaments: Tournament[]
): Tournament[] => {
  return tournaments.sort((a, b) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    if (nameA > nameB) {
      return -1;
    } else if (nameA < nameB) {
      return 1;
    } else {
      return 0;
    }
  });
};

export const sortTournamentsByLocation = (
  tournaments: Tournament[]
): Tournament[] => {
  return tournaments.sort((a, b) => {
    const locationA = a.location.toLowerCase();
    const locationB = b.location.toLowerCase();
    if (locationA < locationB) {
      return -1;
    } else if (locationA > locationB) {
      return 1;
    } else {
      return 0;
    }
  });
};
