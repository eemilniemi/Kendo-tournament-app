import React, { useEffect, useState } from "react";
import TreeComponent from "./TournamentTree";
import {
  Box,
  Typography,
  Divider,
  IconButton,
  Select,
  MenuItem,
  Tabs,
  Tab
} from "@mui/material";
import { useTournament } from "context/TournamentContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "context/AuthContext";
import { useSocket } from "context/SocketContext";
import api from "api/axios";
import useToast from "hooks/useToast";
import ErrorModal from "components/common/ErrorModal";
import routePaths from "routes/route-paths";
import CopyToClipboardButton from "../CopyToClipboardButton";
import DeleteUserFromTournament from "../DeleteUserFromTournament";
import TournamentWinner from "../../Winner";
import { type Match, type Tournament } from "types/models";
import { type TournamentPlayer } from "../RoundRobin/RoundRobinTournamentView";
import MatchButton from "../../MatchButton";
import { checkSameNames } from "../../PlayerNames";
import { joinTournament, leaveTournament } from "sockets/emit";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import { format } from "date-fns";
import useMediaQuery from "@mui/material/useMediaQuery";
import UpcomingTournamentView from "../../UpcomingTournamentView";

interface Rounds extends Record<number, Match[]> {}

interface PlayoffTournamentViewProps {
  isChildTournament?: boolean;
}

