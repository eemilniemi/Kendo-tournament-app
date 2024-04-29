import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useTournaments } from "context/TournamentsContext";
import type { User, Match, TournamentType } from "types/models";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Tab,
  Tabs
} from "@mui/material";
import { useTranslation } from "react-i18next";
import CopyToClipboardButton from "./OngoingTournament/CopyToClipboardButton";
import {
  getPlayerNames,
  Scoreboard,
  type TournamentPlayer
} from "./OngoingTournament/RoundRobin/RoundRobinTournamentView";
import { checkSameNames } from "./PlayerNames";

type Rounds = Record<string, Match[]>; // Define the type for rounds

const PastTournamentMatches: React.FC = () => {
  const { tournamentId } = useParams();
  const { past } = useTournaments();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabTypes = ["scoreboard", "matches"] as const;
  const defaultTab = "scoreboard";
  const currentTab = searchParams.get("tab") ?? defaultTab;
  const [players, setPlayers] = useState<TournamentPlayer[]>([]);
  const [haveSameNames, setHaveSameNames] = useState<boolean>(false);

  // Tournament types with their translations
  const tournamentTypes: Record<TournamentType, string> = {
    "Round Robin": "types.round_robin",
    Playoff: "types.playoff",
    "Preliminary Playoff": "types.preliminary_playoff",
    Swiss: "types.swiss"
  };

  const selectedTournament = past.find(
    (tournament) => tournament.id === tournamentId
  );

  if (selectedTournament === null || selectedTournament === undefined) {
    return <div>Tournament not found.</div>; // lisää lokalisaatuo
  }

  const showTabs =
    selectedTournament.type === "Round Robin" ||
    selectedTournament.type === "Swiss";

  // Function to get player name by ID
  const getPlayerNameById = (players: User[], playerId: string): string => {
    const player = players.find((player) => player.id === playerId);
    if (player != null) {
      return `${player.firstName} ${player.lastName}`;
    } else {
      return "Unknown Player";
    }
  };

  useEffect(() => {
    if (selectedTournament !== undefined) {
      const result = checkSameNames(selectedTournament);
      setHaveSameNames(result);
      getPlayerNames(selectedTournament, setPlayers);
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

  // Find out the winner of a tournament, calculates who got most points
  const winnerOfRoundOrSwissTournament = (): string => {
    const playerPointsMap: Record<string, number> = {}; // Map to store players ids and their points
    // Iterate over all matches to calculate each player's points
    selectedTournament.matchSchedule.forEach((match) => {
      const player1Id = match.players[0].id;
      const player2Id = match.players[1].id;
      const winnerId = match.winner;

      // Add points for winner and tie for both players in case of a draw
      if (winnerId !== undefined) {
        playerPointsMap[winnerId] = (playerPointsMap[winnerId] ?? 0) + 3;
      } else {
        playerPointsMap[player1Id] = (playerPointsMap[player1Id] ?? 0) + 1;
        playerPointsMap[player2Id] = (playerPointsMap[player2Id] ?? 0) + 1;
      }
    });

    // Find the player with the highest points
    let maxPoints = 0;
    let winnerId = "";
    Object.entries(playerPointsMap).forEach(([playerId, points]) => {
      if (points > maxPoints) {
        maxPoints = points;
        winnerId = playerId;
      }
    });

    if (winnerId === "") {
      return t("tournament_view_labels.no_winner");
    } else {
      // Return the name of the winner
      return getPlayerNameById(selectedTournament.players, winnerId);
    }
  };

  const winnerOfTournament = (): string | undefined => {
    let winnerId;
    if (
      // in case of playoff or preli playoff, winner is the winner of last match
      selectedTournament !== undefined &&
      (selectedTournament.type === "Playoff" ||
        selectedTournament.type === "Preliminary Playoff")
    ) {
      const lastMatchIndex = selectedTournament.matchSchedule.length - 1;
      winnerId = selectedTournament.matchSchedule[lastMatchIndex].winner;
      if (winnerId !== undefined) {
        const winnerText =
          t("tournament_view_labels.tournament_winner") +
          getPlayerNameById(selectedTournament.players, winnerId);
        return winnerText;
      } else {
        return t("tournament_view_labels.no_winner");
      }
    } else if (
      selectedTournament.type === "Round Robin" ||
      selectedTournament.type === "Swiss"
    ) {
      return (
        t("tournament_view_labels.tournament_winner") +
        winnerOfRoundOrSwissTournament()
      );
    }
  };

  const ShowMatches: React.FC<{ rounds: Rounds }> = ({ rounds }) => (
    <div>
      {/* Map through tournament rounds and matches and print each */}
      {Object.entries(rounds).map(([round, matches]) => (
        <div key={round}>
          {/* Add round print only if there is more than one round */}
          {Object.keys(rounds).length > 1 && (
            <Typography variant="h6" sx={{ marginTop: 2 }}>
              {t("tournament_view_labels.round")} {round}
            </Typography>
          )}
          <Box
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "20px"
            }}
          >
            {matches.map((match, matchIndex) => (
              <Card key={matchIndex} variant="outlined" sx={{ mb: 1 }}>
                <CardActionArea
                  onClick={() => {
                    navigate(
                      `/tournaments/${selectedTournament.id}/match/${match.id}`
                    );
                  }}
                >
                  <CardContent>
                    <Typography textAlign="center">
                      {/* Print match details, including player names and scores */}
                      {t("profile.match")} {matchIndex + 1}:
                      <br />
                      {match.players.length === 1 ? (
                        // Handle matches with only one player (bye)
                        <span>
                          {getPlayerNameById(
                            selectedTournament.players,
                            match.players[0].id
                          )}
                          {" - "}
                          {"BYE"}
                        </span>
                      ) : (
                        <span>
                          {getPlayerNameById(
                            selectedTournament.players,
                            match.players[0].id
                          )}
                          {"  "}
                          {match.player1Score}
                          {" - "}
                          {match.player2Score}
                          {"  "}
                          {getPlayerNameById(
                            selectedTournament.players,
                            match.players[1].id
                          )}
                        </span>
                      )}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
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
      <Typography variant="subtitle1" sx={{ marginBottom: 2 }}>
        {winnerOfTournament()}
      </Typography>

      {showTabs && (
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
          <Tab label={t("tournament_view_labels.matches")} value="matches" />
        </Tabs>
      )}

      {showTabs && currentTab === "scoreboard" && (
        <Scoreboard players={players} haveSameNames={haveSameNames} />
      )}

      {showTabs && currentTab === "matches" && <ShowMatches rounds={rounds} />}

      {!showTabs && <ShowMatches rounds={rounds} />}
    </div>
  );
};

export default PastTournamentMatches;
