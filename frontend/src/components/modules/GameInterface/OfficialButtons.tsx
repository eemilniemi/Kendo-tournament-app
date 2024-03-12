import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
  Box,
  DialogActions
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { buttonToTypeMap } from "./GameInterface";
import { type PointType } from "types/models";

interface AddPointDialogProps {
  open: boolean;
  selectedButton: string;
  handleRadioButtonClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handlePointShowing: () => Promise<void>;
  handleOpen: (player: number) => void;
  handleClose: () => void;
  handleDeleteRecentPoint: () => Promise<void>;
  handleModifyRecentPoint: (newType: PointType) => Promise<void>;
  mostRecentPointType: PointType | null;
}

const OfficialButtons: React.FC<AddPointDialogProps> = ({
  open,
  selectedButton,
  handleRadioButtonClick,
  handlePointShowing,
  handleOpen,
  handleClose,
  handleDeleteRecentPoint,
  handleModifyRecentPoint,
  mostRecentPointType
}) => {
  const { t } = useTranslation();
  const [modifyPointOpen, setModifyPointOpen] = useState(false);
  const [newPointType, setNewPointType] = useState<PointType | null>(null);

  useEffect(() => {
    // Set the default selected radio button to the most recent point type
    if (mostRecentPointType !== null) {
      setNewPointType(mostRecentPointType);
    }
  }, [mostRecentPointType]);

  const handleSaveNewPointType = async (): Promise<void> => {
    if (newPointType !== null && newPointType !== mostRecentPointType) {
      await handleModifyRecentPoint(newPointType);
      setModifyPointOpen(false);
    }
  };

  return (
    <div>
      <Box display="flex" gap="20px" justifyContent="center">
        <Button
          onClick={() => {
            handleOpen(1);
          }}
          variant="contained"
        >
          {t("buttons.add_point_player_1")}
        </Button>
        <Button
          onClick={() => {
            handleOpen(2);
          }}
          variant="contained"
        >
          {t("buttons.add_point_player_2")}
        </Button>
      </Box>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{t("game_interface.dialog_title")}</DialogTitle>
        <DialogContent>
          <RadioGroup
            aria-label="point"
            name="point"
            value={selectedButton}
            onChange={handleRadioButtonClick}
          >
            <FormControlLabel value="M" control={<Radio />} label="M" />
            <FormControlLabel value="K" control={<Radio />} label="K" />
            <FormControlLabel value="D" control={<Radio />} label="D" />
            <FormControlLabel value="T" control={<Radio />} label="T" />
            <FormControlLabel value="Δ" control={<Radio />} label="Δ" />
          </RadioGroup>
          <Button
            onClick={async () => {
              await handlePointShowing();
            }}
            disabled={selectedButton === ""}
          >
            {t("buttons.ok_button")}
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog
        open={modifyPointOpen}
        onClose={() => {
          setModifyPointOpen(false);
        }}
      >
        <DialogTitle>{t("titles.modify_or_delete")}</DialogTitle>
        <DialogContent>
          <RadioGroup
            aria-label="new-point-type"
            name="new-point-type"
            value={newPointType ?? ""}
            onChange={(e) => {
              setNewPointType(e.target.value as PointType);
            }}
          >
            {Object.entries(buttonToTypeMap).map(([value, label]) => (
              <FormControlLabel
                value={label}
                control={<Radio />}
                label={t(value)}
                key={value}
              />
            ))}
          </RadioGroup>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setModifyPointOpen(false);
            }}
          >
            {t("buttons.cancel_button")}
          </Button>
          <Button onClick={handleDeleteRecentPoint}>
            {t("buttons.delete")}
          </Button>
          <Button
            onClick={handleSaveNewPointType}
            disabled={newPointType === mostRecentPointType}
          >
            {t("buttons.save_button")}
          </Button>
        </DialogActions>
      </Dialog>

      {mostRecentPointType !== null && (
        <Button
          variant="contained"
          onClick={() => {
            setModifyPointOpen(true);
          }}
        >
          {t("buttons.modify_or_delete")}
        </Button>
      )}
    </div>
  );
};

export default OfficialButtons;
