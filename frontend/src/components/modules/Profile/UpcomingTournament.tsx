import React, { useEffect, useState } from "react";
import {
  Typography,
  Table,
  TableCell,
  TableContainer,
  Paper,
  Box
} from "@mui/material";
import api from "api/axios";
import { useAuth } from "context/AuthContext";
import type { Tournament } from "types/models";

const UpcomingTournament: React.FC = () => {
  const { userId } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    const fetchTournaments = async (): Promise<void> => {
      try {
        const tournamentsData = await api.tournaments.getAll();
        const filteredTournaments = tournamentsData.filter(
          (tournament) =>
            tournament.players.some((player) => player.id === userId) &&
            new Date(tournament.startDate) > new Date()
        );
        // Sort tournaments based on startDate
        filteredTournaments.sort(
          (a, b) =>
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        );
        setTournaments(filteredTournaments);
      } catch (error) {
        console.error("Error fetching tournaments:", error);
      }
    };

    void fetchTournaments();
  }, [userId]);

  return (
    <>
      <Typography>My upcoming tournaments</Typography>
      {tournaments.map((tournament) => {
        return (
          <Box key={tournament.id}>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }}>
                <TableCell>{tournament.name}</TableCell>
                <TableCell>{tournament.category}</TableCell>
                <TableCell>
                  {new Date(tournament.startDate).toLocaleDateString("fi-FI")}
                </TableCell>
                <TableCell>{tournament.location}</TableCell>
              </Table>
            </TableContainer>
            <Typography>Known matches</Typography>
          </Box>
        );
      })}
    </>
  );
};

export default UpcomingTournament;
