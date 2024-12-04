// TeamRoundRobinTournamentView.tsx
import React, { useState, useEffect } from "react";
import {
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Select,
  MenuItem,
  Button,
  Box,
  Divider,
  IconButton
} from "@mui/material";
import { type Match, type Tournament, type User } from "types/models";
import { useSearchParams } from "react-router-dom";
import { useTournament } from "context/TournamentContext";
import { useTranslation } from "react-i18next";
import { useAuth } from "context/AuthContext";
import DeleteUserFromTournament from "../DeleteUserFromTournament";
import CopyToClipboardButton from "../CopyToClipboardButton";
import { useSocket } from "context/SocketContext";
import { joinTournament, leaveTournament } from "sockets/emit";
import { checkSameNames } from "../../PlayerNames";
import api from "api/axios";
import useToast from "hooks/useToast";
import useMediaQuery from "@mui/material/useMediaQuery";
import MatchButton from "../../MatchButton";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import { format } from "date-fns";
import TournamentWinner from "../../Winner";
import TeamRoundRobinUpcomingView from "./TeamRoundRobinUpcomingView";

export interface TournamentTeam {
  id: string;
  name: string;
  points: number;
  wins: number;
  losses: number;
  ties: number;
  players: User[];
}

interface Rounds extends Record<number, Match[]> {}

export interface TournamentPlayer {
  id: string;
  firstName: string;
  lastName: string;
  points: number;
  ippons: number;
  wins: number;
  losses: number;
  ties: number;
}

interface TeamScoreboardProps {
  teams: TournamentTeam[];
  onClick?: () => void;
}

interface MatchUpOverviewProps {
  teams: TournamentTeam[];
}

