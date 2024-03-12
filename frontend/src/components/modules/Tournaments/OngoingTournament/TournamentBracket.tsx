import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  CardActionArea
} from "@mui/material";
import { type Match, type User } from "types/models";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface BracketProps {
  match: Match;
  players: User[];
}

const Bracket: React.FC<BracketProps> = ({ match, players }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  // Find the players in the players array using their IDs
  const player1 = players.find(
    (player) => player.id === match.players[0].id
  ) as User;
  const player2 = players.find(
    (player) => player.id === match.players[1].id
  ) as User;

  const winner = match.winner;
  const isWinnerDeclared = winner !== undefined;

  // Get the names of the players
  const player1Name = `${player1.firstName} ${player1.lastName}`;
  const player2Name = `${player2.firstName} ${player2.lastName}`;

  let player1Font = "regular";
  let player2Font = "regular";
  let player1Color = "black";
  let player2Color = "black";
  let player1Lining = "";
  let player2Lining = "";

  if (isWinnerDeclared) {
    player1Font = winner === player1.id ? "700" : "regular";
    player2Font = winner === player2.id ? "700" : "regular";

    player1Color = winner === player1.id ? "black" : "#666666";
    player2Color = winner === player2.id ? "black" : "#666666";

    player1Lining = winner === player1.id ? "underline" : "";
    player2Lining = winner === player2.id ? "underline" : "";
  }

  const officialsInfo = [];

  if (match.elapsedTime <= 0) {
    // Match is upcoming
    const timerPerson = match.timeKeeper ?? undefined;
    const pointMaker = match.pointMaker ?? undefined;

    // depending on which roles are missing for the match, print them under button

    if (timerPerson === undefined && pointMaker === undefined) {
      officialsInfo.push(
        t("tournament_view_labels.missing_timer"),
        t("tournament_view_labels.missing_and")
      );
    } else {
      if (timerPerson === undefined) {
        officialsInfo.push(t("tournament_view_labels.missing_timer"));
      }
      if (pointMaker === undefined) {
        officialsInfo.push(t("tournament_view_labels.missing_point_maker"));
      }
    }
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginBottom: 5
      }}
    >
      <Card variant="outlined" sx={{ mb: 1 }}>
        <CardActionArea
          onClick={() => {
            navigate(`match/${match.id}`);
          }}
        >
          <CardContent>
            <Typography
              textAlign="center"
              style={{
                fontWeight: player1Font,
                color: player1Color,
                textDecoration: player1Lining
              }}
            >
              {player1Name}
            </Typography>
            <Typography textAlign="center"> vs</Typography>
            <Typography
              textAlign="center"
              style={{
                fontWeight: player2Font,
                color: player2Color,
                textDecoration: player2Lining
              }}
            >
              {player2Name}
            </Typography>
            {isWinnerDeclared && (
              <Typography textAlign="center" variant="h6">
                <span style={{ color: player1Color }}>
                  {match.player1Score}
                </span>{" "}
                -{" "}
                <span style={{ color: player2Color }}>
                  {match.player2Score}
                </span>
              </Typography>
            )}
            {match.elapsedTime <= 0 &&
              officialsInfo.map((info, index) => (
                <Typography textAlign="center" key={index} variant="body2">
                  {info}
                </Typography>
              ))}
          </CardContent>
        </CardActionArea>
      </Card>
    </Box>
  );
};

export default Bracket;
