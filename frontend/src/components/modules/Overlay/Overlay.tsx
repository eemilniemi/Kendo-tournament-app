import React, { useEffect, useState } from "react";
import "./Overlay.css";
import { useSocket } from "context/SocketContext";
import { joinMatch, leaveMatch } from "../../../sockets/emit";
import { useParams } from "react-router-dom";
import type {
  Match,
  MatchPlayer,
  MatchTime,
  MatchType,
  Tournament
} from "../../../types/models";
import api from "../../../api/axios";
import OverlayTimer from "./OverlayTimer";
import { useTournament } from "../../../context/TournamentContext";

interface OverlayData {
  timerTime: number;
  players: MatchPlayer[];
  player1Name: string;
  player2Name: string;
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

// Get players' names
const findPlayerName = (playerId: string, tournament: Tournament): string => {
  const player = tournament.players.find((p) => p.id === playerId);
  if (player !== undefined) {
    return player.firstName + " " + player.lastName;
  }
  return "";
};

function getOverlayData(matchData: Match, tournament: Tournament): OverlayData {
  let startTime: Date | undefined;

  if (matchData.startTimestamp !== undefined) {
    startTime = matchData.startTimestamp;
  }

  // Get time
  // Backend only updates elapsedTime when match is stopped
  // so the real time must be calculated.
  const matchElapsedTime: number = calculateElapsedTime(
    matchData.elapsedTime,
    matchData.timerStartedTimestamp,
    matchData.matchTime,
    matchData.isOvertime
  );

  const timerTime = Math.floor(matchElapsedTime / 1000);

  const player1Name = findPlayerName(matchData.players[0].id, tournament);
  const player2Name = findPlayerName(matchData.players[1].id, tournament);

  return {
    courtNumber: matchData.courtNumber,
    elapsedTime: matchElapsedTime,
    endTimeStamp: undefined,
    isOvertime: matchData.isOvertime,
    isTimerOn: matchData.isTimerOn,
    player1Name,
    player2Name,
    players: matchData.players,
    startTimestamp: startTime,
    time: matchData.matchTime,
    timerTime,
    type: matchData.type,
    winner: undefined
  };
}

const Overlay: React.FC = () => {
  const tournament = useTournament();
  const { matchId } = useParams();
  const { matchInfo: matchInfoFromSocket } = useSocket();
  const [hasJoined, setHasJoined] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [matchInfo, setMatchInfo] = useState<OverlayData>({
    timerTime: 0,
    players: [],
    player1Name: "",
    player2Name: "",
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
        // Try to get match info from the websocket
        if (matchInfoFromSocket !== undefined) {
          const matchInfo = getOverlayData(matchInfoFromSocket, tournament);
          setMatchInfo(matchInfo);
        }
        // If websocket doesn't have match info, use api
        // Usually this is the first time the match view is loaded
        else if (matchId !== undefined) {
          const matchFromApi: Match = await api.match.info(matchId);
          if (matchFromApi !== undefined) {
            const matchInfo = getOverlayData(matchFromApi, tournament);
            setMatchInfo(matchInfo);
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    void getMatchData();
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

  let p1points = 0;
  let p2points = 0;

  try {
    p1points = matchInfo.players[0].points.length;
    p2points = matchInfo.players[1].points.length;
  } catch (_) {}

  return (
    <div className="overlay-container">
      <div className="overlay-teams">
        <div className="team team-a">
          <div className="team-name">{matchInfo.player1Name}</div>
          <div className="team-score">{p1points}</div>
        </div>

        <div className="overlay-status">
          <OverlayTimer timer={timer} />
        </div>

        <div className="team team-b">
          <div className="team-name">{matchInfo.player2Name}</div>
          <div className="team-score">{p2points}</div>
        </div>
      </div>
    </div>
  );
};

export default Overlay;
