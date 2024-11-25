import React, { useEffect, useState } from "react";
import "./Overlay.css";
import { useSocket } from "context/SocketContext";
import { joinMatch, leaveMatch } from "../../../sockets/emit";
import { useParams } from "react-router-dom";
import type {
  Match,
  MatchPlayer,
  MatchPoint,
  MatchTime,
  MatchType,
  PointType,
  Tournament
} from "../../../types/models";
import api from "../../../api/axios";
import OverlayTimer from "./OverlayTimer";
import { useTournament } from "../../../context/TournamentContext";
import OverlayButton from "./OverlayButton";
import routePaths from "../../../routes/route-paths";

// TODO: simplify
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

const pointMap = new Map<PointType, string>([
  ["men", "M"],
  ["kote", "M"],
  ["do", "D"],
  ["tsuki", "T"],
  ["hansoku", "Δ"]
]);

const Overlay: React.FC = () => {
  const tournament = useTournament();
  const { id, matchId } = useParams(); // TODO: remove "id"
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

  // TODO: do I need states for this stuff? seems to work without?

  let p1points: MatchPoint[] = [];
  let p2points: MatchPoint[] = [];

  let p1DisplayName: string = "";
  let p2DisplayName: string = "";

  // TODO: fix
  try {
    p1points = matchInfo.players[0].points;
    p2points = matchInfo.players[1].points;
  } catch (_) {}

  try {
    const p1names = matchInfo.player1Name.split(" ");
    p1DisplayName = p1names[0].charAt(0) + ". " + p1names[1];

    const p2names = matchInfo.player2Name.split(" ");
    p2DisplayName = p2names[0].charAt(0) + ". " + p2names[1];
  } catch (_) {}

  let firstPointTimestamp: Date | undefined;
  const points: MatchPoint[] = p1points.concat(p2points);

  if (points.length > 0) {
    firstPointTimestamp = points[0].timestamp;

    for (const point of points) {
      if (point.timestamp < firstPointTimestamp) {
        firstPointTimestamp = point.timestamp;
      }
    }
  }

  const url =
    window.location.host + routePaths.overlay + "/" + id + "/" + matchId;

  return (
    <div className="overlay-container">
      <OverlayButton link={url} />
      <div className="overlay-teams">
        <div className="team team-white">
          <div className="team-info">
            <div className="team-name">{p1DisplayName}</div>
          </div>
        </div>

        <div className="team-score">
          {p1points.map(function (point, index) {
            const isFirst = point.timestamp === firstPointTimestamp;
            const cl = isFirst ? "point" : "point first-point";
            return (
              <div key={index} className={cl}>
                {pointMap.get(point.type)}
              </div>
            );
          })}
        </div>
        <div className="vertical-line" />

        <div className="overlay-status">
          <OverlayTimer timer={timer} />
        </div>

        <div className="vertical-line" />
        <div className="team-score">
          {p2points.map(function (point, index) {
            const isFirst = point.timestamp === firstPointTimestamp;
            const cl = isFirst ? "point first-point" : "point";
            return (
              <div key={index} className={cl}>
                {pointMap.get(point.type)}
              </div>
            );
          })}
        </div>

        <div className="team team-red">
          <div className="team-info">
            <div className="team-name">{p2DisplayName}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overlay;
