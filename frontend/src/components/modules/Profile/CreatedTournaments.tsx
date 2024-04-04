import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Box
} from "@mui/material";
import { useAuth } from "context/AuthContext";
import api from "api/axios";
import type { Tournament } from "types/models";

const CreatedTournaments: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useAuth();

  // State for storing the user's created tournaments
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    const fetchTournaments = async (): Promise<void> => {
      try {
        const tournamentsData = await api.tournaments.getAll();
        // Filter tournaments to include only those created by the current user
        const filteredTournaments = tournamentsData.filter(
          (tournament) => tournament.creator.id === userId
        );
        // Sort tournaments based on startDate
        filteredTournaments.sort(
          (a, b) =>
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        );
        // Update state with filtered and sorted tournaments
        setTournaments(filteredTournaments);
      } catch (error) {
        // Error handling can be added here if necessary
      }
    };

    void fetchTournaments();
  }, [userId]);

  return (
    <Box>
      {tournaments.map((tournament, index) => (
        <Card key={index} style={{ marginBottom: "20px" }}>
          <CardActionArea
            onClick={() => {
              navigate(`/tournaments/participants/${tournament.id}`);
              console.log("Painoit turnauksen painiketta:", tournament.name);
              console.log("id:", tournament.id);
            }}
          >
            <CardContent>
              {/* Display tournament name and start/end dates */}
              <Typography variant="h5" sx={{ marginBottom: 4, marginTop: 4 }}>
                {tournament.name}
                <Typography
                  component="span"
                  variant="subtitle1"
                  sx={{ display: "inline", marginLeft: 1 }}
                >
                  {new Date(tournament.startDate).toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                  })}
                  {new Date(tournament.startDate).toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                  }) !==
                    new Date(tournament.endDate).toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric"
                    }) &&
                    ` - ${new Date(tournament.endDate).toLocaleDateString(
                      "en-US",
                      {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric"
                      }
                    )}`}
                </Typography>
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      ))}
    </Box>
  );
};

export default CreatedTournaments;
