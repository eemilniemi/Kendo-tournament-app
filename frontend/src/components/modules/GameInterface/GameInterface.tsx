import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid
} from "@mui/material";
import PointTable from "./PointTable";
import Timer from "./Timer";
import OfficialButtons from "./OfficialButtons";
import TimerButton from "./TimerButton";
import api from "api/axios";
import { useParams } from "react-router-dom";
import { type AddPointRequest } from "types/requests";
import type {
  PointType,
  PlayerColor,
  Match,
  MatchPlayer,
  MatchType,
  MatchTime,
  User
} from "types/models";
import "./GameInterface.css";
import { useAuth } from "context/AuthContext";
import { joinMatch, leaveMatch } from "sockets/emit";
import { useSocket } from "context/SocketContext";
import useToast from "hooks/useToast";
import { useTournament } from "context/TournamentContext";
import Loader from "components/common/Loader";
import ErrorModal from "components/common/ErrorModal";
import { useTranslation } from "react-i18next";
import ModifyDeletePoints from "./ModifyDeletePoints";
import PlayerName, { checkSameNames } from "../Tournaments/PlayerNames";
import { mapNumberToLetter } from "utils/helperFunctions";
import OverlayButton from "../Overlay/OverlayButton";
import routePaths from "../../../routes/route-paths";
import {
  calculateElapsedTime,
  findPlayerName
} from "../../../utils/matchUtils";

export interface MatchData {
  timerTime: number;
  players: MatchPlayer[];
  firstNames: string[];
  lastNames: string[];
  winner: string | undefined;
  endTimeStamp: Date | undefined;
  timeKeeper: string | undefined;
  pointMaker: string | undefined;
  startTimestamp: Date | undefined;
  isTimerOn: boolean;
  elapsedTime: number;
  isOvertime: boolean;
  type: MatchType;
  time: MatchTime;
  courtNumber: number;
  scheduledTime: string;
}

