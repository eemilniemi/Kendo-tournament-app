import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useTournaments } from "context/TournamentsContext";
import type { Match, TournamentType } from "types/models";
import { Box, Typography, Grid, Tab, Tabs } from "@mui/material";
import { useTranslation } from "react-i18next";
import CopyToClipboardButton from "./OngoingTournament/CopyToClipboardButton";
import {
  getPlayerNames,
  Scoreboard,
  updatePlayerStats,
  type TournamentPlayer
} from "./OngoingTournament/RoundRobin/RoundRobinTournamentView";
import { checkSameNames } from "./PlayerNames";
import MatchButton from "./MatchButton";
import { useAuth } from "context/AuthContext";
import TournamentWinner from "./Winner";

type Rounds = Record<string, Match[]>; // Define the type for rounds

const PastTournamentMatches: React.FC = () => {
  const { tournamentId } = useParams();
  const { past } = useTournaments();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabTypes = ["scoreboard", "matches"] as const;
  const defaultTab = "scoreboard";
  const currentTab = searchParams.get("tab") ?? defaultTab;
  const [players, setPlayers] = useState<TournamentPlayer[]>([]);
  const [haveSameNames, setHaveSameNames] = useState<boolean>(false);
  const { userId } = useAuth();

  // Tournament types with their translations
  const tournamentTypes: Record<TournamentType, string> = {
    "Round Robin": "types.round_robin",
    "Team Round Robin": "types.team_round_robin",
    Playoff: "types.playoff",
    "Preliminary Playoff": "types.preliminary_playoff",
    Swiss: "types.swiss"
  };

  const selectedTournament = past.find(
    (tournament) => tournament.id === tournamentId
  );

  const isUserTheCreator = selectedTournament?.creator.id === userId;

  if (selectedTournament === null || selectedTournament === undefined) {
    return <div>Tournament not found.</div>; // lisää lokalisaatuo
  }

  const showTabs =
    selectedTournament.type === "Round Robin" ||
    selectedTournament.type === "Swiss";

  useEffect(() => {
    if (selectedTournament !== undefined) {
      const result = checkSameNames(selectedTournament);
      setHaveSameNames(result);
      getPlayerNames(selectedTournament, setPlayers);
      updatePlayerStats(selectedTournament, setPlayers);
    }
  }, []);

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

  const rounds: Rounds = {}; // To sort matches per rounds
  selectedTournament.matchSchedule.forEach((match) => {
    const round = match.tournamentRound;
    if (round !== undefined) {
      if (!(round in rounds)) {
        rounds[round] = [];
      }
      rounds[round].push(match);
    }
  });

  const ShowMatches: React.FC<{ rounds: Rounds }> = ({ rounds }) => (
    <div>
      {/* Map through tournament rounds and matches */}
      {Object.entries(rounds).map(([round, matches]) => (
        <div key={round}>
          {/* Add round title only if there is more than one round */}
          {Object.keys(rounds).length > 1 && (
            <Typography variant="h6" sx={{ marginTop: 2 }}>
              {t("tournament_view_labels.round")} {round}
            </Typography>
          )}
          <Box
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "20px",
              padding: "20px 0px"
            }}
          >
            {matches.map((match) => (
              <MatchButton
                key={match.id}
                match={match}
                players={players}
                haveSameNames={haveSameNames}
                isUserTheCreator={isUserTheCreator}
                tournamentData={selectedTournament}
              />
            ))}
          </Box>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <Grid container alignItems="center" spacing={4} marginBottom={2}>
        <Grid item>
          <Typography variant="h4">{selectedTournament.name}</Typography>
        </Grid>
        <Grid item>
          <CopyToClipboardButton />
        </Grid>
      </Grid>
      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        {t(tournamentTypes[selectedTournament.type])}
      </Typography>
      <TournamentWinner tournament={selectedTournament} />

      {showTabs && (
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => {
            handleTabChange(newValue);
          }}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
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
      )}

      {showTabs && currentTab === "scoreboard" && (
        <Box sx={{ padding: "20px 0px" }}>
          <Scoreboard players={players} haveSameNames={haveSameNames} />
        </Box>
      )}

      {showTabs && currentTab === "matches" && <ShowMatches rounds={rounds} />}

      {!showTabs && <ShowMatches rounds={rounds} />}
    </div>
  );
};

export default PastTournamentMatches;
