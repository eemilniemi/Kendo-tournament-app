import React, { useState } from "react";
import { Snackbar } from "@mui/material";
import Button from "@mui/material/Button";

// A button for copying the overlay link
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
      <Button variant="text" onClick={handleCopy} style={buttonStyle}>
        Overlay
      </Button>
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
  padding: "5px 5px",
  borderRadius: "5px",
  cursor: "pointer",
  fontSize: "14px"
};

export default OverlayButton;
