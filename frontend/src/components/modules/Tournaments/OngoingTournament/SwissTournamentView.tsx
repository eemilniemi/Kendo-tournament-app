import React, { useState, useEffect, useRef } from "react";
import { Tabs, Tab, Typography, Grid } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTournament } from "context/TournamentContext";
import { useTranslation } from "react-i18next";
import CopyToClipboardButton from "./CopyToClipboardButton";
import {
  getPlayerNames,
  Scoreboard,
  sortMatches,
  type TournamentPlayer,
  updatePlayerStats
} from "./RoundRobinTournamentView";
import PlayoffTournamentView from "./PlayoffTournamentView";
import { type Match } from "../../../../types/models";

const SwissTournamentView: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const tournament = useTournament();
  const [searchParams, setSearchParams] = useSearchParams();
  const [players, setPlayers] = useState<TournamentPlayer[]>([]);
  const initialRender = useRef(true);
  const tabTypes = ["scoreboard", "playoff"] as const;
  const defaultTab = "scoreboard";
  const currentTab = searchParams.get("tab") ?? defaultTab;
  const [ongoingMatches, setOngoingMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [pastMatches, setPastMatches] = useState<Match[]>([]);

  try {
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
      getPlayerNames(tournament, setPlayers);
      const sortedMatches = sortMatches(tournament.matchSchedule);
      setOngoingMatches(sortedMatches.ongoingMatches);
      setUpcomingMatches(sortedMatches.upcomingMatches);
      setPastMatches(sortedMatches.pastMatches);
    }, [tournament]);

    useEffect(() => {
      if (initialRender.current && players.length > 0) {
        initialRender.current = false;
        updatePlayerStats(tournament, setPlayers);
      }
    }, [players, tournament]);

    return (
      <>
        <Grid container alignItems="center" spacing={4}>
          <Grid item>
            <Typography variant="h4">{tournament.name}</Typography>
          </Grid>
          <Grid item>
            <CopyToClipboardButton />
          </Grid>
        </Grid>

        <Tabs
          value={currentTab}
          onChange={(_, newValue) => {
            handleTabChange(newValue);
          }}
        >
          <Tab
            label={t("tournament_view_labels.scoreboard")}
            value="scoreboard"
          />
          <Tab label={t("tournament_view_labels.matches")} value="playoff" />
        </Tabs>

        {currentTab === "scoreboard" && <Scoreboard players={players} />}

        {currentTab === "playoff" && <PlayoffTournamentView />}
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
