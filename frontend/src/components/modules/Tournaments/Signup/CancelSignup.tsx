import React, { type ReactElement } from "react";
import { useNavigate } from "react-router-dom";

import useToast from "hooks/useToast";
import api from "api/axios";
import { useAuth } from "context/AuthContext";
import { useTournament } from "context/TournamentContext";
import { useTranslation } from "react-i18next";

import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import routePaths from "routes/route-paths";

const CancelSignup: React.FC = (): ReactElement => {
  const { userId } = useAuth();
  const showToast = useToast();
  const tournament = useTournament();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (): Promise<void> => {
    try {
      if (userId !== undefined) {
        await api.tournaments.cancelSignup(tournament.id, userId);
        showToast(
          `${t("messages.cancel_success")}${tournament.name}`,
          "success"
        );
        navigate(routePaths.homeRoute, {
          replace: true,
          state: { refresh: true }
        });
      }
    } catch (error) {
      showToast(error, "error");
    }
  };

  return (
    <Container
      component="main"
      sx={{ display: "flex", flexDirection: "column", gap: "24px" }}
    >
      <Box className="sign-up-header">
        <Typography
          variant="h5"
          className="header"
          fontWeight="bold"
          marginBottom="12px"
        >
          {t("signup_labels.cancel")} {tournament.name}
        </Typography>

        <Typography variant="body1" className="dates">
          {new Date(tournament.startDate).toLocaleString("fi")} -{" "}
          {new Date(tournament.endDate).toLocaleString("fi")}
        </Typography>
      </Box>

      <Box display="flex">
        <Button
          variant="contained"
          color="primary"
          id="btnCancelSignup"
          onClick={async () => {
            await handleSubmit();
          }}
          disabled={userId === undefined}
        >
          {t("buttons.cancel_sign_up")}
        </Button>
      </Box>
    </Container>
  );
};

export default CancelSignup;
