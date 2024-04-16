import type React from "react";
import { useTournament } from "context/TournamentContext";
import { type Tournament } from "types/models";

interface Props {
  firstName: string;
  lastName: string;
  sameNames: boolean;
}

// Check if there are players with the same first names in the tournament
export const checkSameNames: (tournament: Tournament) => boolean = (
  tournament
) => {
  const firstNames = tournament.players.map((player) => player.firstName);
  const uniqueFirstNames = [...new Set(firstNames)];
  if (firstNames.length !== uniqueFirstNames.length) {
    return true;
  } else {
    return false;
  }
};

const PlayerName: React.FC<Props> = ({ firstName, lastName, sameNames }) => {
  const tournament = useTournament();
  const allPlayers = tournament.players;
  // Check if players in the tournament have the same first name
  const displayLastNameInitial = (
    firstName: string,
    lastName: string
  ): string => {
    if (sameNames) {
      const tournamentPlayers = allPlayers.filter(
        (player) => player.firstName === firstName
      );
      if (tournamentPlayers.length > 1) {
        return `${firstName} ${lastName.charAt(0)}.`;
      } else {
        return `${firstName}`;
      }
    } else {
      return `${firstName}`;
    }
  };

  return displayLastNameInitial(firstName, lastName);
};

export default PlayerName;
