import React, { useState, useEffect } from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  Box,
  Typography,
  Paper,
  TableContainer
} from "@mui/material";
import api from "api/axios";
import { useAuth } from "context/AuthContext";
import type { Match } from "types/models";
import { useTranslation } from "react-i18next";

const ProfilePoints: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const { userId } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchTournamentsAndMatches = async (): Promise<void> => {
      try {
        const tournamentsData = await api.tournaments.getAll();
        const userMatches: Match[] = [];
        tournamentsData.forEach((tournament) => {
          tournament.matchSchedule.forEach((match) => {
            if (match.players.some((player) => player.id === userId)) {
              userMatches.push(match);
            }
          });
        });
        setMatches(userMatches);
      } catch (error) {
        console.error("Error fetching tournaments and matches:", error);
      }
    };

    void fetchTournamentsAndMatches();
  }, [userId]);

  let menPoints = 0;
  let kotePoints = 0;
  let doPoints = 0;
  let tsukiPoints = 0;
  let hansokuPoints = 0;

  matches.forEach((match) => {
    match.players.forEach((player) => {
      if (player.id === userId) {
        player.points.forEach((point) => {
          switch (point.type) {
            case "men":
              menPoints++;
              break;
            case "kote":
              kotePoints++;
              break;
            case "do":
              doPoints++;
              break;
            case "tsuki":
              tsukiPoints++;
              break;
            case "hansoku":
              hansokuPoints++;
              break;
            default:
              break;
          }
        });
      }
    });
  });

  return (
    <Box style={{ marginTop: "20px", width: "100%" }}>
      <Typography variant="h6" gutterBottom>
        {t("profile.my_points")}
      </Typography>
      <TableContainer
        component={Paper}
        style={{ width: "100%", margin: "0 auto" }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                style={{
                  fontWeight: "bold",
                  color: "#fff",
                  backgroundColor: "#DB4744"
                }}
              >
                {t("profile.point_type")}
              </TableCell>
              <TableCell
                style={{
                  fontWeight: "bold",
                  color: "#fff",
                  backgroundColor: "#DB4744"
                }}
              >
                {t("profile.points")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell style={{ fontWeight: "bold" }}>Men</TableCell>
              <TableCell>{menPoints}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell style={{ fontWeight: "bold" }}>Kote</TableCell>
              <TableCell>{kotePoints}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell style={{ fontWeight: "bold" }}>Do</TableCell>
              <TableCell>{doPoints}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell style={{ fontWeight: "bold" }}>Tsuki</TableCell>
              <TableCell>{tsukiPoints}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell style={{ fontWeight: "bold" }}>Hansoku</TableCell>
              <TableCell>{hansokuPoints}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ProfilePoints;
