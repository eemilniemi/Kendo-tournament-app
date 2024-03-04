import React from "react";
import { Typography, Link } from "@mui/material";
import routePaths from "routes/route-paths";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

const TermsAndConditions: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="Terms">
      <Typography variant="h2">{t("terms_and_conditions.title")}</Typography>
      <Typography variant="subtitle1">
        {t("terms_and_conditions.last_updated")}
      </Typography>
      <Typography variant="h3">{t("terms_and_conditions.title2")}</Typography>
      <Typography variant="body1">
        {t("terms_and_conditions.we")}{" "}
        <Link href="app.kendoliiga.fi">app.kendoliiga.fi</Link>{" "}
        {t("terms_and_conditions.we2")}
      </Typography>
      <br></br>
      <Typography variant="h4">
        1. {t("terms_and_conditions.title3")}
      </Typography>
      <Typography variant="body1">{t("terms_and_conditions.body1")}</Typography>
      <br></br>
      <Typography variant="h4">
        2. {t("terms_and_conditions.title4")}
      </Typography>
      <Typography variant="body1">
        {t("terms_and_conditions.body2")}
        <br></br>
        <br></br>
        {t("terms_and_conditions.body3")}
      </Typography>
      <br></br>
      <Typography variant="h4">
        3. {t("terms_and_conditions.title5")}
      </Typography>
      <Typography variant="body1">
        {t("terms_and_conditions.body4")}
        <br></br>
        {t("terms_and_conditions.body5")}
        <br></br>
        <br></br>
        {t("terms_and_conditions.body6")}
      </Typography>
      <br></br>
      <Typography variant="h4">
        4. {t("terms_and_conditions.title6")}
      </Typography>
      <Typography variant="body1">{t("terms_and_conditions.body7")}</Typography>
      <br></br>
      <Typography variant="h4">
        5. {t("terms_and_conditions.title7")}
      </Typography>
      <Typography variant="body1">
        {t("terms_and_conditions.body8")}
        <br></br>
        <br></br>
        {t("terms_and_conditions.body9")}
        <br></br>
        <br></br>
        {t("terms_and_conditions.body10")}
        <br></br>
        <br></br>
        {t("terms_and_conditions.body11")}
        <br></br>
        {t("terms_and_conditions.body12")}
        <br></br>
        {t("terms_and_conditions.body13")}
        <br></br>
        {t("terms_and_conditions.body14")}
        <br></br>
        {t("terms_and_conditions.body15")}
        <br></br>
        {t("terms_and_conditions.body16")}
        <br></br>
        {t("terms_and_conditions.body17")}
        <br></br>
        {t("terms_and_conditions.body18")}
        <br></br>
        {t("terms_and_conditions.body19")}
        <br></br>
        {t("terms_and_conditions.body20")}
        <br></br>
        {t("terms_and_conditions.body21")}
        <br></br>
        {t("terms_and_conditions.body22")}
      </Typography>
      <br></br>
      <Typography variant="h4">
        6. {t("terms_and_conditions.title8")}
      </Typography>
      <Typography variant="body1">
        {t("terms_and_conditions.body23")}
        <br></br>
        (1) {t("terms_and_conditions.body24")}
        <br></br>
        (2) {t("terms_and_conditions.body25")}
        <br></br>
        (3) {t("terms_and_conditions.body26")}
        <br></br>
        (4) {t("terms_and_conditions.body27")}
        <br></br>
        (5) {t("terms_and_conditions.body28")}
        <br></br>
        <br></br>
        {t("terms_and_conditions.body29")}{" "}
        <Link component={RouterLink} to={routePaths.privacy}>
          {t("navigation.privacy_policy")}
        </Link>
        {t("terms_and_conditions.body30")}
        <br></br>
        <br></br>
        {t("terms_and_conditions.body31")}
      </Typography>
      <br></br>
      <Typography variant="h4">
        7. {t("terms_and_conditions.title9")}
      </Typography>
      <Typography variant="body1">
        {t("terms_and_conditions.body32")}
      </Typography>
      <br></br>
      <Typography variant="h4">
        8. {t("terms_and_conditions.title10")}
      </Typography>
      <Typography variant="body1">
        {t("terms_and_conditions.body33")}
      </Typography>
      <br></br>
      <br></br>
      <Typography variant="subtitle1">
        {t("terms_and_conditions.body34")} info(at)kendoseinajoki.fi
      </Typography>
    </div>
  );
};

export default TermsAndConditions;
