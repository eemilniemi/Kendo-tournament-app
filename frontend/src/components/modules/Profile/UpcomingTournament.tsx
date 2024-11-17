import React, { useEffect, useState } from "react";
import {
  Typography,
  Table,
  TableCell,
  TableContainer,
  Box,
  Button,
  useMediaQuery,
  Divider
} from "@mui/material";
import api from "api/axios";
import { useAuth } from "context/AuthContext";
import type { Tournament, User } from "types/models";
import { useNavigate } from "react-router-dom";

const UpcomingTournament: React.FC = () => {
  const { userId } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const navigate = useNavigate();
  const mobile = useMediaQuery("(max-width:600px)");
  const [showMatches, setShowMatches] = useState(false);

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

  const getPlayerNameById = (players: User[], playerId: string): string => {
    if (playerId === userId) {
      return "You";
    }
    const player = players.find((player) => player.id === playerId);
    if (player != null) {
      return `${player.firstName} ${player.lastName}`;
    } else {
      return "Unknown Player";
    }
  };

  return (
    <>
      {mobile ? (
        <>
          <Typography sx={{ mt: 2, fontSize: 25 }}>
            My upcoming tournaments
          </Typography>
          {tournaments.map((tournament) => {
            return (
              <Box
                key={tournament.id}
                sx={{
                  mt: 1,
                  fontSize: 15,
                  border: "1px solid black",
                  padding: 2,
                  borderRadius: "5px"
                }}
              >
                <Typography sx={{ fontSize: 25, fontWeight: "bold" }}>
                  {tournament.name}
                </Typography>
                <Typography>
                  {tournament.category.charAt(0).toUpperCase() +
                    tournament.category.slice(1)}
                </Typography>
                <Typography>
                  {new Date(tournament.startDate).toLocaleDateString("fi-FI")} -{" "}
                  {new Date(tournament.endDate).toLocaleDateString("fi-FI")}
                </Typography>
                <Typography>
                  {tournament.location}
                  <Button
                    variant="outlined"
                    color="primary"
                    sx={{
                      margin: 2,
                      minHeight: 35,
                      fontSize: 10,
                      minWidth: 70,
                      borderRadius: 10
                    }}
                    onClick={() => {
                      navigate(`/tournaments/${tournament.id}`);
                    }}
                  >
                    Details
                  </Button>
                </Typography>
                <Divider></Divider>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    margin: 2,
                    minHeight: 35,
                    fontSize: 10,
                    minWidth: 250,
                    borderRadius: 10,
                    display: "block",
                    marginLeft: "auto",
                    marginRight: "auto"
                  }}
                  onClick={() => {
                    setShowMatches(!showMatches);
                  }}
                >
                  Known matches
                </Button>
                {showMatches && (
                  <>
                    {tournament.matchSchedule
                      .filter((match) =>
                        match.players.some((player) => player.id === userId)
                      )
                      .map((match) => {
                        // Ensure the name of the current user always comes first
                        const sortedPlayers = [...match.players].sort((a, b) =>
                          a.id === userId ? -1 : b.id === userId ? 1 : 0
                        );

                        return (
                          <Box
                            key={match.id}
                            sx={{
                              mt: 2,
                              border: "1px solid black",
                              padding: 2,
                              maxWidth: 200,
                              marginLeft: "auto",
                              marginRight: "auto",
                              display: "flex",
                              justifyContent: "center"
                            }}
                          >
                            <Box sx={{ alignItems: "center" }}>
                              <Typography>
                                {getPlayerNameById(
                                  tournament.players,
                                  sortedPlayers[0].id
                                )}{" "}
                                -{" "}
                                {getPlayerNameById(
                                  tournament.players,
                                  sortedPlayers[1].id
                                )}
                              </Typography>
                            </Box>
                          </Box>
                        );
                      })}
                  </>
                )}
              </Box>
            );
          })}
        </>
      ) : (
        <>
          <Typography sx={{ mt: 2, fontSize: 35 }}>
            My upcoming tournaments
          </Typography>
          {tournaments.map((tournament) => {
            return (
              <Box key={tournament.id}>
                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}
                >
                  <TableContainer>
                    <Table
                      sx={{
                        minWidth: 500,
                        fontSize: 20,
                        "& .MuiTableCell-root": {
                          borderLeft: "2px solid transparent",
                          borderRight: "2px solid transparent",
                          borderTop: "2px solid transparent",
                          borderBottom: "2px solid black"
                        }
                      }}
                      aria-label="simple table"
                    >
                      <TableCell sx={{ fontSize: 20, fontWeight: "bold" }}>
                        {tournament.name}
                      </TableCell>
                      <TableCell>
                        {tournament.category.charAt(0).toUpperCase() +
                          tournament.category.slice(1)}
                      </TableCell>
                      <TableCell>
                        {new Date(tournament.startDate).toLocaleDateString(
                          "fi-FI"
                        )}{" "}
                        -{" "}
                        {new Date(tournament.endDate).toLocaleDateString(
                          "fi-FI"
                        )}
                      </TableCell>
                      <TableCell>{tournament.location}</TableCell>
                    </Table>
                  </TableContainer>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{
                      margin: 2,
                      minHeight: 45,
                      fontSize: 10,
                      minWidth: 150,
                      borderRadius: 10
                    }}
                    onClick={() => {
                      navigate(`/tournaments/${tournament.id}`);
                    }}
                  >
                    Tournament details
                  </Button>
                </Box>
                <Typography sx={{ mt: 2 }}>Known matches</Typography>
                {tournament.matchSchedule
                  .filter((match) =>
                    match.players.some((player) => player.id === userId)
                  )
                  .map((match) => {
                    // Ensure the name of the current user always comes first
                    const sortedPlayers = [...match.players].sort((a, b) =>
                      a.id === userId ? -1 : b.id === userId ? 1 : 0
                    );

                    return (
                      <Box
                        key={match.id}
                        sx={{
                          mt: 2,
                          border: "1px solid black",
                          padding: 2,
                          maxWidth: 250
                        }}
                      >
                        <Box sx={{ alignItems: "center" }}>
                          <Typography>
                            {getPlayerNameById(
                              tournament.players,
                              sortedPlayers[0].id
                            )}{" "}
                            -{" "}
                            {getPlayerNameById(
                              tournament.players,
                              sortedPlayers[1].id
                            )}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
              </Box>
            );
          })}
        </>
      )}
    </>
  );
};

export default UpcomingTournament;
