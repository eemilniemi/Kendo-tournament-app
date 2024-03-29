import type React from "react";
import { useTournament } from "context/TournamentContext";

interface Props {
  firstName: string;
  lastName: string;
}

const PlayerName: React.FC<Props> = ({ firstName, lastName }) => {
  const tournament = useTournament();
  const allPlayers = tournament.players;
  // Check if players in the tournament have the same first name
  const displayLastNameInitial = (
    firstName: string,
    lastName: string
  ): string => {
    const tournamentPlayers = allPlayers.filter(
      (player) => player.firstName === firstName
    );
    if (tournamentPlayers.length > 1) {
      return `${firstName} ${lastName.charAt(0)}.`;
    } else {
      return `${firstName}`;
    }
  };

  return displayLastNameInitial(firstName, lastName);
};

export default PlayerName;