export const TeamScoreboard: React.FC<TeamScoreboardProps> = ({
  teams,
  onClick
}) => {
  const { t } = useTranslation();

  const generateTableCells = (team: TournamentTeam): React.ReactNode[] => {
    return [
      <TableCell
        key="points"
        sx={{
          borderRight: "1px solid #ddd",
          borderBottom: "1px solid #ddd"
        }}
      >
        <Typography>{team.points}</Typography>
      </TableCell>,
      <TableCell
        key="wins"
        sx={{
          borderRight: "1px solid #ddd",
          borderBottom: "1px solid #ddd"
        }}
      >
        <Typography>{team.wins}</Typography>
      </TableCell>,
      <TableCell
        key="losses"
        sx={{
          borderRight: "1px solid #ddd",
          borderBottom: "1px solid #ddd"
        }}
      >
        <Typography>{team.losses}</Typography>
      </TableCell>,
      <TableCell
        key="ties"
        sx={{
          borderRight: "1px solid #ddd",
          borderBottom: "1px solid #ddd"
        }}
      >
        <Typography>{team.ties}</Typography>
      </TableCell>
    ];
  };

  const generateTable = (): React.ReactNode => {
    const sortedTeams = [...teams].sort((a, b) => b.points - a.points);

    const tableHeaders = [
      t("tournament_view_labels.team_name"),
      t("tournament_view_labels.points"),
      t("tournament_view_labels.wins"),
      t("tournament_view_labels.losses"),
      t("tournament_view_labels.ties")
    ];

    return (
      <div>
        <TableContainer component={Paper}>
          <Table onClick={onClick}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#D01C1C" }}>
                {tableHeaders.map((header, index) => (
                  <TableCell
                    key={index}
                    sx={{
                      color: "white",
                      fontWeight: "bold"
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedTeams.map((team) => (
                <TableRow key={team.id}>
                  <TableCell
                    sx={{
                      borderRight: "1px solid #ddd", // Add vertical border
                      borderBottom: "1px solid #ddd" // Add bottom border
                    }}
                  >
                    <Typography>{team.name}</Typography>
                  </TableCell>
                  {generateTableCells(team)}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    );
  };

  return <div>{generateTable()}</div>;
};

export const Matches: React.FC<{
  ongoingMatchElements: React.ReactNode[];
  upcomingMatchElements: React.ReactNode[];
  pastMatchElements: React.ReactNode[];
  tournamentData: Tournament;
}> = ({
  ongoingMatchElements,
  upcomingMatchElements,
  pastMatchElements,
  tournamentData
}) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width:600px)");

  // Toggle states for each match section
  const [showOngoing, setShowOngoing] = useState(true);
  const [showUpcoming, setShowUpcoming] = useState(true);
  const [showPast, setShowPast] = useState(true);
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get("tab");

  useEffect(() => {
    if (!isMobile) {
      setShowOngoing(true);
      setShowUpcoming(true);
      setShowPast(true);
    }
  }, [isMobile]);

  // Group matches by round
  const rounds: Rounds = tournamentData.matchSchedule.reduce<Rounds>(
    (acc, match) => {
      const round = match.tournamentRound ?? 0;
      if (acc[round] === undefined) {
        acc[round] = [];
      }
      acc[round].push(match);
      return acc;
    },
    {}
  );

  const [expandedRounds, setExpandedRounds] = useState<Record<number, boolean>>(
    () => {
      const initialExpandedRounds: Record<number, boolean> = {};
      Object.keys(rounds).forEach((roundNumber) => {
        initialExpandedRounds[parseInt(roundNumber, 10)] = true;
      });
      return initialExpandedRounds;
    }
  );

  const toggleRound = (roundNumber: number): void => {
    setExpandedRounds((prev) => ({
      ...prev,
      [roundNumber]: !prev[roundNumber]
    }));
  };

  const getRoundName = (roundNumber: number): string => {
    return `${t("tournament_view_labels.round")} ${roundNumber}`;
  };

  const renderSection = (
    title: string,
    show: boolean,
    setShow: React.Dispatch<React.SetStateAction<boolean>>,
    elements: React.ReactNode[]
  ): JSX.Element => (
    <Box
      display="flex"
      flexDirection="column"
      gap="10px"
      marginBottom={"15px"}
      component="div"
    >
      <Box
        display="flex"
        gap="10px"
        alignItems="center"
        justifyContent="space-between"
        padding={isMobile ? "5px 10px" : "0"}
        borderRadius={isMobile ? "8px" : "0"}
        sx={{ backgroundColor: isMobile ? "#FFE1E1" : "transparent" }}
        component="div"
      >
        <Typography
          variant="h6"
          sx={{
            fontSize: "13px",
            fontWeight: "bold",
            justifyContent: isMobile ? "center" : "flex-start"
          }}
        >
          {title}
        </Typography>
        {isMobile && (
          <Button
            onClick={() => {
              setShow(!show);
            }}
            variant="text"
            sx={{ fontSize: "20px", color: "black" }}
          >
            {show ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />}
          </Button>
        )}
      </Box>
      {show && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            padding: "20px 0",
            gap: "10px 25px"
          }}
        >
          {elements.length === 0 ? (
            <Typography variant="body2" color="textSecondary" fontSize={"13px"}>
              {t("tournament_view_labels.no_matches")}
            </Typography>
          ) : (
            Object.entries(rounds).map(([roundNumber, matches], index) => (
              <React.Fragment key={roundNumber}>
                {index > 0 && <Divider orientation="horizontal" flexItem />}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: "20px",
                    borderRadius: 2,
                    width: "99%",
                    outline: "1px lightgray solid",
                    margin: "10px auto"
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      zIndex: 1,
                      cursor: "pointer"
                    }}
                    onClick={() => {
                      toggleRound(parseInt(roundNumber, 10));
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        marginBottom: 0,
                        marginLeft: "10px",
                        textDecoration: "underline",
                        fontSize: "17px",
                        fontWeight: "bold"
                      }}
                    >
                      {getRoundName(parseInt(roundNumber, 10))}
                    </Typography>
                    <IconButton>
                      {expandedRounds[parseInt(roundNumber, 10)] ? (
                        <ArrowDropUpIcon />
                      ) : (
                        <ArrowDropDownIcon />
                      )}
                    </IconButton>
                  </Box>
                  {expandedRounds[parseInt(roundNumber, 10)] && (
                    <>
                      <Divider sx={{ margin: "15px 0" }} />
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          justifyContent: "flex-start",
                          gap: "40px",
                          margin: "10px"
                        }}
                      >
                        {elements}
                      </Box>
                    </>
                  )}
                </Box>
              </React.Fragment>
            ))
          )}
        </Box>
      )}
    </Box>
  );

  return (
    <Box padding="20px 0" component="div">
      {/* Ongoing and Upcoming Matches */}
      {currentTab !== "completedMatches" &&
        renderSection(
          t("tournament_view_labels.ongoing_matches"),
          showOngoing,
          setShowOngoing,
          ongoingMatchElements
        )}

      {currentTab !== "completedMatches" &&
        renderSection(
          t("tournament_view_labels.upcoming_matches"),
          showUpcoming,
          setShowUpcoming,
          upcomingMatchElements
        )}

      {/* Past Matches */}
      {currentTab === "completedMatches" &&
        renderSection(
          t("tournament_view_labels.past_matches"),
          showPast,
          setShowPast,
          pastMatchElements
        )}
    </Box>
  );
};

