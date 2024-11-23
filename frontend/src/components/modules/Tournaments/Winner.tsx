import React from "react";
import { Box, Typography } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { keyframes } from "@mui/system";
import { useTranslation } from "react-i18next";
import { type Tournament } from "types/models";
import { findTournamentWinner, allMatchesPlayed } from "utils/TournamentUtils";

interface TournamentWinnerProps {
  tournament: Tournament;
}

const TournamentWinner: React.FC<TournamentWinnerProps> = ({ tournament }) => {
  const { t } = useTranslation();

  const flash = keyframes`
    0% { transform: scale(1); }
    100% { transform: scale(1.05); }
  `;

  if (!allMatchesPlayed(tournament)) {
    return null; // Do not render if not all matches are played
  }

  const winner = findTournamentWinner(tournament);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        width: "100%"
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#db4744",
          width: "90%",
          padding: "10px 20px",
          borderRadius: "10px",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
          color: "white",
          margin: "15px 0",
          animation: `${flash} 1.5s infinite alternate`
        }}
      >
        <EmojiEventsIcon
          sx={{ fontSize: "2rem", marginRight: "8px", color: "#FFD700" }}
        />
        <Typography
          variant="h5"
          sx={{ fontWeight: "bold", fontSize: "1.25rem" }}
        >
          {t("frontpage_labels.winner")}
          {": "}
          <span
            style={{
              color: "#FFD700",
              fontSize: "1.5rem",
              fontWeight: "bold"
            }}
          >
            {winner}
          </span>
        </Typography>
      </Box>
    </Box>
  );
};

export default TournamentWinner;
