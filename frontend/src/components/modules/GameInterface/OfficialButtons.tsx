import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
  Box
} from "@mui/material";
import { useTranslation } from "react-i18next";

interface AddPointDialogProps {
  open: boolean;
  selectedButton: string;
  handleRadioButtonClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handlePointShowing: () => Promise<void>;
  handleOpen: (player: number) => void;
  handleClose: () => void;
  gameStarted: boolean;
  player1name: string;
  player2name: string;
}

const OfficialButtons: React.FC<AddPointDialogProps> = ({
  open,
  selectedButton,
  handleRadioButtonClick,
  handlePointShowing,
  handleOpen,
  handleClose,
  gameStarted,
  player1name,
  player2name
}) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false); // State to handle button disable

  const handleSubmit = async (): Promise<void> => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await handlePointShowing();
    } finally {
      setTimeout(() => {
        setIsSubmitting(false);
      }, 300);
    }
  };

  return (
    <div>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: "20px", sm: "100px" },
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Button
          onClick={() => {
            handleOpen(1);
          }}
          variant="contained"
          sx={{
            borderRadius: "25px",
            border: "2px solid black",
            color: "black",
            backgroundColor: "transparent",
            width: { xs: "100%", sm: "auto" }
          }}
          disabled={!gameStarted}
        >
          {`${t("buttons.add_point_player_1")} ${player1name}`}
        </Button>
        <Button
          onClick={() => {
            handleOpen(2);
          }}
          sx={{
            borderRadius: "25px",
            border: "2px solid #D01C1C",
            color: "black",
            backgroundColor: "transparent",
            width: { xs: "100%", sm: "auto" }
          }}
          variant="contained"
          disabled={!gameStarted}
        >
          {`${t("buttons.add_point_player_2")} ${player2name}`}
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
            onClick={handleSubmit}
            disabled={selectedButton === "" || isSubmitting} // Disable if no selection or already submitting
          >
            {t("buttons.ok_button")}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OfficialButtons;
