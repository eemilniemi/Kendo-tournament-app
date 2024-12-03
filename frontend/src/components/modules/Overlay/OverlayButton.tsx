import React, { useState } from "react";
import IconButton from "@mui/material/IconButton";
import { ContentCopy } from "@mui/icons-material";
import { Snackbar } from "@mui/material";

const OverlayButton: React.FC<{ link: string }> = ({ link }) => {
  const [open, setOpen] = useState(false);

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(link);
      setOpen(true);
    } catch (err) {
      console.error("Failed to copy the link:", err);
    }
  };

  return (
    <>
      <IconButton onClick={handleCopy} style={buttonStyle}>
        <ContentCopy />
      </IconButton>
      <Snackbar
        message="Overlay link copied to clipboard!"
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={2000}
        onClose={() => {
          setOpen(false);
        }}
        open={open}
      />
    </>
  );
};

const buttonStyle: React.CSSProperties = {
  padding: "10px 20px",
  // backgroundColor: "#FF0000",
  // color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontSize: "16px"
};

export default OverlayButton;
