import React, { useState, useEffect, useRef } from "react";
import { Tabs, Tab, Typography, Box, MenuItem, Select } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { useTournament } from "context/TournamentContext";
import { useTranslation } from "react-i18next";
import CopyToClipboardButton from "../CopyToClipboardButton";
import {
  getPlayerNames,
  Scoreboard,
  sortMatches,
  type TournamentPlayer,
  updatePlayerStats
} from "../RoundRobin/RoundRobinTournamentView";
import PlayoffTournamentView from "../Playoff/PlayoffTournamentView";
import { type Match, type Tournament } from "../../../../../types/models";
import { useSocket } from "context/SocketContext";
import { joinTournament, leaveTournament } from "sockets/emit";
import { checkSameNames } from "../../PlayerNames";
import api from "api/axios";
import useToast from "hooks/useToast";
import TournamentWinner from "../../Winner";
import { format } from "date-fns";
import useMediaQuery from "@mui/material/useMediaQuery";
import UpcomingTournamentView from "../../UpcomingTournamentView";

const SwissTournamentView: React.FC = () => {
  const setError = useState<string | null>(null)[1];
  const { t } = useTranslation();
  const tournament = useTournament();
  const [searchParams, setSearchParams] = useSearchParams();
  const [players, setPlayers] = useState<TournamentPlayer[]>([]);
  const initialRender = useRef(true);
  const tabTypes = ["scoreboard", "matches", "tournamentInfo"] as const;
  const defaultTab = "scoreboard";
  const currentTab = searchParams.get("tab") ?? defaultTab;
  const setOngoingMatches = useState<Match[]>([])[1];
  const setUpcomingMatches = useState<Match[]>([])[1];
  const setPastMatches = useState<Match[]>([])[1];
  const [haveSameNames, setHaveSameNames] = useState<boolean>(false);
  const [hasJoined, setHasJoined] = useState(false);
  const showToast = useToast();
  const mobile = useMediaQuery("(max-width:600px)");

  try {
    useEffect(() => {
      const result = checkSameNames(tournament);
      setHaveSameNames(result);
    }, []);

    const { tournamentData: socketData } = useSocket();

    const [tournamentData, setTournamentData] =
      useState<Tournament>(tournament);

    // Listening to tournaments websocket
    useEffect(() => {
      if (tournament.id !== undefined && !hasJoined) {
        joinTournament(tournament.id);
        setHasJoined(true);

        return () => {
          leaveTournament(tournament.id);
          setHasJoined(false);
        };
      }
    }, [tournament.id]);

    useEffect(() => {
      const fetchData = async (): Promise<void> => {
        try {
          if (socketData !== undefined) {
            setTournamentData(socketData);
          } else {
            const data: Tournament = await api.tournaments.getTournament(
              tournament.id
            );
            setTournamentData(data);
          }
        } catch (error) {
          showToast(error, "error");
        }
      };

      void fetchData();
    }, [socketData]);

    useEffect(() => {
      if (currentTab === null || !tabTypes.some((tab) => tab === currentTab)) {
        setSearchParams((params) => {
          params.set("tab", defaultTab);
          return params;
        });
      }
    }, [currentTab]);

    const handleTabChange = (tab: string): void => {
      setSearchParams((params) => {
        params.set("tab", tab);
        return params;
      });
    };

    useEffect(() => {
      getPlayerNames(tournamentData, setPlayers);
      const sortedMatches = sortMatches(tournamentData.matchSchedule);
      setOngoingMatches(sortedMatches.ongoingMatches);
      setUpcomingMatches(sortedMatches.upcomingMatches);
      setPastMatches(sortedMatches.pastMatches);
    }, [tournamentData]);

    const prevMatchScheduleRef = useRef(tournamentData.matchSchedule);

    useEffect(() => {
      // Function to check if there are any recently finished matches
      const hasFinishedMatches = (
        currentMatches: Match[],
        previousMatches: Match[]
      ): boolean => {
        return currentMatches.some((match) => {
          if (match.endTimestamp === undefined) return false; // Skip if match hasn't ended
          // Search for a match with the same ID in previousMatches to compare its state to the current one
          const prevMatch = previousMatches.find((m) => m.id === match.id);
          // Returns true if either the match was not present in previousMatches (meaning
          // it's a new match that has ended since the last check) or if the endTimestamp has changed
          // (indicating the match has recently concluded)
          return (
            prevMatch === undefined ||
            prevMatch.endTimestamp !== match.endTimestamp
          );
        });
      };

      if (
        hasFinishedMatches(
          tournamentData.matchSchedule,
          prevMatchScheduleRef.current
        )
      ) {
        updatePlayerStats(tournamentData, setPlayers);
      }

      // Update the ref with the current matchSchedule after running checks
      prevMatchScheduleRef.current = tournamentData.matchSchedule;
    }, [tournamentData.matchSchedule]);

    useEffect(() => {
      if (initialRender.current && players.length > 0) {
        initialRender.current = false;
        updatePlayerStats(tournamentData, setPlayers);
      }
    }, [players, tournamentData]);

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
            <MenuItem value="matches" sx={{ fontSize: "13px" }}>
              {t("tournament_view_labels.matches")}
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
                label={t("tournament_view_labels.scoreboard")}
                value="scoreboard"
                sx={{ fontSize: "13px" }}
              />
              <Tab
                label={t("tournament_view_labels.matches")}
                value="matches"
                sx={{ fontSize: "13px" }}
              />
            </Tabs>
          </>
        )}
        {currentTab === "tournamentInfo" && (
          <div style={{ padding: "10px 0 0 0" }}>
            <UpcomingTournamentView ongoing />
          </div>
        )}
        {currentTab === "scoreboard" && (
          <Box sx={{ padding: "20px 0px" }}>
            <Scoreboard players={players} haveSameNames={haveSameNames} />
          </Box>
        )}
        {currentTab === "matches" && (
          <PlayoffTournamentView isChildTournament={true} />
        )}
      </>
    );
  } catch (e) {
    if (e instanceof Error) {
      setError(e.message);
    } else {
      setError(t("messages.unexpected_error_happened"));
    }
  }
};

export default SwissTournamentView;