export const MatchUpOverview: React.FC<MatchUpOverviewProps> = ({ teams }) => {
  const { t } = useTranslation();

  // Group matches by round
  const groupMatchesByRound = (matches: Match[]): Record<number, Match[]> => {
    return matches.reduce<Record<number, Match[]>>((acc, match) => {
      const round = match.tournamentRound ?? 0;
      if (acc[round] === undefined) {
        acc[round] = [];
      }
      acc[round].push(match);
      return acc;
    }, {});
  };

  // Helper function to get team name by player ID
  const getTeamNameForPlayer = (
    playerId: string,
    teams: TournamentTeam[]
  ): string | undefined => {
    const team = teams.find((team) =>
      team.players.some((player) => player.id === playerId)
    );
    return team?.name;
  };

  const tournament = useTournament();
  const rounds = groupMatchesByRound(tournament.matchSchedule ?? []);

  // Prepare the table data
  const roundKeys = Object.keys(rounds)
    .map((key) => parseInt(key, 10))
    .sort((a, b) => a - b); // Sort numerically

  const maxMatchupsInRound = Math.max(
    ...roundKeys.map((round) => rounds[round].length)
  );

  return (
    <Box>
      {/* Participating Teams Table */}
      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        {t("tournament_view_labels.participating_teams")}
      </Typography>
      <TableContainer component={Paper} sx={{ marginBottom: 4 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#D01C1C" }}>
              <TableCell
                sx={{
                  color: "white",
                  fontWeight: "bold"
                }}
              >
                {t("tournament_view_labels.team_name")}
              </TableCell>
              {Array.from(
                {
                  length: Math.max(...teams.map((team) => team.players.length))
                },
                (_, index) => (
                  <TableCell
                    key={`member-${index}`}
                    sx={{
                      color: "white",
                      fontWeight: "bold"
                    }}
                  >
                    {t("tournament_view_labels.member")} {index + 1}
                  </TableCell>
                )
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {teams.map((team) => (
              <TableRow key={team.id}>
                <TableCell
                  sx={{
                    borderRight: "1px solid #ddd",
                    borderBottom: "1px solid #ddd"
                  }}
                >
                  {team.name}
                </TableCell>
                {team.players.map((player) => (
                  <TableCell
                    key={player.id}
                    sx={{
                      borderRight: "1px solid #ddd",
                      borderBottom: "1px solid #ddd"
                    }}
                  >
                    {player.firstName} {player.lastName}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Matchup Overview Table */}
      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        {t("tournament_view_labels.matchups_overview")}
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#D01C1C" }}>
              {roundKeys.map((round) => (
                <TableCell
                  key={round}
                  sx={{
                    fontWeight: "bold",
                    textAlign: "center",
                    color: "white"
                  }}
                >
                  {t("tournament_view_labels.round")} {round}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: maxMatchupsInRound }).map(
              (_, matchupIndex) => (
                <TableRow key={matchupIndex}>
                  {roundKeys.map((round) => {
                    const match = rounds[round][matchupIndex];
                    if (match === undefined || match === null) {
                      return <TableCell key={round}></TableCell>; // Empty cell for missing matchups
                    }

                    const teamAName = getTeamNameForPlayer(
                      match.players[0]?.id,
                      teams
                    );
                    const teamBName = getTeamNameForPlayer(
                      match.players[1]?.id,
                      teams
                    );

                    return (
                      <TableCell key={round} sx={{ textAlign: "center" }}>
                        {teamAName} vs {teamBName}
                      </TableCell>
                    );
                  })}
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export const sortMatches = (
  matches: Match[]
): {
  ongoingMatches: Match[];
  upcomingMatches: Match[];
  pastMatches: Match[];
} => {
  const ongoingMatches = matches.filter(
    (match) => match.elapsedTime > 0 && match.endTimestamp === undefined
  );

  // Filter and sort upcoming matches by scheduled time, placing undefined times at the end
  const upcomingMatches = matches
    .filter(
      (match) =>
        match.elapsedTime <= 0 &&
        match.endTimestamp === undefined &&
        match.winnerTeamId === undefined
    )
    .sort((a, b) => {
      const timeA = a.scheduledTime;
      const timeB = b.scheduledTime;

      // If `scheduledTime` is undefined, place it at the end
      if (timeA === null) return 1;
      if (timeB === null) return -1;

      // Convert `scheduledTime` to Date for comparison
      const dateA = new Date(`1970-01-01T${timeA}`);
      const dateB = new Date(`1970-01-01T${timeB}`);

      return dateA.getTime() - dateB.getTime();
    });

  const pastMatches = matches.filter(
    (match) =>
      (match.elapsedTime > 0 && match.endTimestamp !== undefined) ||
      (match.endTimestamp !== undefined && match.winnerTeamId !== undefined) ||
      (match.elapsedTime === 0 && match.winnerTeamId !== undefined)
  );

  return { ongoingMatches, upcomingMatches, pastMatches };
};

const TeamRoundRobinTournamentView: React.FC = () => {
  const initialTournamentData = useTournament();
  const { t } = useTranslation();
  const tournament = useTournament();
  const mobile = useMediaQuery("(max-width:600px)");

  const [hasJoined, setHasJoined] = useState(false);
  const [teams, setTeams] = useState<TournamentTeam[]>([]);
  const [players, setPlayers] = useState<TournamentPlayer[]>([]);
  const [ongoingMatches, setOngoingMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [pastMatches, setPastMatches] = useState<Match[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [haveSameNames, setHaveSameNames] = useState<boolean>(false);
  const [showOnlyUserMatches, setShowOnlyUserMatches] = useState(false);
  const tabTypes = [
    "tournamentInfo",
    "overview",
    "scoreboard",
    "ongoingUpcomingMatches",
    "completedMatches"
  ] as const;
  const defaultTab = "scoreboard";
  const currentTab = searchParams.get("tab") ?? defaultTab;
  const { userId } = useAuth();
  const isUserTheCreator = tournament.creator.id === userId;
  const showToast = useToast();

  // Filter matches based on `showOnlyUserMatches` and `userId`
  const filteredOngoingMatches = showOnlyUserMatches
    ? ongoingMatches.filter((match) =>
        match.players.some((player) => player.id === userId)
      )
    : ongoingMatches;

  const filteredUpcomingMatches = showOnlyUserMatches
    ? upcomingMatches.filter((match) =>
        match.players.some((player) => player.id === userId)
      )
    : upcomingMatches;

  const filteredPastMatches = showOnlyUserMatches
    ? pastMatches.filter((match) =>
        match.players.some((player) => player.id === userId)
      )
    : pastMatches;

  useEffect(() => {
    const result = checkSameNames(tournament);
    setHaveSameNames(result);
  }, [tournament]);

  const { tournamentData: socketData } = useSocket();

  const [tournamentData, setTournamentData] = useState<Tournament>(
    initialTournamentData
  );

  // Listening to tournaments websocket
  useEffect(() => {
    if (
      initialTournamentData.id !== undefined &&
      initialTournamentData.id !== "" &&
      !hasJoined
    ) {
      joinTournament(initialTournamentData.id);
      setHasJoined(true);
    }

    return () => {
      if (hasJoined) {
        leaveTournament(initialTournamentData.id);
        setHasJoined(false);
      }
    };
  }, [initialTournamentData.id, hasJoined]);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        if (socketData !== undefined) {
          setTournamentData(socketData);
        } else {
          const data: Tournament = await api.tournaments.getTournament(
            initialTournamentData.id
          );
          setTournamentData(data);
        }
      } catch (error) {
        showToast(error, "error");
      }
    };

    if (socketData !== undefined || initialTournamentData.id !== undefined) {
      void fetchData();
    }
  }, [socketData, initialTournamentData.id]);

  useEffect(() => {
    if (currentTab === null || !tabTypes.includes(currentTab as any)) {
      setSearchParams((params) => {
        params.set("tab", defaultTab);
        return params;
      });
    }
  }, [currentTab, setSearchParams, tabTypes]);

  const handleTabChange = (tab: string): void => {
    setSearchParams((params) => {
      params.set("tab", tab);
      return params;
    });
  };

  const handleFilterToggle = (): void => {
    setShowOnlyUserMatches((prev) => !prev);
  };

  // Function to merge new players into the existing players state
  const mergePlayers = (newPlayers: User[]): void => {
    setPlayers((prevPlayers) => {
      const playerMap = new Map(prevPlayers.map((p) => [p.id, p]));
      newPlayers.forEach((player) => {
        if (!playerMap.has(player.id)) {
          playerMap.set(player.id, {
            id: player.id,
            firstName: player.firstName,
            lastName: player.lastName,
            points: 0,
            ippons: 0,
            wins: 0,
            losses: 0,
            ties: 0
          });
        }
      });
      return Array.from(playerMap.values());
    });
  };

  // Initialize players from initial data
  useEffect(() => {
    if (
      initialTournamentData.teams !== undefined &&
      initialTournamentData.teams !== null
    ) {
      const initialPlayers: TournamentPlayer[] = [];
      initialTournamentData.teams.forEach((team) => {
        team.players.forEach((player) => {
          if (!initialPlayers.some((p) => p.id === player.id)) {
            initialPlayers.push({
              id: player.id,
              firstName: player.firstName,
              lastName: player.lastName,
              points: 0,
              ippons: 0,
              wins: 0,
              losses: 0,
              ties: 0
            });
          }
        });
      });
      setPlayers(initialPlayers);
    }
  }, [initialTournamentData.teams]);

  // Update players when tournamentData updates with new players
  useEffect(() => {
    if (tournamentData.teams !== undefined && tournamentData.teams !== null) {
      const updatedPlayers: User[] = [];
      tournamentData.teams.forEach((team) => {
        team.players.forEach((player) => {
          updatedPlayers.push(player);
        });
      });
      mergePlayers(updatedPlayers);
    }
  }, [tournamentData.teams]);

  // Helper function to get team ID for a player
  const getTeamIdForPlayer = (
    playerId: string,
    teams: TournamentTeam[]
  ): string | undefined => {
    const team = teams.find((team) =>
      team.players.some((player) => player.id === playerId)
    );
    return team?.id;
  };

  // Function to calculate team stats
  const calculateTeamStats = (
    teams: TournamentTeam[],
    matches: Match[]
  ): TournamentTeam[] => {
    // Reset stats
    const updatedTeams = teams.map((team) => ({
      ...team,
      points: 0,
      wins: 0,
      losses: 0,
      ties: 0
    }));

    // Calculate stats based on matches
    for (const match of matches) {
      if (match.type === "playoff" || match.endTimestamp === undefined) {
        continue;
      }

      const [player1Id, player2Id] = match.players.map((p) => p.id);
      const team1Id = getTeamIdForPlayer(player1Id, updatedTeams);
      const team2Id = getTeamIdForPlayer(player2Id, updatedTeams);

      if (
        team1Id === null ||
        team1Id === undefined ||
        team1Id === "" ||
        team2Id === null ||
        team2Id === undefined ||
        team2Id === ""
      )
        continue;

      const team1Index = updatedTeams.findIndex((team) => team.id === team1Id);
      const team2Index = updatedTeams.findIndex((team) => team.id === team2Id);

      if (team1Index === -1 || team2Index === -1) continue;

      if (match.winnerTeamId !== undefined) {
        const winnerIndex = updatedTeams.findIndex(
          (team) => team.id === match.winnerTeamId
        );

        if (winnerIndex === -1) continue;

        const loserIndex = winnerIndex === team1Index ? team2Index : team1Index;

        updatedTeams[winnerIndex].wins += 1;
        updatedTeams[winnerIndex].points += 3;
        updatedTeams[loserIndex].losses += 1;
      }

      if (
        match.winnerTeamId === undefined &&
        (match.endTimestamp !== undefined ||
          match.elapsedTime >= match.matchTime)
      ) {
        updatedTeams[team1Index].ties += 1;
        updatedTeams[team1Index].points += 1;
        updatedTeams[team2Index].ties += 1;
        updatedTeams[team2Index].points += 1;
      }
    }

    return updatedTeams;
  };

  // Unified useEffect for adding teams and calculating stats
  useEffect(() => {
    setTeams((prevTeams) => {
      const updatedTeams = [...prevTeams];
      const teamsFromData = tournamentData.teams ?? [];

      teamsFromData.forEach((teamFromData) => {
        const exists = updatedTeams.some((team) => team.id === teamFromData.id);
        if (!exists) {
          updatedTeams.push({
            id: teamFromData.id,
            name: teamFromData.name,
            points: 0,
            wins: 0,
            losses: 0,
            ties: 0,
            players: teamFromData.players
          });
        }
      });

      return updatedTeams;
    });

    // Sort matches and calculate stats
    const sortedMatches = sortMatches(tournamentData.matchSchedule);
    setOngoingMatches(sortedMatches.ongoingMatches);
    setUpcomingMatches(sortedMatches.upcomingMatches);
    setPastMatches(sortedMatches.pastMatches);

    setTeams((prevTeams) =>
      calculateTeamStats(prevTeams, tournamentData.matchSchedule)
    );
  }, [tournamentData]);

  const ongoingElements = filteredOngoingMatches.map((match) => (
    <MatchButton
      key={match.id}
      match={match}
      players={players}
      haveSameNames={haveSameNames}
      isUserTheCreator={isUserTheCreator}
      tournamentData={tournamentData}
    />
  ));

  const upcomingElements = filteredUpcomingMatches.map((match) => (
    <MatchButton
      key={match.id}
      match={match}
      players={players}
      haveSameNames={haveSameNames}
      isUserTheCreator={isUserTheCreator}
      tournamentData={tournamentData}
    />
  ));

  const pastElements = filteredPastMatches.map((match) => (
    <MatchButton
      key={match.id}
      match={match}
      players={players}
      haveSameNames={haveSameNames}
      isUserTheCreator={isUserTheCreator}
      tournamentData={tournamentData}
    />
  ));

  const formattedStartDate =
    tournamentData.startDate !== null
      ? format(new Date(tournamentData.startDate), "MMM dd, yyyy")
      : "";
  const formattedEndDate =
    tournamentData.endDate !== null
      ? format(new Date(tournamentData.endDate), "MMM dd, yyyy")
      : "";

  return (
    <>
      <Typography
        variant="body1"
        fontSize="10px"
        sx={{ display: "flex", gap: "5px", alignItems: "center" }}
      >
        {formattedStartDate}
        {formattedEndDate !== null && ` - ${formattedEndDate}`}
      </Typography>
      <Typography
        variant="body1"
        fontSize="10px"
        sx={{ display: "flex", gap: "5px", alignItems: "center" }}
      >
        {tournamentData.location !== null && `${tournamentData.location}`}
      </Typography>{" "}
      <Typography variant="h4">{tournamentData.name}</Typography>
      {/* Display Teams */}
      <Typography variant="h6" sx={{ marginTop: "10px" }}>
        {t("tournament_view_labels.team_name")}
      </Typography>
      <Box sx={{ marginBottom: "20px" }}>
        {teams.map((team) => (
          <Box key={team.id} sx={{ marginBottom: "10px" }}>
            <Typography variant="subtitle1">{team.name}</Typography>
            <Typography variant="body2">
              {team.players
                .map((player) => `${player.firstName} ${player.lastName}`)
                .join(", ")}
            </Typography>
          </Box>
        ))}
      </Box>
      <TournamentWinner tournament={tournamentData} />
      <div
        style={{
          position: "absolute",
          right: "15px",
          top: mobile ? "44px" : "64px",
          transform: "translateY(50%)"
        }}
      >
        <CopyToClipboardButton />
      </div>
      {mobile ? (
        <Select
          value={currentTab}
          onChange={(event) => {
            handleTabChange(event.target.value);
          }}
          style={{ marginBottom: "10px", alignItems: "center", padding: "0" }}
          sx={{
            border: "2px solid #db4744",
            fontSize: "13px",
            color: "#db4744",
            margin: "10px 0",
            width: "100%"
          }}
        >
          <MenuItem value="tournamentInfo" sx={{ fontSize: "13px" }}>
            {t("tournament_view_labels.tournament_info")}
          </MenuItem>
          <MenuItem value="scoreboard" sx={{ fontSize: "13px" }}>
            {t("tournament_view_labels.scoreboard")}
          </MenuItem>
          <MenuItem value="ongoingUpcomingMatches" sx={{ fontSize: "13px" }}>
            {t("tournament_view_labels.ongoing_upcoming_matches_tab")}
          </MenuItem>
          <MenuItem value="completedMatches" sx={{ fontSize: "13px" }}>
            {t("tournament_view_labels.past_matches_tab")}
          </MenuItem>
        </Select>
      ) : (
        <>
          <Tabs
            value={currentTab}
            onChange={(_, newValue) => {
              handleTabChange(newValue);
            }}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{ margin: "10px 0" }}
          >
            <Tab
              label={t("tournament_view_labels.tournament_info")}
              value="tournamentInfo"
              sx={{ fontSize: "13px" }}
            />
            <Tab
              label={t("tournament_view_labels.overview")}
              value="overview"
              sx={{ fontSize: "13px" }}
            />
            <Tab
              label={t("tournament_view_labels.scoreboard")}
              value="scoreboard"
              sx={{ fontSize: "13px" }}
            />
            <Tab
              label={t("tournament_view_labels.ongoing_upcoming_matches_tab")}
              value="ongoingUpcomingMatches"
              sx={{ fontSize: "13px" }}
            />
            <Tab
              label={t("tournament_view_labels.past_matches_tab")}
              value="completedMatches"
              sx={{ fontSize: "13px" }}
            />
          </Tabs>
        </>
      )}
      {(currentTab === "ongoingUpcomingMatches" ||
        currentTab === "completedMatches") && (
        <Button
          variant="outlined"
          onClick={handleFilterToggle}
          sx={{ fontSize: "10px", borderRadius: "25px", margin: "10px 0" }}
        >
          {showOnlyUserMatches
            ? t("buttons.show_all_matches")
            : t("buttons.show_my_matches")}
        </Button>
      )}
      {currentTab === "tournamentInfo" && (
        <div style={{ padding: "10px 0 0 0" }}>
          <TeamRoundRobinUpcomingView ongoing />
        </div>
      )}
      {currentTab === "overview" && (
        <div style={{ padding: "10px 0 0 0" }}>
          <MatchUpOverview teams={teams} />
        </div>
      )}
      {currentTab === "scoreboard" && <TeamScoreboard teams={teams} />}
      {currentTab === "ongoingUpcomingMatches" && (
        <Matches
          ongoingMatchElements={ongoingElements}
          upcomingMatchElements={upcomingElements}
          pastMatchElements={[]}
          tournamentData={tournamentData}
        />
      )}
      {currentTab === "completedMatches" && (
        <Matches
          ongoingMatchElements={[]}
          upcomingMatchElements={[]}
          pastMatchElements={pastElements}
          tournamentData={tournamentData}
        />
      )}
      {isUserTheCreator && currentTab === "ongoingUpcomingMatches" && (
        <DeleteUserFromTournament />
      )}
    </>
  );
};

export default TeamRoundRobinTournamentView;
