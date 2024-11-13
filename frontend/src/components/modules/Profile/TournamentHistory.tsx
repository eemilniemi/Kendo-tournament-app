import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import api from "api/axios";
import type { Tournament, Match } from "types/models";
import { useTranslation } from "react-i18next";
import FilterTournaments from "../Tournaments/FilterTournaments";
import ProfilePoints from "./ProfilePoints";
import TournamentHistoryMatches from "./TournamentHistoryMatches";

type Order = "asc" | "desc";

interface TournamentStats {
  matches: number;
  wins: number;
  losses: number;
  ties: number;
  points: number;
  placement: number;
}

interface TournamentWithStats extends Tournament {
  stats: TournamentStats;
}

interface SummaryStats {
  totalTournaments: number;
  totalMatches: number;
  totalWins: number;
  totalLosses: number;
  totalTies: number;
  totalPoints: number;
}

const TournamentHistory: React.FC = () => {
  const [tournaments, setTournaments] = useState<TournamentWithStats[]>([]);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [filteredTournaments, setFilteredTournaments] = useState<
    TournamentWithStats[]
  >([]);
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<string>("name");
  const navigate = useNavigate();
  const { userId } = useAuth();
  const { t } = useTranslation();
  const queryParams = new URLSearchParams(location.search);
  const selectedTournamentId = queryParams.get("tournament");

  const handleFilteredTournaments = (
    filtTournaments: Tournament[],
    areFiltersApplied: boolean
  ): void => {
    setFiltersApplied(areFiltersApplied);

    const updatedFiltered = filtTournaments.map((tournament) => {
      const original = tournaments.find((t) => t.id === tournament.id);
      return original !== null
        ? original
        : {
            ...tournament,
            stats: {
              matches: 0,
              wins: 0,
              losses: 0,
              ties: 0,
              points: 0,
              placement: 0
            } satisfies TournamentStats
          };
    });

    setFilteredTournaments(updatedFiltered as TournamentWithStats[]);
  };

  useEffect(() => {
    const fetchTournaments = async (): Promise<void> => {
      try {
        const tournamentsData = await api.tournaments.getAll();
        const userTournaments = tournamentsData.filter((tournament) =>
          tournament.players.some((player) => player.id === userId)
        );

        const tournamentsWithStats = userTournaments.map((tournament) => ({
          ...tournament,
          stats: calculateStatsForTournament(tournament)
        }));

        setTournaments(tournamentsWithStats);
      } catch (error) {
        console.error("Error fetching tournaments:", error);
      }
    };

    void fetchTournaments();
  }, [userId]);

  const getPlayerMatches = (tournament: Tournament, userId: string): Match[] =>
    tournament.matchSchedule.filter((match) =>
      match.players.some((player) => player.id === userId)
    );

  const calculateStatsForTournament = (
    tournament: Tournament
  ): TournamentStats => {
    if (userId === null || userId === undefined) {
      return {
        matches: 0,
        wins: 0,
        losses: 0,
        ties: 0,
        points: 0,
        placement: 0
      };
    }

    const playerMatches = getPlayerMatches(tournament, userId);
    let wins = 0;
    let losses = 0;
    let ties = 0;
    let points = 0;

    playerMatches.forEach((match) => {
      const player = match.players.find((p) => p.id === userId);
      const opponent = match.players.find((p) => p.id !== userId);

      if (player !== null && opponent !== null) {
        if (match.player1Score === match.player2Score) {
          ties += 1;
        } else if (
          (match.player1Score > match.player2Score &&
            player?.id === match.players[0].id) ||
          (match.player2Score > match.player1Score &&
            player?.id === match.players[1].id)
        ) {
          wins += 1;
          points += 3;
        } else {
          losses += 1;
        }
      }
    });

    const placement = calculatePlayerPlacement(tournament, {
      playerId: userId,
      stats: {
        matches: playerMatches.length,
        wins,
        losses,
        ties,
        points,
        placement: 0
      }
    });

    return {
      matches: playerMatches.length,
      wins,
      losses,
      ties,
      points,
      placement
    };
  };

  const calculatePlayerPlacement = (
    tournament: Tournament,
    userStats: { playerId: string; stats: TournamentStats }
  ): number => {
    const playersStats = tournament.players.map((player) => ({
      playerId: player.id,
      stats:
        player.id === userStats.playerId
          ? userStats.stats
          : {
              matches: 0,
              wins: 0,
              losses: 0,
              ties: 0,
              points: 0,
              placement: 0
            }
    }));

    playersStats.sort((a, b) => {
      if (b.stats.points !== a.stats.points)
        return b.stats.points - a.stats.points;
      return b.stats.wins - a.stats.wins;
    });

    return playersStats.findIndex((p) => p.playerId === userStats.playerId) + 1;
  };

  const getTournamentsToRender = (): TournamentWithStats[] =>
    filtersApplied ? filteredTournaments : tournaments;

  const handleRequestSort = (property: string): void => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedTournaments = getTournamentsToRender()
    .slice()
    .sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (orderBy) {
        case "name":
          aValue = a.name;
          bValue = b.name;
          break;
        case "startDate":
          aValue = new Date(a.startDate);
          bValue = new Date(b.startDate);
          break;
        default:
          aValue = a.stats[orderBy as keyof TournamentStats];
          bValue = b.stats[orderBy as keyof TournamentStats];
      }

      if (aValue === bValue) return 0;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return order === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        return order === "asc" ? aValue - bValue : bValue - aValue;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        return order === "asc"
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      return 0;
    });

  const summaryStats: SummaryStats = sortedTournaments.reduce(
    (summary, tournament) => {
      const stats = tournament.stats;
      summary.totalTournaments += 1;
      summary.totalMatches += stats.matches;
      summary.totalWins += stats.wins;
      summary.totalLosses += stats.losses;
      summary.totalTies += stats.ties;
      summary.totalPoints += stats.points;
      return summary;
    },
    {
      totalTournaments: 0,
      totalMatches: 0,
      totalWins: 0,
      totalLosses: 0,
      totalTies: 0,
      totalPoints: 0
    }
  );

  return (
    <Box>
      {selectedTournamentId !== null ? (
        <TournamentHistoryMatches tournamentId={selectedTournamentId} />
      ) : (
        <>
          <FilterTournaments
            parentComponent="ProfileGames"
            tournaments={tournaments.map(({ stats, ...rest }) => rest)} // Pass tournaments without stats
            handleFilteredTournaments={handleFilteredTournaments}
          />
          <Typography variant="h6" gutterBottom>
            {t("profile.tournaments")}
          </Typography>
          {sortedTournaments.length === 0 ? (
            <Typography variant="h6" marginTop="32px" textAlign="center">
              {t("frontpage_labels.no_tournaments_found")}
            </Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead
                  style={{
                    fontWeight: "bold",
                    color: "#fff",
                    backgroundColor: "#DB4744"
                  }}
                >
                  <TableRow sx={{ borderBottom: "2px solid black" }}>
                    {[
                      t("profile.name"),
                      t("profile.startDate"),
                      t("profile.placement"),
                      t("profile.matches"),
                      t("profile.wins"),
                      t("profile.losses"),
                      t("profile.draws"),
                      t("profile.points")
                    ].map((column) => (
                      <TableCell
                        key={column}
                        sx={{
                          fontWeight: "bold",
                          borderBottom: "2px solid black",
                          color: "#fff"
                        }}
                      >
                        <TableSortLabel
                          active={orderBy === column}
                          direction={orderBy === column ? order : "asc"}
                          onClick={() => {
                            handleRequestSort(column);
                          }}
                        >
                          {t(column.charAt(0).toUpperCase() + column.slice(1))}
                        </TableSortLabel>
                      </TableCell>
                    ))}
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        color: "#fff",
                        borderBottom: "2px solid black"
                      }}
                    >
                      {""}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedTournaments.map((tournament) => (
                    <TableRow key={tournament.id}>
                      <TableCell>{tournament.name}</TableCell>
                      <TableCell>
                        {new Date(tournament.startDate).toLocaleDateString(
                          "en-gb",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric"
                          }
                        )}
                      </TableCell>
                      <TableCell>
                        {tournament.stats.placement > 0 &&
                        tournament.stats.matches > 0
                          ? tournament.stats.placement
                          : "-"}
                      </TableCell>
                      <TableCell>{tournament.stats.matches}</TableCell>
                      <TableCell>{tournament.stats.wins}</TableCell>
                      <TableCell>{tournament.stats.losses}</TableCell>
                      <TableCell>{tournament.stats.ties}</TableCell>
                      <TableCell>{tournament.stats.points}</TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          sx={{ marginBottom: "10px", width: "100%" }}
                          onClick={() => {
                            navigate(
                              `/profile?tab=history&tournament=${tournament.id}`
                            );
                          }}
                        >
                          {t("profile.matches")}
                        </Button>
                        <Button
                          sx={{ width: "100%" }}
                          variant="outlined"
                          onClick={() => {
                            navigate(`/tournaments/${tournament.id}`);
                          }}
                        >
                          {t("profile.more_info")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ borderTop: "2px solid black" }}>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      {t("profile.total")}
                    </TableCell>
                    <TableCell colSpan={2} sx={{ fontWeight: "bold" }}>
                      {summaryStats.totalTournaments} {t("profile.tournaments")}
                    </TableCell>
                    <TableCell>
                      {summaryStats.totalMatches} {t("profile.matches")}
                    </TableCell>
                    <TableCell>
                      {summaryStats.totalWins} {t("profile.wins")}
                    </TableCell>
                    <TableCell>
                      {summaryStats.totalLosses} {t("profile.losses")}
                    </TableCell>
                    <TableCell>
                      {summaryStats.totalTies} {t("profile.draws")}
                    </TableCell>
                    <TableCell>
                      {summaryStats.totalPoints} {t("profile.points")}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
          <ProfilePoints />
        </>
      )}
    </Box>
  );
};

export default TournamentHistory;
