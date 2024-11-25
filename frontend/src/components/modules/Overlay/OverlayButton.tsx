import React from "react";
import IconButton from "@mui/material/IconButton";
import { ContentCopy } from "@mui/icons-material";

const OverlayButton: React.FC<{ link: string }> = ({ link }) => {
  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(link);
      alert("Overlay link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy the link:", err);
      alert("Failed to copy the link.");
    }
  };

  return (
    <IconButton onClick={handleCopy} style={buttonStyle}>
      <ContentCopy />
    </IconButton>
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
