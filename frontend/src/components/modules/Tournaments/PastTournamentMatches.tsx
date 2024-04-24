import React from "react";
import { useParams } from "react-router-dom";
import { useTournaments } from "context/TournamentsContext";
import type { User, Match, MatchPoint, MatchPlayer } from "types/models";
import { Grid, Typography, Paper } from "@mui/material";

const PastTournamentMatches: React.FC = () => {
  const { tournamentId } = useParams();
  const { past } = useTournaments();
  const selectedTournament = past.find(
    (tournament) => tournament.id === tournamentId
  );

  if (selectedTournament === null || selectedTournament === undefined) {
    return <div>Tournament not found.</div>;
  }

  return (
    <div>
      <Typography variant="h4" sx={{ marginBottom: 4 }}>
        {selectedTournament.name}
      </Typography>
      <Typography variant="h6" sx={{ marginBottom: 4 }}>
        {selectedTournament.type}
      </Typography>

      {/* Fetch match player names */}
      {selectedTournament.matchSchedule.map((match: Match, index: number) => {
        const matchPlayers = match.players.map((player: MatchPlayer) => {
          const user: User | undefined = selectedTournament.players.find(
            (tournamentPlayer: User) => tournamentPlayer.id === player.id
          );
          return `${user?.firstName ?? "Unknown"} ${user?.lastName ?? "User"}`;
        });

        let player1Points = 0;
        let player2Points = 0;

        match.players[0].points.forEach((point: MatchPoint) => {
          if (point.type === "hansoku") {
            player2Points += 0.5;
          } else {
            player1Points += 1;
          }
        });
        if (match.players.length === 2) {
          match.players[1].points.forEach((point: MatchPoint) => {
            if (point.type === "hansoku") {
              player1Points += 0.5;
            } else {
              player2Points += 1;
            }
          });
        }

        player1Points = Math.floor(player1Points);
        player2Points = Math.floor(player2Points);

        return (
          <Paper key={index} elevation={2} style={{ padding: "10px" }}>
            <Grid container justifyContent="center" rowSpacing={2}>
              <Grid item xs={2}>
                <Typography variant="body1">{matchPlayers[0]}</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography variant="body1">
                  {player1Points} - {player2Points}
                </Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography variant="body1">
                  {matchPlayers[1] ? matchPlayers[1] : "BYE"}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        );
      })}
    </div>
  );
};

export default PastTournamentMatches;
