import React, { useState } from "react";
import type { Tournament } from "types/models";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import CardActionArea from "@mui/material/CardActionArea";
import CardHeader from "@mui/material/CardHeader";
import Typography from "@mui/material/Typography";
import CardContent from "@mui/material/CardContent";
import Card from "@mui/material/Card";
import { useAuth } from "context/AuthContext";
import { useTranslation } from "react-i18next";
import api from "api/axios";
import useToast from "hooks/useToast";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Box
} from "@mui/material";
import TodayIcon from "@mui/icons-material/Today";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { allMatchesPlayed, findTournamentWinner } from "utils/TournamentUtils";

interface TournamentCardProps {
  tournament: Tournament;
  type: string;
  mobile: boolean;
}

const TournamentCard: React.FC<TournamentCardProps> = ({
  tournament,
  type,
  mobile
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const showToast = useToast();
  const { userId } = useAuth();
  const userAlreadySigned = tournament.players.some(
    (player) => player.id === userId
  );
  const tournamentFull = tournament.maxPlayers <= tournament.players.length;
  const isUserTheCreator = tournament.creator.id === userId;
  const tournamentHasNotStarted = new Date() < new Date(tournament.startDate);
  const [openDialog, setOpenDialog] = useState(false);

  const finished = allMatchesPlayed(tournament);

  let teamMismatch = false;
  if (
    tournament.type === "Team Round Robin" &&
    tournament.teams !== null &&
    tournament.teams !== undefined
  ) {
    const playerCounts = tournament.teams.map((team) => team.players.length);
    teamMismatch = !playerCounts.every((count) => count === playerCounts[0]);
  }
  // Check if the tournament has fewer than 2 players after it started
  const cancelled =
    !tournamentHasNotStarted &&
    (tournament.players.length < 2 ||
      (tournament.type === "Team Round Robin" && teamMismatch));

  const handleOpenDialog = (): void => {
    setOpenDialog(true);
  };

  const handleCloseDialog = (): void => {
    setOpenDialog(false);
  };

  const apiDeleteTournamentRequest = async (): Promise<void> => {
    handleCloseDialog();
    try {
      await api.tournaments.delete(tournament.id);
      navigate(0);
    } catch (error) {
      showToast(error, "error");
    }
  };

  const deleteConfirmationDialog = (): JSX.Element => (
    <Dialog
      open={openDialog}
      onClose={handleCloseDialog}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {t("titles.confirm_tournament_deletion")}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {t("upcoming_tournament_view.delete_tournament")}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog} variant="contained" color="error">
          {t("buttons.cancel_button")}
        </Button>
        <Button
          color="success"
          variant="contained"
          onClick={apiDeleteTournamentRequest}
          autoFocus
        >
          {t("buttons.confirm_button")}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Card
      component="main"
      sx={{
        position: "relative",
        borderRadius: 5,
        maxWidth: 500
      }}
    >
      <CardActionArea
        onClick={() => {
          if (type === "past") {
            navigate(`past-tournament/${tournament.id}`);
          } else {
            navigate(tournament.id);
          }
        }}
        sx={{ margin: 1, marginBottom: 3 }}
      >
        <CardHeader
          title={tournament.name}
          titleTypographyProps={{ fontWeight: "500" }}
          sx={{ margin: 1, marginBottom: 0, paddingBottom: 0 }}
        />
        <CardContent sx={{ margin: 1, paddingTop: 0 }}>
          {tournamentFull && type === "upcoming" && (
            <Typography
              variant="subtitle1"
              marginBottom="32px"
              sx={{ margin: 1, paddingTop: 0 }}
            ></Typography>
          )}
          {cancelled ? (
            <Typography color="red">
              <strong>{t("frontpage_labels.cancelled")}</strong>
            </Typography>
          ) : (
            finished && (
              <Typography color="text.secondary">
                <strong>
                  {t("frontpage_labels.winner")}:{" "}
                  {findTournamentWinner(tournament)}
                </strong>
              </Typography>
            )
          )}
          {(type === "ongoing" || type === "upcoming") && (
            <Box
              sx={{ display: "flex", alignItems: "center", marginBottom: 1 }}
            >
              <TodayIcon sx={{ marginRight: 1 }} />
              <Typography color="text.secondary">
                {tournament.location}
              </Typography>
            </Box>
          )}
          {(type === "ongoing" || type === "upcoming") && (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <LocationOnIcon sx={{ marginRight: 1 }} />
              <Typography color="text.secondary">
                {new Date(tournament.startDate).toLocaleString("fi", {
                  day: "2-digit",
                  month: "2-digit"
                })}{" "}
                -{" "}
                {new Date(tournament.endDate).toLocaleString("fi", {
                  month: "2-digit",
                  day: "2-digit"
                })}
              </Typography>
            </Box>
          )}
          {type === "past" && (
            <>
              <Typography color="text.secondary">
                {tournament.location},
              </Typography>
              <Typography color="text.secondary">
                {` 
          ${new Date(tournament.startDate).toLocaleString("fi", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
          })} -
          ${new Date(tournament.endDate).toLocaleString("fi", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
          })}`}
              </Typography>
            </>
          )}
        </CardContent>
      </CardActionArea>
      {type === "upcoming" && (
        <CardContent sx={{ paddingTop: 0 }}>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              justifyContent: "center",
              marginTop: 2
            }}
          >
            {/* Render the cancel sign-up or sign-up button */}
            {tournamentHasNotStarted && userId !== undefined && (
              <>
                {userAlreadySigned ? (
                  <Button
                    color="secondary"
                    variant="contained"
                    onClick={() => {
                      navigate(`${tournament.id}/cancel-sign-up`);
                    }}
                    sx={{
                      minWidth: "90px",
                      padding: "5px 15px",
                      borderRadius: "15px"
                    }}
                  >
                    {t("buttons.cancel_sign_up")}
                  </Button>
                ) : (
                  <Button
                    color="success"
                    variant="contained"
                    disabled={tournamentFull}
                    onClick={() => {
                      navigate(`${tournament.id}/sign-up`);
                    }}
                    sx={{
                      minWidth: "90px",
                      padding: "5px 15px",
                      borderRadius: "15px"
                    }}
                  >
                    {t("buttons.sign_up_button")}
                  </Button>
                )}
              </>
            )}

            {/* Render the creator buttons */}
            {isUserTheCreator && tournamentHasNotStarted && (
              <>
                <Button
                  color="error"
                  variant="contained"
                  onClick={handleOpenDialog}
                  sx={{
                    minWidth: "90px",
                    padding: "5px 15px",
                    borderRadius: "15px"
                  }}
                >
                  {t("buttons.delete")}
                </Button>
                <Button
                  color="error"
                  variant="outlined"
                  onClick={() => {
                    navigate(`edit-tournament-info/${tournament.id}`);
                  }}
                  sx={{
                    minWidth: "90px",
                    padding: "5px 15px",
                    borderRadius: "15px"
                  }}
                >
                  {t("buttons.edit_button")}
                </Button>
              </>
            )}
          </Box>
        </CardContent>
      )}

      {deleteConfirmationDialog()}
    </Card>
  );
};

export default TournamentCard;
