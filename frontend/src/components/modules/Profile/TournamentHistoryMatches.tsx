import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button
} from "@mui/material";
import { useAuth } from "context/AuthContext";
import api from "api/axios";
import type { Tournament, Match, User } from "types/models";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";

interface TournamentHistoryMatchesProps {
  tournamentId: string;
}

const TournamentHistoryMatches: React.FC<TournamentHistoryMatchesProps> = ({
  tournamentId
}) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const { userId } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTournamentData = async (): Promise<void> => {
      try {
        const selectedTournament =
          await api.tournaments.getTournament(tournamentId);
        if (selectedTournament !== null) {
          setTournament(selectedTournament);

          // Filter matches that involve the current user
          const userMatches = selectedTournament.matchSchedule.filter((match) =>
            match.players.some((player) => player.id === userId)
          );
          setMatches(userMatches);
        }
      } catch (error) {
        console.error("Error fetching tournament data:", error);
      }
    };

    void fetchTournamentData();
  }, [tournamentId, userId]);

  const getPlayerNameById = (players: User[], playerId: string): string => {
    const player = players.find((player) => player.id === playerId);
    return player !== undefined && player !== null
      ? `${player.firstName} ${player.lastName}`
      : t("Unknown Player");
  };

  const getOpponentName = (match: Match): string => {
    if (tournament === null) {
      return t("Unknown Tournament");
    }
    const opponent = match.players.find((player) => player.id !== userId);
    return opponent !== undefined && opponent !== null
      ? getPlayerNameById(tournament.players, opponent.id)
      : t("BYE");
  };

  const getResult = (match: Match): string => {
    if (userId === null || userId === undefined) {
      return "";
    }
    const player = match.players.find((p) => p.id === userId);
    const opponent = match.players.find((p) => p.id !== userId);

    if (player !== undefined && player !== null && opponent !== null) {
      const isDraw = match.player1Score === match.player2Score;
      const isWin =
        (match.player1Score > match.player2Score &&
          player.id === match.players[0].id) ||
        (match.player2Score > match.player1Score &&
          player.id === match.players[1].id);

      if (isDraw)
        return `${t("profile.draw")} (${match.player1Score}-${
          match.player2Score
        })`;
      return isWin
        ? `${t("profile.win")} (${match.player1Score}-${match.player2Score})`
        : `${t("profile.loss")} (${match.player1Score}-${match.player2Score})`;
    }
    return "";
  };

  const getUserPoints = (match: Match): string => {
    if (userId === null || userId === undefined) {
      return "-";
    }
    const player = match.players.find((p) => p.id === userId);
    return player !== undefined && player !== null
      ? player.points.map((point) => point.type).join(", ")
      : "-";
  };

  if (tournament === null) {
    return <Typography>{t("No tournament data available")}</Typography>;
  }

  return (
    <Box>
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          navigate("/profile?tab=history");
        }}
      >
        <ArrowBack sx={{ fontSize: "20px" }} />
      </Button>
      <Typography variant="h5" margin={"10px 0"} gutterBottom>
        {tournament.name} -{" "}
        {new Date(tournament.startDate).toLocaleDateString("en-gb", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
        })}
      </Typography>
      <TableContainer
        component={Paper}
        sx={{ width: "100%", margin: "0 auto" }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t("profile.match")}</TableCell>
              <TableCell>{t("profile.opponent")}</TableCell>
              <TableCell>{t("profile.result")}</TableCell>
              <TableCell>{t("profile.my_points")}</TableCell>
              <TableCell>{t("")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {matches.map((match, index) => (
              <TableRow key={match.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{getOpponentName(match)}</TableCell>
                <TableCell>{getResult(match)}</TableCell>
                <TableCell>{getUserPoints(match)}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      navigate(
                        `/tournaments/${tournament.id}/match/${match.id}`
                      );
                    }}
                  >
                    {t("profile.more_info")}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TournamentHistoryMatches;
