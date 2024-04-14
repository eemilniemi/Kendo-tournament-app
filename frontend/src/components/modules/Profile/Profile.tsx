import React, { Fragment, useState, useEffect } from "react";
import ProfileInfo from "./ProfileInfo";
import ProfileGames from "./ProfileGames";
import ProfilePoints from "./ProfilePoints";
import CreatedTournaments from "./CreatedTournaments";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { useTranslation } from "react-i18next";
import { Box, Container, MenuItem, Select } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useAuth } from "context/AuthContext";
import api from "api/axios";
import type { Tournament } from "types/models";

const Profile: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState("info");
  const [userCreatedTournaments, setUserCreatedTournaments] = useState<
    Tournament[]
  >([]);
  const { t } = useTranslation();
  const mobile = useMediaQuery("(max-width:600px)");
  const { userId } = useAuth();

  useEffect(() => {
    const fetchUserCreatedTournaments = async (): Promise<void> => {
      try {
        const tournamentsData = await api.tournaments.getAll();
        const filteredTournaments = tournamentsData.filter(
          (tournament) => tournament.creator.id === userId
        );
        setUserCreatedTournaments(filteredTournaments);
      } catch (error) {}
    };

    void fetchUserCreatedTournaments();
  }, [userId]);

  const handleTabChange = (
    _event: React.ChangeEvent<unknown>,
    newValue: string
  ): void => {
    setSelectedTab(newValue);
  };

  return (
    <Container sx={{ position: "relative", paddingBottom: "30px" }}>
      {/* If the device is mobile */}
      {mobile ? (
        <Fragment>
          <Select
            value={selectedTab}
            onChange={(event) => {
              setSelectedTab(event.target.value);
            }}
            style={{ marginBottom: "10px", alignItems: "center" }}
            sx={{
              border: "2px solid #db4744",
              fontSize: "20px",
              color: "#db4744"
            }}
          >
            <MenuItem value="info">{t("profile.profile_info")}</MenuItem>
            <MenuItem value="games">{t("profile.my_games")}</MenuItem>
            <MenuItem value="points">{t("profile.my_points")}</MenuItem>
            {userCreatedTournaments.length > 0 && (
              <MenuItem value="created_t">
                {t("profile.created_tournaments")}
              </MenuItem>
            )}
          </Select>
          <br></br>
        </Fragment>
      ) : (
        <Box
          style={{ display: "flex", alignItems: "center" }}
          sx={{ borderBottom: 1, borderColor: "divider", marginBottom: "10px" }}
        >
          {/* If the device is desktop */}
          <Tabs value={selectedTab} onChange={handleTabChange}>
            <Tab label={t("profile.profile_info")} value="info" />
            <Tab label={t("profile.my_games")} value="games" />
            <Tab label={t("profile.my_points")} value="points" />
            {userCreatedTournaments.length > 0 && (
              <Tab label={t("profile.created_tournaments")} value="created_t" />
            )}
          </Tabs>
        </Box>
      )}
      {selectedTab === "info" && <ProfileInfo />}
      {selectedTab === "games" && <ProfileGames />}
      {selectedTab === "points" && <ProfilePoints />}
      {selectedTab === "created_t" && <CreatedTournaments />}
    </Container>
  );
};

export default Profile;
