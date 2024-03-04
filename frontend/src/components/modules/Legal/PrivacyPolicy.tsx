import React from "react";
import { Typography, Link, List, ListItem } from "@mui/material";
import { useTranslation } from "react-i18next";

const PrivacyPolicy: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div>
      <Typography variant="h2">{t("privacy.title")}</Typography>
      <Typography>{t("terms_and_conditions.last_updated")}</Typography>
      <br></br>
      <Typography>{t("privacy.body")}</Typography>
      <br></br>
      <Typography variant="h4">{t("privacy.title1")}</Typography>
      <br></br>
      <Typography variant="h5">{t("privacy.title2")}</Typography>
      <Typography>{t("privacy.body1")}</Typography>
      <br></br>
      <Typography variant="h5">{t("privacy.title3")}</Typography>
      <Typography>{t("privacy.body2")}</Typography>
      <List>
        <ListItem>
          <Typography>{t("privacy.body3")}</Typography>
        </ListItem>
        <ListItem>
          <Typography>{t("privacy.body4")}</Typography>
        </ListItem>
        <ListItem>
          <Typography>{t("privacy.body5")}</Typography>
        </ListItem>
        <ListItem>
          <Typography>{t("privacy.body6")}</Typography>
        </ListItem>
        <ListItem>
          <Typography>{t("privacy.body7")}</Typography>
        </ListItem>
        <ListItem>
          <Typography>{t("privacy.body8")}</Typography>
        </ListItem>
        <ListItem>
          <Typography>{t("privacy.body9")}</Typography>
        </ListItem>
        <ListItem>
          <Typography>{t("privacy.body10")}</Typography>
        </ListItem>
        <ListItem>
          <Typography>{t("privacy.body11")}</Typography>
        </ListItem>
        <ListItem>
          <Typography>{t("privacy.body12")}</Typography>
        </ListItem>
        <ListItem>
          <Typography>
            {t("privacy.body13")}{" "}
            <Link href="app.kendoliiga.fi" target="_blank">
              app.kendoliiga.fi
            </Link>
          </Typography>
        </ListItem>
        <ListItem>
          <Typography>{t("privacy.body14")}</Typography>
        </ListItem>
      </List>
      <br></br>
      <Typography variant="h4">{t("privacy.title4")}</Typography>
      <br></br>
      <Typography variant="h5">{t("privacy.title5")}</Typography>
      <br></br>
      <Typography variant="h6">{t("privacy.title6")}</Typography>
      <Typography>{t("privacy.body15")}</Typography>
      <List>
        <ListItem>
          <Typography>{t("user_info_labels.email_address")}</Typography>
        </ListItem>
        <ListItem>
          <Typography>{t("privacy.body16")}</Typography>
        </ListItem>
        <ListItem>
          <Typography>{t("user_info_labels.phone_number")}</Typography>
        </ListItem>
        <ListItem>
          <Typography>{t("user_info_labels.nationality")}</Typography>
        </ListItem>
        <ListItem>
          <Typography>{t("privacy.title7")}</Typography>
        </ListItem>
      </List>
      <br></br>
      <Typography variant="h6">{t("privacy.title7")}</Typography>
      <Typography>{t("privacy.body17")}</Typography>
      <br></br>
      <Typography variant="h5">{t("privacy.title8")}</Typography>
      <Typography>{t("privacy.body18")}</Typography>
      <List>
        <ListItem>
          <Typography>{t("privacy.body19")}</Typography>
        </ListItem>
        <ListItem>
          <Typography>{t("privacy.body20")}</Typography>
        </ListItem>
        <ListItem>
          <Typography>{t("privacy.body21")}</Typography>
        </ListItem>
      </List>
      <br></br>
      <Typography variant="h5">{t("privacy.title9")}</Typography>
      <Typography>{t("privacy.body22")}</Typography>
      <br></br>
      <Typography variant="h5">{t("privacy.title10")}</Typography>
      <Typography>{t("privacy.body23")}</Typography>
      <br></br>
      <Typography variant="h4">{t("privacy.title11")}</Typography>
      <Typography> {t("privacy.body24")}</Typography>
      <br></br>
      <Typography variant="h4">{t("privacy.title12")}</Typography>
      <Typography>{t("privacy.body25")}</Typography>
      <br></br>
      <Typography variant="h4">{t("privacy.title13")}</Typography>
      <Typography>{t("privacy.body26")}</Typography>
      <List>
        <ListItem>
          <Typography>
            {t("privacy.body27")} info(at)kendoseinajoki.fi
          </Typography>
        </ListItem>
      </List>
    </div>
  );
};

export default PrivacyPolicy;
