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

interface ModifyDeletePointsProps {
  handleDeleteRecentPoint: () => Promise<void>;
  handleModifyRecentPoint: (newType: PointType) => Promise<void>;
  mostRecentPointType: PointType | null;
}

const ModifyDeletePoints: React.FC<ModifyDeletePointsProps> = ({
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
          <Button
            onClick={async () => {
              await handleDeleteRecentPoint();
              setModifyPointOpen(false); 
            }}
          >
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
      <Box display="flex" gap="20px" justifyContent="center">
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
      </Box>
    </div>
  );
};

export default ModifyDeletePoints;
