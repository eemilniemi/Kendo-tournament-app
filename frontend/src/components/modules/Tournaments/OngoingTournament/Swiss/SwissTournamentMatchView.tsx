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
import DeleteUserFromTournament from "../DeleteUserFromTournament";
import { type Match, type Tournament } from "types/models";
import { type TournamentPlayer } from "../RoundRobin/RoundRobinTournamentView";
import MatchButton from "../../MatchButton";
import { checkSameNames } from "../../PlayerNames";
import { joinTournament, leaveTournament } from "sockets/emit";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";

interface Rounds extends Record<number, Match[]> {}

const SwissTournamentMatchView: React.FC = () => {
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
    return `${t("tournament_view_labels.round")} ${roundNumber}`; // Only display round numbers for Swiss tournaments
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
          {Object.entries(rounds).map(([roundNumber, matches], index) => (
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
                  </>
                )}
              </Box>
            </React.Fragment>
          ))}
        </Box>
        {isUserTheCreator && <DeleteUserFromTournament />}
      </>
    </Box>
  );
};

export default SwissTournamentMatchView;
