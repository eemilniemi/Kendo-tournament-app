import React from "react";
import type { MatchPoint, PointType } from "../../../types/models";
import "./OverlayPointDisplay.css";

const pointMap = new Map<PointType, string>([
  ["men", "M"],
  ["kote", "K"],
  ["do", "D"],
  ["tsuki", "T"],
  ["hansoku", "Δ"]
]);

/* TODO: handle hansokus properly:
    - display hansokus separately from points
    - convert 2 hansokus into a point for the opponent ?
    - needs to be implemented to main match page as well
*/

const OverlayPointDisplay: React.FC<{
  points: MatchPoint[];
  firstPointTimestamp: Date | undefined;
}> = ({ points, firstPointTimestamp }) => {
  return (
    <div className="team-score">
      {points.map(function (point, index) {
        const isFirst = point.timestamp === firstPointTimestamp;
        const cl = isFirst ? "point first-point" : "point";
        return (
          <div key={index} className={cl}>
            {pointMap.get(point.type)}
          </div>
        );
      })}
    </div>
  );
};

export default OverlayPointDisplay;
