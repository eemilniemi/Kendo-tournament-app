import React, { useEffect, useState } from "react";
import "./Overlay.css";
import { useSocket } from "context/SocketContext";
import { joinMatch, leaveMatch } from "../../../sockets/emit";
import { useParams } from "react-router-dom";
import type {
  Match,
  MatchPoint,
  MatchTime,
  MatchType,
  Tournament
} from "../../../types/models";
import api from "../../../api/axios";
import OverlayTimer from "./OverlayTimer";
import { useTournament } from "../../../context/TournamentContext";
import {
  calculateElapsedTime,
  findPlayerDanRank,
  findPlayerName,
  findPlayerNationality
} from "../../../utils/matchUtils";
import OverlayPointDisplay from "./OverlayPointDisplay";

interface OverlayPlayer {
  firstName: string;
  lastName: string;
  points: MatchPoint[];
  nationality: string | null;
  danRank: string | null;
}

interface OverlayData {
  timerTime: number;
  redPlayer: OverlayPlayer;
  whitePlayer: OverlayPlayer;
  winner: string | undefined; // not used currently
  endTimeStamp: Date | undefined;
  startTimestamp: Date | undefined;
  isTimerOn: boolean;
  elapsedTime: number;
  isOvertime: boolean;
  type: MatchType; // not used currently
  time: MatchTime;
}

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

  const redMatchPlayer = matchData.players.find((p) => p.color === "red");
  const whiteMatchPlayer = matchData.players.find((p) => p.color === "white");

  if (redMatchPlayer === undefined) {
    throw new Error("Red player not defined");
  }

  if (whiteMatchPlayer === undefined) {
    throw new Error("White player not defined");
  }

  const redPlayer: OverlayPlayer = {
    ...findPlayerName(redMatchPlayer.id, tournament),
    points: redMatchPlayer.points,
    nationality: findPlayerNationality(redMatchPlayer.id, tournament),
    danRank: findPlayerDanRank(redMatchPlayer.id, tournament)
  };

  const whitePlayer: OverlayPlayer = {
    ...findPlayerName(whiteMatchPlayer.id, tournament),
    points: whiteMatchPlayer.points,
    nationality: findPlayerNationality(whiteMatchPlayer.id, tournament),
    danRank: findPlayerDanRank(whiteMatchPlayer.id, tournament)
  };

  return {
    redPlayer,
    whitePlayer,
    elapsedTime: matchElapsedTime,
    endTimeStamp: undefined,
    isOvertime: matchData.isOvertime,
    isTimerOn: matchData.isTimerOn,
    startTimestamp: startTime,
    time: matchData.matchTime,
    timerTime,
    type: matchData.type,
    winner: undefined
  };
}

const templatePlayer: OverlayPlayer = {
  firstName: "",
  lastName: "",
  points: [],
  nationality: null,
  danRank: null
};

const Overlay: React.FC = () => {
  const tournament = useTournament();
  const { matchId } = useParams();
  const { matchInfo: matchInfoFromSocket } = useSocket();
  const [hasJoined, setHasJoined] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [matchInfo, setMatchInfo] = useState<OverlayData>({
    timerTime: 0,
    redPlayer: templatePlayer,
    whitePlayer: templatePlayer,
    winner: undefined,
    endTimeStamp: undefined,
    startTimestamp: undefined,
    isTimerOn: false,
    elapsedTime: 0,
    isOvertime: false,
    type: "group",
    time: 300000
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

  const redDisplayName =
    matchInfo.redPlayer.firstName.charAt(0) +
    ". " +
    matchInfo.redPlayer.lastName;

  const whiteDisplayName =
    matchInfo.whitePlayer.firstName.charAt(0) +
    ". " +
    matchInfo.whitePlayer.lastName;

  let firstPointTimestamp: Date | undefined;
  const points: MatchPoint[] = matchInfo.redPlayer.points.concat(
    matchInfo.whitePlayer.points
  );

  if (points.length > 0) {
    firstPointTimestamp = points[0].timestamp;

    for (const point of points) {
      if (point.timestamp < firstPointTimestamp) {
        firstPointTimestamp = point.timestamp;
      }
    }
  }

  return (
    <div className="overlay-container">
      <div className="overlay-teams">
        <div className="team team-white">
          <div className="team-info">
            <div className="team-name">{whiteDisplayName}</div>
          </div>
        </div>

        <OverlayPointDisplay
          points={matchInfo.whitePlayer.points}
          firstPointTimestamp={firstPointTimestamp}
        />
        <div className="vertical-line" />

        <div className="overlay-status">
          <OverlayTimer timer={timer} />
        </div>

        <div className="vertical-line" />
        <OverlayPointDisplay
          points={matchInfo.redPlayer.points}
          firstPointTimestamp={firstPointTimestamp}
        />

        <div className="team team-red">
          <div className="team-info">
            <div className="team-name">{redDisplayName}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overlay;
