import React, { useEffect, useState } from "react";
import "./Overlay.css";
import { useSocket } from "context/SocketContext";
import { joinMatch, leaveMatch } from "../../../sockets/emit";
import { useParams } from "react-router-dom";
import type {
  Match,
  MatchPlayer,
  MatchTime,
  MatchType
} from "../../../types/models";
import api from "../../../api/axios";
import OverlayTimer from "./OverlayTimer";

interface OverlayData {
  timerTime: number;
  players: MatchPlayer[];
  firstNames: string[];
  lastNames: string[];
  winner: string | undefined;
  endTimeStamp: Date | undefined;
  startTimestamp: Date | undefined;
  isTimerOn: boolean;
  elapsedTime: number;
  isOvertime: boolean;
  type: MatchType;
  time: MatchTime;
  courtNumber: number;
}

const Overlay: React.FC = () => {
  // const tournament = useTournament();
  const { matchId } = useParams();
  const { matchInfo: matchInfoFromSocket } = useSocket();
  const [hasJoined, setHasJoined] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [matchInfo, setMatchInfo] = useState<OverlayData>({
    timerTime: 0,
    players: [],
    firstNames: [],
    lastNames: [],
    winner: undefined,
    endTimeStamp: undefined,
    startTimestamp: undefined,
    isTimerOn: false,
    elapsedTime: 0,
    isOvertime: false,
    type: "group",
    time: 300000,
    courtNumber: 1
  });

  const [timer, setTimer] = useState<number>(matchInfo.timerTime);

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
    const getMatchData = async (): Promise<void> => {
      try {
        let matchPlayers: MatchPlayer[] = [];
        const playersFirstNames: string[] = [];
        const playersLastNames: string[] = [];
        let matchWinner: string | undefined;
        let time: number = 0;
        let matchEndTimeStamp: Date | undefined;
        let startTime: Date | undefined;
        let timer: boolean = false;
        let matchElapsedTime: number = 0;
        let matchIsOvertime: boolean = false;
        let matchType: MatchType = "group";
        let matchTime: MatchTime = 300000;
        let court: number = 1;

        // Get players' names
        /*
        const findPlayerName = (playerId: string, index: number): void => {
          const player = tournament.players.find((p) => p.id === playerId);
          if (player !== undefined) {
            playersFirstNames[index] = player.firstName;
            playersLastNames[index] = player.lastName;
          }
        };

         */

        // Try to get match info from the websocket
        if (matchInfoFromSocket !== undefined) {
          matchTime = matchInfoFromSocket.matchTime;

          // Get players' names in this match
          matchPlayers = matchInfoFromSocket.players;
          // findPlayerName(matchPlayers[0].id, 0);
          // findPlayerName(matchPlayers[1].id, 1);

          // If there is a winner, save them
          /*
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

          if (matchInfoFromSocket.startTimestamp !== undefined) {
            startTime = matchInfoFromSocket.startTimestamp;
          }

           */

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
        }
        // If websocket doesn't have match info, use api
        // Usually this is the first time the match view is loaded
        else if (matchId !== undefined) {
          const matchFromApi: Match = await api.match.info(matchId);

          if (matchFromApi !== undefined) {
            matchTime = matchFromApi.matchTime;

            matchPlayers = matchFromApi.players;
            // findPlayerName(matchPlayers[0].id, 0);
            // findPlayerName(matchPlayers[1].id, 1);

            // If there is a winner, save them
            /*
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

             */
            if (matchFromApi.startTimestamp !== undefined) {
              startTime = matchFromApi.startTimestamp;
            }
            matchIsOvertime = matchFromApi.isOvertime;
            matchType = matchFromApi.type;

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
          }
        }
        setMatchInfo({
          timerTime: time,
          players: matchPlayers,
          firstNames: playersFirstNames,
          lastNames: playersLastNames,
          winner: matchWinner,
          endTimeStamp: matchEndTimeStamp,
          startTimestamp: startTime,
          isTimerOn: timer,
          elapsedTime: matchElapsedTime,
          isOvertime: matchIsOvertime,
          type: matchType,
          time: matchTime,
          courtNumber: court
        });
        console.log("players");
        console.log(matchPlayers.length);
        console.log(matchPlayers[1].points);
        console.log(matchInfo.players.length);
        console.log(matchInfo.players[1].points);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    void getMatchData();
    console.log("players12");
    console.log(matchInfo.players.length);
    matchInfo.players.forEach((a) => {
      console.log(a);
    });
    // console.log(matchInfo.players[1].points);
  }, [isLoading, matchInfoFromSocket]);

  useEffect(() => {
    setTimer(matchInfo.timerTime);
  }, [matchInfo.elapsedTime, matchInfo.timerTime]);

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

  const calculateElapsedTime = (
    elapsedTime: number,
    timerStart: Date | null,
    matchTime: number,
    isOvertime: boolean
  ): number => {
    if (timerStart !== null) {
      const currentTime = new Date();
      const startTimestamp = new Date(timerStart);

      const elapsedMilliseconds =
        currentTime.getTime() - startTimestamp.getTime();
      elapsedTime += elapsedMilliseconds;

      if (elapsedTime > matchTime && !isOvertime) {
        elapsedTime = matchTime;
      }
      return elapsedTime;
    } else {
      return elapsedTime;
    }
  };

  return (
    <div className="overlay-container">
      <div className="overlay-teams">
        <div className="team team-a">
          <div className="team-name">{"player1"}</div>
          <div className="team-score">{1}</div>
        </div>

        <div className="overlay-status">
          <OverlayTimer timer={timer} />
        </div>

        <div className="team team-b">
          <div className="team-name">{"player2"}</div>
          <div className="team-score">{1}</div>
        </div>
      </div>
    </div>
  );
};

export default Overlay;
