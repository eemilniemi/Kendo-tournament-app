import React, { useState } from "react";
import ProfileInfo from "./ProfileInfo";
import ProfileGames from "./ProfileGames";
import ProfilePoints from "./ProfilePoints";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { useTranslation } from "react-i18next";

const Profile: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState("info");
  const { t } = useTranslation();

  const handleTabChange = (
    event: React.ChangeEvent<unknown>,
    newValue: string
  ): void => {
    setSelectedTab(newValue);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <Tabs value={selectedTab} onChange={handleTabChange}>
          <Tab label={t("profile.profile_info")} value="info" />
          <Tab label={t("profile.my_games")} value="games" />
          <Tab label={t("profile.my_points")} value="points" />
        </Tabs>
      </div>
      {selectedTab === "info" && <ProfileInfo />}
      {selectedTab === "games" && <ProfileGames />}
      {selectedTab === "points" && <ProfilePoints />}
    </div>
  );
};

export default Profile;