const GameInterface: React.FC = () => {
  const { t } = useTranslation();

  const [haveSameNames, setHaveSameNames] = useState<boolean>(false);

  useEffect(() => {
    const result = checkSameNames(tournament);
    setHaveSameNames(result);
  }, []);

  const [matchInfo, setMatchInfo] = useState<MatchData>({
    timerTime: 0,
    players: [],
    firstNames: [],
    lastNames: [],
    winner: undefined,
    endTimeStamp: undefined,
    timeKeeper: undefined,
    pointMaker: undefined,
    startTimestamp: undefined,
    isTimerOn: false,
    elapsedTime: 0,
    isOvertime: false,
    type: "group",
    time: 300000,
    courtNumber: 1,
    scheduledTime: "XX:XX"
  });

  const [openPoints, setOpenPoints] = useState(false);
  const [openRoles, setOpenRoles] = useState(false);
  const [selectedButton, setSelectedButton] = useState<string>("");
  const [timer, setTimer] = useState<number>(matchInfo.timerTime);
  const [playerColor, setPlayerColor] = useState<PlayerColor>("red");
  const [hasJoined, setHasJoined] = useState(false);
  const [mostRecentPointType, setMostRecentPointType] =
    useState<PointType | null>(null);

  const { id, matchId } = useParams();
  const { userId } = useAuth();
  const { matchInfo: matchInfoFromSocket } = useSocket();
  const showToast = useToast();
  const tournament = useTournament();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  // state handlers for whether or not checkbox is checked
  const [timeKeeper, setTimeKeeper] = useState<boolean>(false);
  const [pointMaker, setPointMaker] = useState<boolean>(false);
  const [timeKeeperInfo, setTimeKeeperInfo] = useState<User | null>(null);
  const [pointMakerInfo, setPointMakerInfo] = useState<User | null>(null);

  // Listening to matches websocket
  useEffect(() => {
    if (matchId !== undefined && !hasJoined) {
      joinMatch(matchId);
      setHasJoined(true);

      return () => {
        leaveMatch(matchId);
        setHasJoined(false);
      };
    }
  }, [matchId]);

  useEffect(() => {
    // Check for a saved most recent point type in sessionStorage
    const savedPointType = sessionStorage.getItem("mostRecentPointType");
    if (savedPointType !== null) {
      setMostRecentPointType(savedPointType as PointType);
    }
  }, []);

  // Fetching match data
  useEffect(() => {
    const getMatchData = async (): Promise<void> => {
      try {
        let matchPlayers: MatchPlayer[] = [];
        const playersFirstNames: string[] = [];
        const playersLastNames: string[] = [];
        let matchWinner: string | undefined;
        let timerPerson: string | undefined;
        let pointPerson: string | undefined;
        let time: number = 0;
        let matchEndTimeStamp: Date | undefined;
        let startTime: Date | undefined;
        let timer: boolean = false;
        let matchElapsedTime: number = 0;
        let matchIsOvertime: boolean = false;
        let matchType: MatchType = "group";
        let matchTime: MatchTime = 300000;
        let court: number = 1;
        let scheduledTime: string = "XX:XX";

        // Try to get match info from the websocket
        if (matchInfoFromSocket !== undefined) {
          matchTime = matchInfoFromSocket.matchTime;

          // Get players' names in this match
          matchPlayers = matchInfoFromSocket.players;

          for (let i = 0; i < matchPlayers.length; i++) {
            const p = findPlayerName(matchPlayers[i].id, tournament);
            playersFirstNames[i] = p.firstName;
            playersLastNames[i] = p.lastName;
          }

          // If there is a winner, save them
          if (matchInfoFromSocket.winner !== undefined) {
            const winner = tournament.players.find(
              (p) => p.id === matchInfoFromSocket.winner
            );
            if (winner !== undefined) {
              matchWinner = winner.firstName;
            }
            matchEndTimeStamp = matchInfoFromSocket.endTimestamp;
          }

          // If there isn't a winner, check if there is an end timestamp or if the elapsedtime
          // is over the match time (it's a tie)
          else if (
            matchInfoFromSocket.endTimestamp !== undefined ||
            matchInfoFromSocket.elapsedTime >= matchTime
          ) {
            matchEndTimeStamp = matchInfoFromSocket.endTimestamp;
          }

          // Get officials
          if (matchInfoFromSocket.timeKeeper !== undefined) {
            timerPerson = matchInfoFromSocket.timeKeeper;
          }
          if (matchInfoFromSocket.pointMaker !== undefined) {
            pointPerson = matchInfoFromSocket.pointMaker;
          }
          if (matchInfoFromSocket.startTimestamp !== undefined) {
            startTime = matchInfoFromSocket.startTimestamp;
          }

          matchIsOvertime = matchInfoFromSocket.isOvertime;
          matchType = matchInfoFromSocket.type;

          // Get time
          // Backend only updates elapsedTime when match is stopped
          // so the real time must be calculated.
          timer = matchInfoFromSocket.isTimerOn;
          matchElapsedTime = calculateElapsedTime(
            matchInfoFromSocket.elapsedTime,
            matchInfoFromSocket.timerStartedTimestamp,
            matchTime,
            matchIsOvertime
          );

          time = Math.floor(matchElapsedTime / 1000);

          court = matchInfoFromSocket.courtNumber;

          setTimeKeeper(matchInfoFromSocket.timeKeeper !== undefined);
          setPointMaker(matchInfoFromSocket.pointMaker !== undefined);
        }
        // If websocket doesn't have match info, use api
        // Usually this is the first time the match view is loaded
        else if (matchId !== undefined) {
          const matchFromApi: Match = await api.match.info(matchId);

          if (matchFromApi !== undefined) {
            matchTime = matchFromApi.matchTime;

            matchPlayers = matchFromApi.players;

            for (let i = 0; i < matchPlayers.length; i++) {
              const p = findPlayerName(matchPlayers[i].id, tournament);
              playersFirstNames[i] = p.firstName;
              playersLastNames[i] = p.lastName;
            }

            // If there is a winner, save them
            if (matchFromApi.winner !== undefined) {
              const winner = tournament.players.find(
                (p) => p.id === matchFromApi.winner
              );
              if (winner !== undefined) {
                matchWinner = winner.firstName;
              }
              matchEndTimeStamp = matchFromApi.endTimestamp;
            }
            // If there isn't a winner, check if there is an end timestamp
            // or if elapsed time is over match time (it's a tie)
            else if (
              matchFromApi.endTimestamp !== undefined ||
              matchFromApi.elapsedTime >= matchTime
            ) {
              matchEndTimeStamp = matchFromApi.endTimestamp;
            }
            if (matchFromApi.timeKeeper !== undefined) {
              timerPerson = matchFromApi.timeKeeper;
            }
            if (matchFromApi.pointMaker !== undefined) {
              pointPerson = matchFromApi.pointMaker;
            }
            if (matchFromApi.startTimestamp !== undefined) {
              startTime = matchFromApi.startTimestamp;
            }
            matchIsOvertime = matchFromApi.isOvertime;
            matchType = matchFromApi.type;
            scheduledTime = matchFromApi.scheduledTime;

            // Get time
            // Backend only updates elapsedTime when match is stopped
            // so the real time must be calculated.
            timer = matchFromApi.isTimerOn;
            matchElapsedTime = calculateElapsedTime(
              matchFromApi.elapsedTime,
              matchFromApi.timerStartedTimestamp,
              matchTime,
              matchIsOvertime
            );

            time = Math.floor(matchElapsedTime / 1000);

            court = matchFromApi.courtNumber;

            setTimeKeeper(matchInfo.timeKeeper !== undefined);
            setPointMaker(matchInfo.pointMaker !== undefined);
          }
        }
        setMatchInfo({
          timerTime: time,
          players: matchPlayers,
          firstNames: playersFirstNames,
          lastNames: playersLastNames,
          winner: matchWinner,
          endTimeStamp: matchEndTimeStamp,
          timeKeeper: timerPerson,
          pointMaker: pointPerson,
          startTimestamp: startTime,
          isTimerOn: timer,
          elapsedTime: matchElapsedTime,
          isOvertime: matchIsOvertime,
          type: matchType,
          time: matchTime,
          courtNumber: court,
          scheduledTime
        });
      } catch (error) {
        setIsError(true);
        showToast(error, "error");
      } finally {
        setIsLoading(false);
      }
    };
    void getMatchData();
  }, [isLoading, matchInfoFromSocket]);

  useEffect(() => {
    setTimer(matchInfo.timerTime);
  }, [matchInfo.elapsedTime, matchInfo.timerTime]);

  // Handle timer, make it run and stop
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (matchInfo.isTimerOn) {
      intervalId = setInterval(() => {
        setTimer((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    }

    return () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    };
  }, [matchInfo.isTimerOn]);

  // If timer is ended, check for ties
  useEffect(() => {
    const checkForTieAndStopTimer = async (): Promise<void> => {
      try {
        if (matchInfo.winner !== undefined) {
          return; // Exit early if the winner has been determined so no endless rerendering
        }

        if (
          timer === matchInfo.time / 1000 &&
          matchId !== undefined &&
          !matchInfo.isOvertime
        ) {
          if (matchInfo.isTimerOn) {
            await apiTimerRequest(matchId);
            await api.match.checkForTie(matchId);
          }
        }
      } catch (error) {
        showToast(error, "error");
      }
    };

    void checkForTieAndStopTimer();
  }, [matchInfo, timer]);

  const selectedPointType = buttonToTypeMap[selectedButton];

  const pointRequest: AddPointRequest = {
    pointType: selectedPointType,
    pointColor: playerColor
  };

  // When point is selected, close the selection and send it to API
  const handlePointShowing = async (): Promise<void> => {
    // Check if both time keeper and point maker roles are checked
    setOpenPoints(false);
    if (
      matchInfo.timeKeeper === undefined &&
      matchInfo.pointMaker === undefined
    ) {
      showToast(t("messages.missing_both"), "error");
      return;
    }
    if (matchInfo.timeKeeper === undefined) {
      showToast(t("messages.missing_timekeeper"), "error");
      return;
    }

    if (matchId !== undefined) {
      if (matchInfo.isTimerOn) {
        await apiTimerRequest(matchId);
      }
      if (matchInfo.isOvertime) {
        await apiPointRequest(matchId, pointRequest);
        await api.match.checkForTie(matchId);
      } else {
        await apiPointRequest(matchId, pointRequest);
      }
    }

    setMostRecentPointType(pointRequest.pointType);
    sessionStorage.setItem("mostRecentPointType", pointRequest.pointType);
  };

  // Get the selected radio button value
  const handleRadioButtonClick = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setSelectedButton(event.target.value);
  };

  // Open the radio button selection for points
  const handleOpen = (player: number): void => {
    setSelectedButton("");
    setOpenPoints(true);
    if (player === 1) {
      setPlayerColor("white");
    }
    if (player === 2) {
      setPlayerColor("red");
    }
  };

  // Send the point to the API (add it to the match)
  const apiPointRequest = async (
    matchId: string,
    body: AddPointRequest
  ): Promise<void> => {
    try {
      await api.match.addPoint(matchId, body);
    } catch (error) {
      showToast(error, "error");
    }
  };

  // Send timer starts and stops to API
  const apiTimerRequest = async (matchId: string): Promise<void> => {
    try {
      if (!matchInfo.isTimerOn) {
        await api.match.startTimer(matchId);
      } else {
        await api.match.stopTimer(matchId);
      }
    } catch (error) {
      showToast(error, "error");
    }
  };

  // When timer button is clicked, set its status
  const handleTimerChange = async (): Promise<void> => {
    // Check if both time keeper and point maker roles are checked
    if (
      matchInfo.timeKeeper === undefined &&
      matchInfo.pointMaker === undefined
    ) {
      showToast(t("messages.missing_both"), "error");
      return;
    }
    if (matchInfo.pointMaker === undefined) {
      showToast(t("messages.missing_pointmaker"), "error");
      return;
    }
    if (matchId !== undefined) {
      await apiTimerRequest(matchId);
    }
  };

  const apiRoleRequest = async (
    matchId: string,
    userId: string
  ): Promise<void> => {
    if (userId === undefined || matchId === undefined) return;

    try {
      // if checkbox is checked and no time keeper is set yet
      if (timeKeeper && matchInfo.timeKeeper === undefined) {
        await api.match.addTimekeeper(matchId, userId);
      }
      // if checkbox is not chcekd and time keeper is set
      else if (!timeKeeper && matchInfo.timeKeeper !== undefined) {
        await api.match.removeTimekeeper(matchId, userId);
      }

      // if checkbox is checked and no point maker is set yet
      if (pointMaker && matchInfo.pointMaker === undefined) {
        await api.match.addPointmaker(matchId, userId);
      }
      // if checkbox is not checked and point maker is set
      else if (!pointMaker && matchInfo.pointMaker !== undefined) {
        await api.match.removePointmaker(matchId, userId);
      }
    } catch (error) {
      showToast(error, "error");
    }
  };

  const handleRoleSave = async (): Promise<void> => {
    if (matchId !== undefined && userId !== undefined) {
      await apiRoleRequest(matchId, userId);
    }
    // close popup on save press
    setOpenRoles(false);
  };

  function handleClose(): void {
    setOpenPoints(false);
  }

  function handleCloseRoles(): void {
    setOpenRoles(false);
  }

  function showButtons(): boolean {
    if (matchInfo.winner !== undefined) {
      return false;
    } else if (
      matchInfo.winner === undefined &&
      matchInfo.elapsedTime > matchInfo.time &&
      matchInfo.type === "group"
    ) {
      return false;
    } else {
      return true;
    }
  }

  const handleDeleteRecentPoint = async (): Promise<void> => {
    if (matchId !== undefined) {
      try {
        await api.match.deleteRecentPoint(matchId);
      } catch (error) {
        showToast(error, "error");
      }
    }
    setMostRecentPointType(null);
    sessionStorage.removeItem("mostRecentPointType");
  };

  const handleModifyRecentPoint = async (newType: PointType): Promise<void> => {
    if (matchId !== undefined) {
      try {
        await api.match.modifyRecentPoint(matchId, newType);
      } catch (error) {
        showToast(error, "error");
      }
    }

    setMostRecentPointType(pointRequest.pointType);
  };

  // Function to fetch time keeper information
  const findTimekeeper = async (): Promise<void> => {
    if (userId !== null && userId !== undefined) {
      try {
        if (matchInfo.timeKeeper === undefined) {
          setTimeKeeperInfo(null);
          return;
        }

        const timeKeeper = await api.user.details(matchInfo.timeKeeper);
        if (timeKeeper === undefined) {
          throw new Error("Time keeper not found");
        }
        setTimeKeeperInfo(timeKeeper);
      } catch (error) {
        showToast(error, "error");
      }
    }
  };

  // Function to fetch point maker information
  const findPointmaker = async (): Promise<void> => {
    if (userId !== null && userId !== undefined) {
      try {
        if (matchInfo.pointMaker === undefined) {
          setPointMakerInfo(null);
          return;
        }

        const pointMaker = await api.user.details(matchInfo.pointMaker);
        if (pointMaker === undefined) {
          throw new Error("Point maker not found");
        }
        setPointMakerInfo(pointMaker);
      } catch (error) {
        showToast(error, "error");
      }
    }
  };

  // Call the findTimekeeper and findPointmaker functions when matchInfo updates
  useEffect(() => {
    void findTimekeeper();
    void findPointmaker();
  }, [matchInfo]);

  const handleReset = async (): Promise<void> => {
    if (matchId !== undefined) {
      try {
        await api.match.resetMatch(matchId);
        showToast(t("messages.match_reset"), "success");
      } catch (error) {
        showToast(error, "error");
      }
    }
  };

  const handleResetRoles = async (): Promise<void> => {
    if (matchId !== undefined) {
      try {
        await api.match.resetRoles(matchId);
        showToast(t("messages.role_reset"), "success");
      } catch (error) {
        showToast(error, "error");
      }
    }
  };

  const isUserTheCreator = tournament.creator.id === userId;

  const isOfficialsSelected =
    matchInfo?.pointMaker != null && matchInfo?.timeKeeper != null;

  const OverlayUrl =
    window.location.host + routePaths.overlay + "/" + id + "/" + matchId;

  return (
    <main className="main-content">
      {isLoading && <Loader />}
      {isError && (
        <ErrorModal
          open={isError}
          onClose={() => {
            setIsError(false);
          }}
          errorMessage={t("messages.unexpected_error_happened")}
        />
      )}
      {!isLoading && !isError && (
        <>
          <Grid
            container
            justifyContent="space-between"
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%"
            }}
          >
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "flex-end",
                width: "100%",
                gap: "10px"
              }}
            >
              {matchInfo.firstNames.map((firstname, index) => (
                <React.Fragment key={index}>
                  <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                    {firstname}
                  </Typography>
                  {index < matchInfo.firstNames.length - 1 && (
                    <Typography sx={{ mx: 1 }}>-</Typography>
                  )}
                </React.Fragment>
              ))}
              <div className="overlay-button-container">
                <OverlayButton link={OverlayUrl} />
              </div>
            </Box>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "flex-end",
                width: "100%",
                gap: "20px"
              }}
            >
              {" "}
              <Typography>
                {t("tournament_view_labels.court_number")}
                {": "}
                {mapNumberToLetter(matchInfo.courtNumber)}
              </Typography>
              {matchInfo.scheduledTime !== "XX:XX" && (
                <Typography>{matchInfo.scheduledTime}</Typography>
              )}
              <Typography>
                {t("tournament_view_labels.duration")}
                {": "}
                {formatMillisecondsToMinutes(tournament.matchTime)} min
              </Typography>
            </Box>

            {!isOfficialsSelected && (
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "flex-end",
                  width: "100%",
                  gap: "20px",
                  marginTop: "10px"
                }}
              >
                <Typography sx={{ color: "red" }}>
                  {t("tournament_view_labels.official_missing")}
                </Typography>
              </Box>
            )}

            {userId !== null && userId !== undefined && (
              <Box sx={{ marginTop: "20px" }}>
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "flex-end",
                    width: "100%",
                    gap: "20px"
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" }, // Column on small screens, row on larger screens
                      gap: 2, // Space between elements
                      alignItems: "center",
                      justifyContent: "flex-start", // Adjust alignment
                      width: "100%"
                    }}
                  >
                    {/* Button shown until the match is started */}
                    {userId != null && matchInfo.startTimestamp == null && (
                      <Button
                        sx={{
                          fontSize: "13px",
                          whiteSpace: "nowrap",
                          padding: "6px 12px",
                          minWidth: "auto",
                          width: { xs: "100%", sm: "auto" } // Full width on small screens
                        }}
                        variant="contained"
                        onClick={() => {
                          setOpenRoles(true);
                        }}
                        disabled={
                          matchInfo.timeKeeper != null &&
                          matchInfo.pointMaker != null &&
                          matchInfo.timeKeeper !== userId &&
                          matchInfo.pointMaker !== userId
                        }
                      >
                        {t("game_interface.select_role")}
                      </Button>
                    )}

                    {isUserTheCreator && (
                      <Box sx={{ width: "100%" }}>
                        {matchInfo.endTimeStamp == null && (
                          <>
                            {/* Reset button: Only shown for the tournament creator before the match ends */}
                            {userId != null &&
                            matchInfo.startTimestamp != null ? (
                              <Button
                                sx={{
                                  fontSize: "13px",
                                  width: { xs: "100%", sm: "auto" } // Full width on small screens
                                }}
                                variant="contained"
                                onClick={async () => {
                                  await handleReset();
                                }}
                              >
                                {t("game_interface.reset")}
                              </Button>
                            ) : (
                              // Reset roles button: Only shown for the tournament creator before the match starts
                              <Button
                                sx={{
                                  fontSize: "13px",
                                  width: { xs: "100%", sm: "auto" } // Full width on small screens
                                }}
                                variant="contained"
                                onClick={async () => {
                                  await handleResetRoles();
                                }}
                                disabled={
                                  matchInfo.pointMaker == null ||
                                  matchInfo.timeKeeper == null
                                }
                              >
                                {t("game_interface.reset_roles")}
                              </Button>
                            )}
                          </>
                        )}
                      </Box>
                    )}
                  </Box>

                  <Dialog open={openRoles} onClose={handleCloseRoles}>
                    <DialogTitle>{t("game_interface.select_role")}</DialogTitle>
                    <DialogContent>
                      {/* checkbox is shown if there is no time keeper yet
                  or if user is the time keeper */}
                      {(matchInfo.timeKeeper === undefined ||
                        matchInfo.timeKeeper === userId) && (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={timeKeeper}
                              onChange={() => {
                                setTimeKeeper(!timeKeeper);
                              }}
                            />
                          }
                          label={t("game_interface.time_keeper")}
                        />
                      )}
                      {/* checkbox is shown if there is no point maker yet
                  or if user is the point maker */}
                      {(matchInfo.pointMaker === undefined ||
                        matchInfo.pointMaker === userId) && (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={pointMaker}
                              onChange={() => {
                                setPointMaker(!pointMaker);
                              }}
                            />
                          }
                          label={t("game_interface.point_maker")}
                        />
                      )}
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={handleCloseRoles}>
                        {t("buttons.cancel_button")}
                      </Button>
                      <Button onClick={handleRoleSave}>
                        {t("buttons.save_button")}
                      </Button>
                    </DialogActions>
                  </Dialog>
                </Box>
              </Box>
            )}

            {/* Show the timekeeper and pointmaker */}
            <Box sx={{ marginTop: "20px", width: "100%" }}>
              {/* print time keeper and point maker names */}
              <Typography variant="body2">
                {t("game_interface.time_keeper")}:{" "}
                <PlayerName
                  firstName={timeKeeperInfo?.firstName ?? ""}
                  lastName={timeKeeperInfo?.lastName ?? ""}
                  sameNames={haveSameNames}
                />
                <br />
                {t("game_interface.point_maker")}:{" "}
                <PlayerName
                  firstName={pointMakerInfo?.firstName ?? ""}
                  lastName={pointMakerInfo?.lastName ?? ""}
                  sameNames={haveSameNames}
                />
              </Typography>
            </Box>
          </Grid>
          <br />
          {/* Overtime text */}
          {matchInfo.isOvertime && (
            <Box display="flex" gap="20px" justifyContent="center">
              <Typography variant="body2">
                {t("game_interface.overtime")}
              </Typography>
            </Box>
          )}
          {/* Timer */}
          <Box
            display="flex"
            width="100%"
            flexDirection={"column"}
            gap="10px"
            alignItems="center"
          >
            <Timer timer={timer} />
            {/* timer button only shown to time keeper */}
            {userId !== null &&
              userId !== undefined &&
              showButtons() &&
              matchInfo.timeKeeper === userId && (
                <TimerButton
                  isTimerRunning={matchInfo.isTimerOn}
                  handleTimerChange={handleTimerChange}
                />
              )}
            {!isOfficialsSelected && (
              <Typography>
                {t("tournament_view_labels.select_officials")}
              </Typography>
            )}
          </Box>
          <br></br>
          {/* Print the winner */}
          <Box
            display="flex"
            width="100%"
            flexDirection={"column"}
            gap="10px"
            alignItems="center"
          >
            {matchInfo.winner !== undefined && (
              <div>
                <Typography sx={{ fontSize: "24px", fontWeight: "bold" }}>
                  {matchInfo.winner} {t("game_interface.wins")}
                </Typography>
              </div>
            )}
            {/* If there isn't a winner, check if there is an end timestamp (it's a tie) */}
            {matchInfo.winner === undefined &&
              (matchInfo.endTimeStamp !== undefined ||
                (matchInfo.elapsedTime >= matchInfo.time &&
                  matchInfo.type !== "playoff")) && (
                <div>
                  <Typography>{t("game_interface.tie")}</Typography>
                </div>
              )}
          </Box>
          <br></br>
          {/* point buttons only shown to point maker */}
          {userId !== null &&
            userId !== undefined &&
            showButtons() &&
            matchInfo.pointMaker === userId && (
              <OfficialButtons
                open={openPoints}
                selectedButton={selectedButton}
                handleRadioButtonClick={handleRadioButtonClick}
                handlePointShowing={handlePointShowing}
                handleOpen={handleOpen}
                handleClose={handleClose}
                gameStarted={matchInfo.startTimestamp !== undefined}
                player1name={matchInfo.firstNames[0]}
                player2name={matchInfo.firstNames[1]}
              />
            )}
          <br></br>
          <PointTable matchInfo={matchInfo} />
          <br></br>
          {userId !== null &&
            userId !== undefined &&
            matchInfo.pointMaker === userId && (
              <ModifyDeletePoints
                handleDeleteRecentPoint={handleDeleteRecentPoint}
                handleModifyRecentPoint={handleModifyRecentPoint}
                mostRecentPointType={mostRecentPointType}
              />
            )}
        </>
      )}
    </main>
  );
};

export default GameInterface;

export const buttonToTypeMap: Record<string, PointType> = {
  M: "men",
  K: "kote",
  D: "do",
  T: "tsuki",
  "\u0394": "hansoku"
};

export function formatMillisecondsToMinutes(ms: number): number {
  return ms / 60000; // 1 minute = 60,000 milliseconds
}
