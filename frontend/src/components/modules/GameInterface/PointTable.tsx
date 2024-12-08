import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import type { PointType } from "types/models";
import { type MatchData } from "./GameInterface";
import PlayerName from "../Tournaments/PlayerNames"; // Ensure correct path for PlayerName

interface TableComponentProps {
  matchInfo: MatchData;
}

interface Point {
  color: string;
  value: string;
}

const PointTable: React.FC<TableComponentProps> = ({ matchInfo }) => {
  const [whitePoints, setWhitePoints] = useState<Point[]>([]);
  const [redPoints, setRedPoints] = useState<Point[]>([]);

  const typeToButtonMap: Record<PointType, string> = {
    men: "M",
    kote: "K",
    do: "D",
    tsuki: "T",
    hansoku: "\u0394"
  };

  useEffect(() => {
    const white: Point[] = [];
    const red: Point[] = [];

    matchInfo.players.forEach((player) => {
      player.points.forEach((point) => {
        const value = typeToButtonMap[point.type];
        const pointData = { color: player.color, value };

        if (player.color === "white") {
          white.push(pointData);
        } else if (player.color === "red") {
          red.push(pointData);
        }
      });
    });

    setWhitePoints(white);
    setRedPoints(red);
  }, [matchInfo]);

  const haveSameNames = matchInfo.firstNames.some((name, i) => {
    return matchInfo.firstNames.indexOf(name) !== i;
  });

  const calculateScore = (points: Point[]): number => {
    const validPoints = points.filter((p) => p.value !== "\u0394");
    return validPoints.length;
  };

  const whiteScore = calculateScore(whitePoints);
  const redScore = calculateScore(redPoints);

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px"
      }}
    >
      {/* Players and Points */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" }, // Stack on smaller screens
          justifyContent: "space-between",
          alignItems: "flex-start",
          width: "100%",
          maxWidth: "600px",
          gap: { xs: "10px", sm: "0" } // Add gap for stacked layout
        }}
      >
        {/* White Player */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%", // Full width for mobile
            border: "1px solid black",
            color: "#000"
          }}
        >
          {/* Player Info */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              width: "100%",
              gap: "20px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              borderBottom: "1px solid black",
              padding: "10px"
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontSize: "24px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                color: "black"
              }}
            >
              {whiteScore}
            </Typography>
            <Box
              sx={{
                width: "20px",
                height: "20px",
                borderRadius: "4px",
                backgroundColor: "#ffffff",
                border: "1px solid black"
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontSize: "24px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                color: "black"
              }}
            >
              <PlayerName
                firstName={matchInfo.firstNames[0]}
                lastName={matchInfo.lastNames[0]}
                sameNames={haveSameNames}
              />
            </Typography>
          </Box>

          {/* Player Points */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "flex-start", // Normal layout
              alignItems: "center",
              gap: "10px",
              width: "100%",
              padding: "10px",
              minHeight: "60px"
            }}
          >
            {whitePoints.map((point, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  border: "1px solid black",
                  backgroundColor: "#ffffff",
                  color: "#000"
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  {point.value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Red Player */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%", // Full width for mobile
            border: "1px solid black",
            color: "#fff"
          }}
        >
          {/* Player Info */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start", // Normal layout
              width: "100%",
              gap: "20px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              borderBottom: "1px solid black",
              padding: "10px"
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontSize: "24px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                color: "black"
              }}
            >
              {redScore}
            </Typography>
            <Box
              sx={{
                width: "20px",
                height: "20px",
                borderRadius: "4px",
                backgroundColor: "#D01C1C",
                border: "1px solid black"
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontSize: "24px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                color: "black"
              }}
            >
              <PlayerName
                firstName={matchInfo.firstNames[1]}
                lastName={matchInfo.lastNames[1]}
                sameNames={haveSameNames}
              />
            </Typography>
          </Box>

          {/* Player Points */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "flex-start",
              alignItems: "center",
              gap: "10px",
              width: "100%",
              minHeight: "60px",
              padding: "10px"
            }}
          >
            {redPoints.map((point, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  border: "1px solid black",
                  backgroundColor: "#fff",
                  color: "black"
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  {point.value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PointTable;
