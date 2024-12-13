import React, { useState } from "react";
import { Popover, Typography, Link } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import { Help } from "@mui/icons-material";
import theme from "../../../themes/theme";
import { useTranslation } from "react-i18next";

const OverlayInfoButton: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const { t } = useTranslation();

  const handleClick = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (): void => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "learn-more-popover" : undefined;

  return (
    <>
      <IconButton onClick={handleClick} style={buttonStyle}>
        <Help style={iconStyle} />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left"
        }}
        slotProps={{
          paper: {
            sx: {
              maxWidth: { xs: "300px", sm: "500px" },
              padding: 2
            }
          }
        }}
      >
        <Typography>
          {t("overlay.explanation")}
          <Link
            href="https://obsproject.com/kb/browser-source"
            target="_blank"
            rel="noopener"
            sx={{ whiteSpace: "nowrap" }}
          >
            {t("overlay.more_info_link")}
          </Link>
        </Typography>
      </Popover>
    </>
  );
};

const buttonStyle: React.CSSProperties = {
  padding: "5px 5px",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontSize: "16px"
};

const iconStyle: React.CSSProperties = {
  color: theme.palette.primary.main
};

export default OverlayInfoButton;
