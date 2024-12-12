import React, { useState } from "react";
import {
  Button,
  Box,
  Typography,
  TextField,
  Modal,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useMediaQuery
} from "@mui/material";
import type { TournamentPlayer } from "./OngoingTournament/RoundRobin/RoundRobinTournamentView";
import type { Match, Tournament } from "types/models";
import PlayerName from "./PlayerNames";
import api from "api/axios";
import type { ChangeCourtTimeRequest } from "types/requests";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { mapNumberToLetter } from "utils/helperFunctions";
import { allMatchesPlayed } from "utils/TournamentUtils";

interface MatchButtonProps {
  match: Match;
  players?: TournamentPlayer[];
  haveSameNames: boolean;
  isUserTheCreator: boolean;
  tournamentData: Tournament;
}

const MatchButton: React.FC<MatchButtonProps> = ({
  match,
  players,
  haveSameNames,
  isUserTheCreator,
  tournamentData
}) => {
  const [editMode, setEditMode] = useState(false);
  const [newCourtNumber, setNewCourtNumber] = useState<number>(
    match.courtNumber
  );
  const [newTime, setNewTime] = useState(
    match.scheduledTime === "XX:XX" ? "00:00" : match.scheduledTime
  );
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:600px)");

  const handleOpen = (): void => {
    setEditMode(true);
  };

  const handleClose = (): void => {
    setEditMode(false);
  };

  const handleSubmit = async (): Promise<void> => {
    const updates: Partial<ChangeCourtTimeRequest> = {};

    if (newCourtNumber !== match.courtNumber) {
      updates.courtNumber = newCourtNumber;
    }
    if (newTime !== match.scheduledTime) {
      updates.scheduledTime = newTime;
    }

    if (Object.keys(updates).length > 0) {
      try {
        await api.match.changeCourtAndTime(match.id, updates);
      } catch (error) {
        alert(t("error.updating_match"));
        console.error(error);
      }
    }
    setEditMode(false);
  };

  const isForfeit = players === undefined || players.length < 2;

  const player1 = players?.find(
    (player) => player?.id === match.players[0]?.id
  );
  const player2 = players?.find(
    (player) => player?.id === match.players[1]?.id
  );

  const entity1Name =
    player1 !== undefined ? (
      <PlayerName
        firstName={player1.firstName ?? ""}
        lastName={player1.lastName ?? ""}
        sameNames={haveSameNames}
      />
    ) : (
      ""
    );

  const entity2Name =
    player2 !== undefined ? (
      <PlayerName
        firstName={player2.firstName ?? ""}
        lastName={player2.lastName ?? ""}
        sameNames={haveSameNames}
      />
    ) : (
      ""
    );

  const isNullOrEmpty = (value: unknown): boolean =>
    value === null || value === undefined || value === "";

  const officialsInfo = (() => {
    if (
      match.elapsedTime != null &&
      match.elapsedTime <= 0 &&
      match.winner == null &&
      match.winnerTeamId == null
    ) {
      const missingRoles = [
        isNullOrEmpty(match.timeKeeper)
          ? t("game_interface.time_keeper").toLowerCase()
          : null,
        isNullOrEmpty(match.pointMaker)
          ? t("game_interface.point_maker").toLowerCase()
          : null
      ]
        .filter((info) => info !== null)
        .join(", ");

      return `${t("tournament_view_labels.missing")} ${missingRoles}`;
    }
    return "";
  })();

  const isOngoing =
    match.elapsedTime != null &&
    match.elapsedTime > 0 &&
    match.endTimestamp == null;

  const isFinished =
    match.endTimestamp != null ||
    (match.elapsedTime == null &&
      (match.winner != null || match.winnerTeamId != null));

  const hasTournamentFinished =
    allMatchesPlayed(tournamentData) ||
    (tournamentData.endDate !== undefined &&
      new Date(tournamentData.endDate) < new Date());

  const winnerBackgroundColor = "#ABE2A8";

  const entity1Styles = {
    bgcolor:
      isFinished && match.winner === match.players[0]?.id
        ? winnerBackgroundColor
        : "transparent"
  };
  const entity2Styles = {
    bgcolor:
      isFinished && match.winner === match.players[1]?.id
        ? winnerBackgroundColor
        : "transparent"
  };

  const courtOptions = Array.from(
    { length: tournamentData.numberOfCourts },
    (_, i) => i + 1
  );

  return (
    <div
      style={{
        display: "inline-block",
        minWidth: "260px",
        width: isMobile ? "100%" : "auto"
      }}
      key={match.id}
    >
      <Box>
        {/* Scheduled Time or Ongoing Status */}
        {!isFinished && !isForfeit && !hasTournamentFinished && (
          <Box
            sx={{
              height: "20px",
              marginBottom: "5px",
              display: "flex",
              alignItems: "center"
            }}
          >
            <Typography variant="body1" fontSize="13px">
              {isOngoing
                ? `${t("tournament_view_labels.ongoing")} ${Math.floor(
                    match.elapsedTime / 60000
                  )}'`
                : match.scheduledTime !== "XX:XX"
                ? `${t("tournament_view_labels.match_start_clock")}: ${
                    match.scheduledTime
                  }`
                : t("tournament_view_labels.no_scheduled_time")}
            </Typography>
          </Box>
        )}

        {/* Edit Court and Time */}
        {isUserTheCreator &&
          !hasTournamentFinished &&
          (!isForfeit && !isFinished ? (
            <Button
              onClick={handleOpen}
              style={{
                fontSize: "13px",
                padding: "0px",
                marginBottom: "5px",
                height: "20px"
              }}
            >
              {t("tournament_view_labels.edit_court_time")}
            </Button>
          ) : (
            <Box sx={{ marginBottom: "5px" }}></Box>
          ))}

        {/* Match Details */}
        <Box
          onClick={() => {
            if (!isForfeit) {
              navigate(`/tournaments/${tournamentData.id}/match/${match.id}`);
            }
          }}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            border: 1,
            borderColor: isOngoing ? "#28CC3B" : "black",
            borderRadius: "10px",
            p: 2,
            gap: 1,
            cursor: isForfeit ? "not-allowed" : "pointer",
            backgroundColor: isForfeit ? "#ffff99" : "white",
            minHeight: "80px",
            justifyContent: "space-between"
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="center">
            {/* Player 1 */}
            <Typography
              variant="body1"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "4px 8px",
                borderRadius: "5px",
                ...entity1Styles
              }}
            >
              <span>{entity1Name}</span>
              {(isOngoing || isFinished) && (
                <Typography
                  component="span"
                  sx={{
                    fontWeight: "bold"
                  }}
                >
                  {match.player1Score ?? 0}
                </Typography>
              )}
            </Typography>

            {/* Separator */}
            <Typography variant="body1" sx={{ margin: "0 12px" }}>
              {" - "}
            </Typography>

            {/* Player 2 */}
            <Typography
              variant="body1"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "4px 8px",
                borderRadius: "5px",
                ...entity2Styles
              }}
            >
              {(isOngoing || isFinished) && (
                <Typography
                  component="span"
                  sx={{
                    fontWeight: "bold"
                  }}
                >
                  {match.player2Score ?? 0}
                </Typography>
              )}
              <span>{entity2Name}</span>
            </Typography>
          </Box>

          {!isForfeit ? (
            <Typography variant="body1" fontSize="15px">
              {t("tournament_view_labels.court_number")}:{" "}
              {mapNumberToLetter(match.courtNumber)}
            </Typography>
          ) : (
            <Typography variant="body1" fontSize="15px" fontWeight={"bold"}>
              BYE
            </Typography>
          )}
        </Box>
      </Box>
      {!isForfeit && officialsInfo !== "" && (
        <Typography variant="body2" marginTop="5px" fontSize="13px">
          {officialsInfo}
        </Typography>
      )}
      <Modal open={editMode} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4
          }}
        >
          <Typography variant="h6">
            {t("tournament_view_labels.edit_court_time")}
          </Typography>
          <TextField
            label={t("tournament_view_labels.scheduled_time")}
            type="time"
            value={newTime}
            onChange={(e) => {
              setNewTime(e.target.value);
            }}
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink: true
            }}
            inputProps={{
              step: 300
            }}
          />
          <FormControl fullWidth margin="normal" variant="outlined">
            <InputLabel id="court-number-label">
              {t("tournament_view_labels.court_number")}
            </InputLabel>
            <Select
              labelId="court-number-label"
              value={newCourtNumber}
              onChange={(e) => {
                setNewCourtNumber(Number(e.target.value));
              }}
              label={t("tournament_view_labels.court_number")} // Ensure the label is connected to the Select
            >
              {courtOptions.map((court) => (
                <MenuItem key={court} value={court}>
                  {mapNumberToLetter(court)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button onClick={handleSubmit} variant="contained" color="primary">
            {t("buttons.save_button")}
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default MatchButton;
