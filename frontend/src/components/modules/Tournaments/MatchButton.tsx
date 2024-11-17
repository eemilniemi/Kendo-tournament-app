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
  useMediaQuery,
  type ButtonProps
} from "@mui/material";
import type { TournamentPlayer } from "./OngoingTournament/RoundRobin/RoundRobinTournamentView";
import type { Match, Tournament } from "types/models";
import PlayerName from "./PlayerNames";
import api from "api/axios";
import type { ChangeCourtTimeRequest } from "types/requests";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { mapNumberToLetter } from "utils/helperFunctions";

interface MatchButtonProps {
  match: Match;
  players?: TournamentPlayer[];
  haveSameNames: boolean;
  props: ButtonProps;
  isUserTheCreator: boolean;
  tournamentData: Tournament;
}

const MatchButton: React.FC<MatchButtonProps> = ({
  match,
  players,
  haveSameNames,
  props,
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

  const player1 = players?.find(
    (player) => player?.id === match.players[0]?.id
  );
  const player2 =
    match.players.length > 1
      ? players?.find((player) => player?.id === match.players[1]?.id)
      : null;

  const entity1Name =
    player1 !== undefined ? (
      <PlayerName
        firstName={player1.firstName ?? ""}
        lastName={player1.lastName ?? ""}
        sameNames={haveSameNames}
      />
    ) : (
      "Player Not Found"
    );

  const entity2Name =
    player2 !== undefined && player2 !== null ? (
      <PlayerName
        firstName={player2.firstName ?? ""}
        lastName={player2.lastName ?? ""}
        sameNames={haveSameNames}
      />
    ) : (
      "Player Not Found"
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
          ? t("tournament_view_labels.missing_timer")
          : null,
        isNullOrEmpty(match.pointMaker)
          ? t("tournament_view_labels.missing_point_maker")
          : null
      ]
        .filter((info) => info !== null)
        .join(", ");

      return missingRoles ?? t("tournament_view_labels.missing_both");
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
        marginBottom: "10px",
        display: "inline-block",
        minWidth: "260px",
        width: isMobile ? "100%" : "auto"
      }}
      key={match.id}
    >
      <Box>
        {!isFinished && (
          <Typography variant="body1" marginBottom="5px" fontSize="13px">
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
        )}

        {isUserTheCreator && !isFinished && (
          <Button
            onClick={() => {
              handleOpen();
            }}
            style={{ fontSize: "13px", padding: "0px", marginBottom: "5px" }}
          >
            {t("tournament_view_labels.edit_court_time")}
          </Button>
        )}
        <Box
          onClick={() => {
            navigate(`match/${match.id}`);
          }}
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          border={1}
          borderRadius="10px"
          gap={1}
          p={1}
          sx={{
            cursor: "pointer",
            borderColor: isOngoing ? "#28CC3B" : "black"
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

          <Typography variant="body1" fontSize="15px">
            {t("tournament_view_labels.court_number")}:{" "}
            {mapNumberToLetter(match.courtNumber)}
          </Typography>
        </Box>
      </Box>
      {officialsInfo !== null && (
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
          <FormControl fullWidth margin="normal">
            <InputLabel>{t("tournament_view_labels.court_number")}</InputLabel>
            <Select
              value={newCourtNumber}
              onChange={(e) => {
                setNewCourtNumber(Number(e.target.value));
              }}
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