const PlayoffTournamentView: React.FC<PlayoffTournamentViewProps> = ({
  isChildTournament = false
}) => {
  const initialTournamentData = useTournament();
  const tournament = useTournament();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userId } = useAuth();
  const showToast = useToast();
  const isUserTheCreator = tournament?.creator?.id === userId;
  const mobile = useMediaQuery("(max-width:600px)");

  const [error] = useState<string | null>(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [haveSameNames, setHaveSameNames] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = "tree";
  const currentTab = searchParams.get("tab") ?? defaultTab;
  const tabTypes = isChildTournament
    ? ["matches", "tree"]
    : ["tournamentInfo", "matches", "tree"];

  const { tournamentData: socketData } = useSocket();

  const [tournamentData, setTournamentData] = useState<Tournament | null>(
    initialTournamentData
  );
  const [expandedRounds, setExpandedRounds] = useState<Record<number, boolean>>(
    {}
  );

  useEffect(() => {
    if (!tabTypes.includes(currentTab) && !isChildTournament) {
      setSearchParams((params) => {
        params.set("tab", defaultTab);
        return params;
      });
    }
  }, [currentTab, tabTypes]);

  const handleTabChange = (tab: string): void => {
    setSearchParams((params) => {
      params.set("tab", tab);
      return params;
    });
  };

  useEffect(() => {
    if (tournament !== null) {
      const result = checkSameNames(tournament);
      setHaveSameNames(result);
    }
  }, [tournament]);

  useEffect(() => {
    if ((initialTournamentData?.id).length > 0 && !hasJoined) {
      joinTournament(initialTournamentData.id);
      setHasJoined(true);

      return () => {
        leaveTournament(initialTournamentData.id);
        setHasJoined(false);
      };
    }
  }, [initialTournamentData?.id]);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        if (socketData != null) {
          setTournamentData(socketData);
        } else if ((initialTournamentData?.id).length > 0) {
          const data: Tournament = await api.tournaments.getTournament(
            initialTournamentData.id
          );
          setTournamentData(data);
        }
      } catch (error) {
        showToast("Failed to fetch tournament data", "error");
      }
    };

    void fetchData();
  }, [socketData, initialTournamentData?.id]);

  if (error !== null) {
    return (
      <ErrorModal
        open
        onClose={() => {
          navigate(routePaths.homeRoute);
        }}
        errorMessage={error}
      />
    );
  }

  if (tournamentData === null || tournamentData === undefined) {
    return null; // Show nothing until tournament data is available
  }

  // Group matches by round
  const roundsForPlayoffsOnly: Rounds = tournamentData.matchSchedule
    .filter((match) => match.type === "playoff")
    .reduce<Rounds>((acc, match) => {
      const round = match.tournamentRound ?? 0;
      if (acc[round] === undefined) {
        acc[round] = [];
      }
      acc[round].push(match);
      return acc;
    }, {});

  const calculateTotalRounds = (numPlayers: number): number => {
    if (numPlayers <= 1) return 0; // No rounds if there's only one or no players
    return Math.ceil(Math.log2(numPlayers)); // Calculate the number of rounds
  };

  // Get the total number of rounds
  const totalRounds = (): number => {
    if (!isChildTournament) {
      return calculateTotalRounds(tournamentData.players.length);
    } else {
      if (
        tournamentData.groups !== null &&
        tournamentData.groups !== undefined &&
        tournamentData.playersToPlayoffsPerGroup !== undefined
      ) {
        const playoffPlayers =
          tournamentData.groups.length *
          tournamentData.playersToPlayoffsPerGroup;
        return calculateTotalRounds(playoffPlayers);
      } else {
        return 0;
      }
    }
  };

  const toggleRound = (roundNumber: number): void => {
    setExpandedRounds((prev) => ({
      ...prev,
      [roundNumber]: !prev[roundNumber]
    }));
  };

  const formattedStartDate =
    tournamentData.startDate !== null
      ? format(new Date(tournamentData.startDate), "MMM dd, yyyy")
      : "";
  const formattedEndDate =
    tournamentData.endDate !== null
      ? format(new Date(tournamentData.endDate), "MMM dd, yyyy")
      : "";

  const getRoundName = (roundNumber: number): string => {
    if (tournament.type === "Swiss") {
      return `${t("tournament_view_labels.round")} ${roundNumber}`; // Only display round numbers for Swiss tournaments
    }

    // For other types of tournaments, use the existing logic
    if (roundNumber === totalRounds()) {
      return t("tournament_view_labels.final");
    }
    if (roundNumber === totalRounds() - 1) {
      return t("tournament_view_labels.semi_final");
    }
    if (roundNumber === totalRounds() - 2) {
      return t("tournament_view_labels.quarter_final");
    }
    return `${t("tournament_view_labels.round")} ${roundNumber}`;
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        overflowX: "auto",
        "&::-webkit-scrollbar": { display: "none" }
      }}
    >
      {!isChildTournament && (
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
              style={{
                marginBottom: "10px",
                alignItems: "center",
                padding: "0"
              }}
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
              <MenuItem value="matches" sx={{ fontSize: "13px" }}>
                {t("tournament_view_labels.past_matches_tab")}
              </MenuItem>
              <MenuItem value="tree" sx={{ fontSize: "13px" }}>
                {t("tournament_view_labels.tournament_tree")}
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
                  label={t("tournament_view_labels.tournament_tree")}
                  value="tree"
                  sx={{ fontSize: "13px" }}
                />
                <Tab
                  label={t("tournament_view_labels.matches")}
                  value="matches"
                  sx={{ fontSize: "13px" }}
                />
                <Tab
                  label={t("tournament_view_labels.tournament_info")}
                  value="tournamentInfo"
                  sx={{ fontSize: "13px" }}
                />
              </Tabs>
            </>
          )}
        </>
      )}

      {(currentTab === "matches" || isChildTournament) && (
        <>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              padding: "20px 0",
              gap: "10px 25px"
            }}
          >
            {isChildTournament
              ? Object.entries(roundsForPlayoffsOnly).map(
                  ([roundNumber, matches], index) => (
                    <React.Fragment key={roundNumber}>
                      {index > 0 && (
                        <Divider orientation="horizontal" flexItem />
                      )}
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          padding: "20px",
                          borderRadius: 2,
                          width: "100%"
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between"
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{
                              marginBottom: 2,
                              textDecoration: "underline",
                              fontSize: "17px",
                              fontWeight: "bold"
                            }}
                          >
                            {getRoundName(index + 1)}
                          </Typography>
                          <IconButton
                            onClick={() => {
                              toggleRound(parseInt(roundNumber, 10));
                            }}
                          >
                            {expandedRounds[parseInt(roundNumber, 10)] ? (
                              <ArrowDropUpIcon />
                            ) : (
                              <ArrowDropDownIcon />
                            )}
                          </IconButton>
                        </Box>
                        {expandedRounds[parseInt(roundNumber, 10)] && (
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              justifyContent: "flex-start",
                              gap: "40px"
                            }}
                          >
                            {matches.map((match) => {
                              const tempPlayers: TournamentPlayer[] =
                                match.players.map((matchPlayer) => {
                                  const player = tournamentData.players.find(
                                    (p) => p.id === matchPlayer.id
                                  );
                                  if (player === null || player === undefined) {
                                    throw new Error("Player not found");
                                  }
                                  return {
                                    id: player.id,
                                    firstName: player.firstName,
                                    lastName: player.lastName,
                                    points: 0,
                                    ippons: 0,
                                    wins: 0,
                                    losses: 0,
                                    ties: 0
                                  };
                                });

                              return (
                                <MatchButton
                                  key={match.id}
                                  match={match}
                                  players={tempPlayers}
                                  isUserTheCreator={isUserTheCreator}
                                  tournamentData={tournamentData}
                                  haveSameNames={haveSameNames}
                                />
                              );
                            })}
                          </Box>
                        )}
                      </Box>
                    </React.Fragment>
                  )
                )
              : Object.entries(roundsForPlayoffsOnly).map(
                  ([roundNumber, matches], index) => (
                    <React.Fragment key={roundNumber}>
                      {index > 0 && (
                        <Divider orientation="horizontal" flexItem />
                      )}
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          padding: "20px",
                          borderRadius: 2,
                          width: "100%"
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between"
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{
                              marginBottom: 2,
                              textDecoration: "underline",
                              fontSize: "17px",
                              fontWeight: "bold"
                            }}
                          >
                            {getRoundName(parseInt(roundNumber, 10))}
                          </Typography>
                          <IconButton
                            onClick={() => {
                              toggleRound(parseInt(roundNumber, 10));
                            }}
                          >
                            {expandedRounds[parseInt(roundNumber, 10)] ? (
                              <ArrowDropUpIcon />
                            ) : (
                              <ArrowDropDownIcon />
                            )}
                          </IconButton>
                        </Box>
                        {expandedRounds[parseInt(roundNumber, 10)] && (
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              justifyContent: "flex-start",
                              gap: "40px"
                            }}
                          >
                            {matches.map((match) => {
                              const tempPlayers: TournamentPlayer[] =
                                match.players.map((matchPlayer) => {
                                  const player = tournamentData.players.find(
                                    (p) => p.id === matchPlayer.id
                                  );
                                  if (player === null || player === undefined) {
                                    throw new Error("Player not found");
                                  }
                                  return {
                                    id: player.id,
                                    firstName: player.firstName,
                                    lastName: player.lastName,
                                    points: 0,
                                    ippons: 0,
                                    wins: 0,
                                    losses: 0,
                                    ties: 0
                                  };
                                });

                              return (
                                <MatchButton
                                  key={match.id}
                                  match={match}
                                  players={tempPlayers}
                                  isUserTheCreator={isUserTheCreator}
                                  tournamentData={tournamentData}
                                  haveSameNames={haveSameNames}
                                />
                              );
                            })}
                          </Box>
                        )}
                      </Box>
                    </React.Fragment>
                  )
                )}
          </Box>
          {isUserTheCreator && <DeleteUserFromTournament />}
        </>
      )}

      {currentTab === "tournamentInfo" && (
        <div style={{ padding: "10px 0 0 0" }}>
          <UpcomingTournamentView ongoing />
        </div>
      )}

      {currentTab === "tree" && (
        <>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              padding: "20px 0",
              gap: "10px 25px"
            }}
          >
            <Typography variant="h6">
              {t("tournament_view_labels.tournament_tree")}
            </Typography>
            <TreeComponent />
          </Box>
        </>
      )}
    </Box>
  );
};

export default PlayoffTournamentView;
