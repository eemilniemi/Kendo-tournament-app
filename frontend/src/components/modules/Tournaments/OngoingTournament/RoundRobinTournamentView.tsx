import React, { useState, useEffect, useRef } from "react";
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
  Button,
  type ButtonProps
} from "@mui/material";
import { type User, type Match, type Tournament } from "types/models";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTournament } from "context/TournamentContext";
import { useTranslation } from "react-i18next";
import CopyToClipboardButton from "./CopyToClipboardButton";

export interface TournamentPlayer {
  id: string;
  name: string;
  points: number;
  ippons: number;
  wins: number;
  losses: number;
  ties: number;
}

interface ScoreboardProps {
  players: TournamentPlayer[];
  onClick?: () => void; // Make onClick prop optional
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ players, onClick }) => {
  const { t } = useTranslation();

  const generateTableCells = (player: TournamentPlayer): React.ReactNode[] => {
    return Object.values(player).map((value, index) => {
      if (index === 0) {
        // If we want to skip the ID property
        return null;
      }

      return (
        <TableCell key={index}>
          <Typography>{value}</Typography>
        </TableCell>
      );
    });
  };

  const generateTable = (): React.ReactNode => {
    const sortedPlayers = [...players].sort((a, b) => b.points - a.points);

    const tableHeaders = [
      t("tournament_view_labels.name"),
      t("tournament_view_labels.points"),
      t("tournament_view_labels.ippons"),
      t("tournament_view_labels.wins"),
      t("tournament_view_labels.losses"),
      t("tournament_view_labels.ties")
    ];

    return (
      <div>
        <TableContainer component={Paper}>
          <Table onClick={onClick}>
            <TableHead>
              <TableRow>
                {tableHeaders.map((header, index) => (
                  <TableCell key={index}>{header}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedPlayers.map((player, index) => (
                <TableRow key={index}>{generateTableCells(player)}</TableRow>
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
}> = ({ ongoingMatchElements, upcomingMatchElements, pastMatchElements }) => {
  const { t } = useTranslation();

  return (
    <div>
      <div>
        <Typography variant="h5">
          {t("tournament_view_labels.ongoing_matches")}
        </Typography>
      </div>
      <div>{ongoingMatchElements}</div>

      <div>
        <Typography variant="h5">
          {t("tournament_view_labels.upcoming_matches")}
        </Typography>
      </div>
      <div>{upcomingMatchElements}</div>
      <div>
        <Typography variant="h5">
          {t("tournament_view_labels.past_matches")}
        </Typography>
      </div>
      <div>{pastMatchElements}</div>
    </div>
  );
};

export const updatePlayerStats = (
  tournament: Tournament,
  setPlayers: React.Dispatch<React.SetStateAction<TournamentPlayer[]>>
): void => {
  const processedMatches = new Set<string>();

  setPlayers((prevPlayers: TournamentPlayer[]) => {
    const updatedPlayers = [...prevPlayers];

    for (const match of tournament.matchSchedule) {
      if (processedMatches.has(match.id)) {
        continue;
      }

      // Exclude playoff matches in preliminaryplayoff view scoreboard
      if (match.type === "playoff") {
        continue;
      }

      const [player1Id, player2Id] = match.players.map((player) => player.id);

      // Find the TournamentPlayer objects corresponding to the player IDs
      const player1Index = updatedPlayers.findIndex(
        (player) => player.id === player1Id
      );
      const player2Index = updatedPlayers.findIndex(
        (player) => player.id === player2Id
      );

      // Add wins and losses
      if (match.winner !== undefined) {
        const winnerIndex = updatedPlayers.findIndex(
          (player) => player.id === match.winner
        );
        const loserIndex =
          winnerIndex === player1Index ? player2Index : player1Index;

        // Update stats, win equals 3 points
        updatedPlayers[winnerIndex].wins += 1;
        updatedPlayers[winnerIndex].points += 3;
        updatedPlayers[loserIndex].losses += 1;
      }

      // Add ties
      if (
        match.winner === undefined &&
        (match.endTimestamp !== undefined ||
          match.elapsedTime >= match.matchTime)
      ) {
        // Update their stats, tie equals 1 point
        updatedPlayers[player1Index].ties += 1;
        updatedPlayers[player1Index].points += 1;
        updatedPlayers[player2Index].ties += 1;
        updatedPlayers[player2Index].points += 1;
      }

      // Add ippons
      updatedPlayers[player1Index].ippons += match.player1Score;
      updatedPlayers[player2Index].ippons += match.player2Score;
      processedMatches.add(match.id);
    }
    return updatedPlayers;
  });
};

export const getPlayerNames = (
  tournament: Tournament,
  setPlayers: React.Dispatch<React.SetStateAction<TournamentPlayer[]>>
): void => {
  setPlayers((prevPlayers: TournamentPlayer[]) => {
    const updatedPlayers = [...prevPlayers];
    const playersObjects: User[] = tournament.players;
    if (playersObjects.length > 0) {
      for (const playerObject of playersObjects) {
        const playerExists = updatedPlayers.some(
          (player) => player.id === playerObject.id
        );
        if (!playerExists) {
          updatedPlayers.push({
            id: playerObject.id,
            name: playerObject.firstName,
            points: 0,
            ippons: 0,
            wins: 0,
            losses: 0,
            ties: 0
          });
        }
      }
    }
    return updatedPlayers;
  });
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
  const upcomingMatches = matches.filter(
    (match) => match.elapsedTime <= 0 && match.endTimestamp === undefined
  );
  const pastMatches = matches.filter(
    (match) => match.elapsedTime > 0 && match.endTimestamp !== undefined
  );

  return { ongoingMatches, upcomingMatches, pastMatches };
};

export const createMatchButton = (
  match: Match,
  players: TournamentPlayer[],
  navigate: (path: string) => void,
  t: (key: string) => string,
  props: ButtonProps
): React.ReactNode => {
  const player1 = players.find((player) => player.id === match.players[0].id)
    ?.name;
  const player2 = players.find((player) => player.id === match.players[1].id)
    ?.name;

  let officialsInfo = "";

  if (match.elapsedTime <= 0) {
    // Match is upcoming
    const timerPerson = match.timeKeeper ?? undefined;
    const pointMaker = match.pointMaker ?? undefined;

    // depending on which roles are missing for the match, print them under button
    if (timerPerson === undefined && pointMaker === undefined) {
      officialsInfo = t("tournament_view_labels.missing_both");
    } else {
      if (timerPerson === undefined) {
        officialsInfo += t("tournament_view_labels.missing_timer");
      }
      if (pointMaker === undefined) {
        officialsInfo += t("tournament_view_labels.missing_point_maker");
      }
    }
  }

  return (
    <div style={{ marginBottom: "10px" }} key={match.id}>
      <Button
        onClick={() => {
          navigate(`match/${match.id}`);
        }}
        {...props}
      >
        {`${player1} - ${player2}`}
      </Button>
      {officialsInfo !== undefined && (
        <Typography variant="body2">{officialsInfo}</Typography>
      )}
    </div>
  );
};

const RoundRobinTournamentView: React.FC = () => {
  const tournament = useTournament();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const initialRender = useRef(true);
  const [players, setPlayers] = useState<TournamentPlayer[]>([]);
  const [ongoingMatches, setOngoingMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [pastMatches, setPastMatches] = useState<Match[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const tabTypes = ["scoreboard", "matches"] as const;
  const defaultTab = "scoreboard";
  const currentTab = searchParams.get("tab") ?? defaultTab;

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

  const ongoingElements = ongoingMatches.map((match) =>
    createMatchButton(match, players, navigate, t, {
      variant: "contained"
    })
  );
  const upcomingElements = upcomingMatches.map((match) =>
    createMatchButton(match, players, navigate, t, {
      variant: "contained",
      color: "info"
    })
  );
  const pastElements = pastMatches.map((match) =>
    createMatchButton(match, players, navigate, t, {
      variant: "contained",
      color: "secondary"
    })
  );

  return (
    <>
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
      {currentTab === "scoreboard" && <Scoreboard players={players} />}
      {currentTab === "matches" && (
        <Matches
          ongoingMatchElements={ongoingElements}
          upcomingMatchElements={upcomingElements}
          pastMatchElements={pastElements}
        />
      )}
      <CopyToClipboardButton/>
    </>
  );
};

export default RoundRobinTournamentView;
