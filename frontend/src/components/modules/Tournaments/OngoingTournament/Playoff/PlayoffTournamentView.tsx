import React, { useEffect, useState } from "react";
import { Box, Typography, Divider, IconButton } from "@mui/material";
import { useTournament } from "context/TournamentContext";
import { useNavigate } from "react-router-dom";
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

interface Rounds extends Record<number, Match[]> {}

interface PlayoffTournamentViewProps {
  swiss?: boolean;
}

const PlayoffTournamentView: React.FC<PlayoffTournamentViewProps> = ({
  swiss = false
}) => {
  const initialTournamentData = useTournament();
  const tournament = useTournament();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userId } = useAuth();
  const showToast = useToast();
  const isUserTheCreator = tournament?.creator?.id === userId;

  const [error] = useState<string | null>(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [haveSameNames, setHaveSameNames] = useState<boolean>(false);

  const { tournamentData: socketData } = useSocket();

  const [tournamentData, setTournamentData] = useState<Tournament | null>(
    initialTournamentData
  );
  const [expandedRounds, setExpandedRounds] = useState<Record<number, boolean>>(
    {}
  );

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

  const toggleRound = (roundNumber: number): void => {
    setExpandedRounds((prev) => ({
      ...prev,
      [roundNumber]: !prev[roundNumber]
    }));
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        gap: 4,
        overflowX: "auto",
        "&::-webkit-scrollbar": { display: "none" }
      }}
    >
      {!swiss && (
        <>
          <Typography variant="h4">{tournamentData.name}</Typography>
          <TournamentWinner tournament={tournamentData} />
          <CopyToClipboardButton />
        </>
      )}

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          padding: "20px 0",
          gap: "25px"
        }}
      >
        {Object.entries(rounds).map(([roundNumber, matches], index) => (
          <React.Fragment key={roundNumber}>
            {index > 0 && <Divider orientation="horizontal" flexItem />}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                padding: "20px",
                backgroundColor: "#f9f9f9",
                borderRadius: 2,
                boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
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
                    fontSize: "17px"
                  }}
                >
                  {t("tournament_view_labels.round")}{" "}
                  {parseInt(roundNumber, 10)}
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
                    const tempPlayers: TournamentPlayer[] = match.players.map(
                      (matchPlayer) => {
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
                      }
                    );

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
        ))}
      </Box>

      {isUserTheCreator && <DeleteUserFromTournament />}
    </Box>
  );
};

export default PlayoffTournamentView;
