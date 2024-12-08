import React, { useState } from "react";
import { Popover, Typography, Link } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import { Help } from "@mui/icons-material";
import theme from "../../../themes/theme";

const OverlayInfoButton: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

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
          The overlay enables embedding real-time match information to video.
          Click the button to copy the link, and use it as a browser source in
          OBS or some other capture software of your choice.{" "}
          <Link
            href="https://obsproject.com/kb/browser-source"
            target="_blank"
            rel="noopener"
            sx={{ whiteSpace: "nowrap" }}
          >
            Learn more
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
