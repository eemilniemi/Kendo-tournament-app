import React, { useState, useEffect } from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  Box
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

  // Variables to store points for different types
  let menPoints = 0;
  let kotePoints = 0;
  let doPoints = 0;
  let tsukiPoints = 0;
  let hansokuPoints = 0;

  // Calculate points for each type based on user's matches
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
    <Box style={{ marginTop: "20px" }}>
      <Table style={{ width: "60%", margin: "0 auto" }}>
        <TableHead>
          <TableRow>
            <TableCell>{t("profile.point_type")}</TableCell>
            <TableCell>{t("profile.points")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Men</TableCell>
            <TableCell>{menPoints}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Kote</TableCell>
            <TableCell>{kotePoints}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Do</TableCell>
            <TableCell>{doPoints}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Tsuki</TableCell>
            <TableCell>{tsukiPoints}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Hansoku</TableCell>
            <TableCell>{hansokuPoints}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Box>
  );
};

export default ProfilePoints;
