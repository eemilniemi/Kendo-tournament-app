import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import { useTranslation } from "react-i18next";
import useToast from "hooks/useToast";

const CopyToClipboardButton = () => {
  const [textToCopy, setTextToCopy] = useState("");
  const { t } = useTranslation();
  const showToast = useToast();

  useEffect(() => {
    setTextToCopy(window.location.href); // Set the current site address as text to copy
  }, []);

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      showToast(t("messages.copy_success"), "success");
    } catch (error) {
      showToast(t("messages.copy_failure"), "error");
    }
  };

  return (
    <Button
      variant="contained"
      color="error"
      onClick={handleCopyToClipboard}
    >
      {t("buttons.copy_to_clipboard")}
    </Button>
  );
};

export default CopyToClipboardButton;