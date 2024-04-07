import React, { useEffect, useState } from "react";
import TournamentCard from "./TournamentCard";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTournaments } from "context/TournamentsContext";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import EventIcon from "@mui/icons-material/Event";
import Container from "@mui/material/Container";
import Select from "@mui/material/Select";
import type { Tournament } from "types/models";
import { useTranslation } from "react-i18next";
import type { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import {
  sortTournamentsByMostRecent,
  sortTournamentsByOldest,
  sortTournamentsByName,
  sortTournamentsByDescName,
  sortTournamentsByLocation
} from "utils/sorters";
import FilterTournaments from "../FilterTournaments";

const TournamentList: React.FC = () => {
  const navigate = useNavigate();
  const { past, upcoming, ongoing } = useTournaments();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const tabTypes = ["past", "ongoing", "upcoming"] as const;
  const defaultTab = "ongoing";
  const currentTab = searchParams.get("tab") ?? defaultTab;
  // State to keep track if filters have been applied
  const [filtersApplied, setFiltersApplied] = useState(false);
  // State for storing possible filtered tournaments
  const [filteredTournaments, setFilteredTournaments] = useState<Tournament[]>(
    []
  );

  // State variables for sorting
  const [sortBy, setSortBy] = useState<
    "mostRecent" | "oldest" | "name" | "nameDesc" | "location"
  >("mostRecent");

  // Event handler for sorting change
  const handleSortChange = (
    event: SelectChangeEvent<
      "mostRecent" | "oldest" | "name" | "nameDesc" | "location"
    >
  ): void => {
    setSortBy(event.target.value as typeof sortBy);
  };

  // Function to receive filtered tournaments from FilterTournaments
  const handleFilteredTournaments = (
    tournaments: Tournament[],
    areFiltersApplied: boolean
  ): void => {
    setFiltersApplied(areFiltersApplied);
    setFilteredTournaments(tournaments);
  };

  useEffect(() => {
    if (currentTab === null || !tabTypes.some((tab) => tab === currentTab)) {
      setSearchParams((params) => {
        params.set("tab", defaultTab);
        return params;
      });
    }
  }, [currentTab]);

  const tournamentsToRender = (): Tournament[] => {
    let tournaments: Tournament[];

    switch (currentTab) {
      case "past":
        tournaments = [...past]; // a copy not to mutate original data
        break;
      case "ongoing":
        tournaments = ongoing;
        break;
      case "upcoming":
        tournaments = upcoming;
        break;
      default:
        tournaments = ongoing;
    }

    // Show filtered tournaments if filters are applied
    if (filtersApplied) {
      tournaments = filteredTournaments;
    }

    // Sort tournaments based on chosen sorting criteria
    switch (sortBy) {
      case "mostRecent":
        sortTournamentsByMostRecent(tournaments);
        break;
      case "oldest":
        sortTournamentsByOldest(tournaments);
        break;
      case "name":
        sortTournamentsByName(tournaments);
        break;
      case "nameDesc":
        sortTournamentsByDescName(tournaments);
        break;
      case "location":
        sortTournamentsByLocation(tournaments);
        break;
    }
    return tournaments;
  };

  const handleTabChange = (tab: string): void => {
    setSearchParams((params) => {
      params.set("tab", tab);
      return params;
    });

    // Reset filter state when switching tabs
    setFiltersApplied(false);
    setFilteredTournaments([]);

    // On tab change clear selections
    sessionStorage.clear();
  };

  // SpeedDial actions
  const actions = [
    { icon: <EventIcon />, name: t("frontpage_labels.create_tournament") }
  ];

  return (
    <Container sx={{ position: "relative", paddingBottom: "30px" }}>
      {/* Floating Create Tournament Button */}
      <SpeedDial
        ariaLabel={t("frontpage_labels.create_tournament")}
        icon={<SpeedDialIcon />}
        direction="up"
        sx={{ position: "fixed", bottom: "100px", right: "20px" }}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={() => {
              navigate("new-tournament");
            }}
          />
        ))}
      </SpeedDial>

      {/* Tournament Listings */}
      <Box
        sx={{ borderBottom: 1, borderColor: "divider", marginBottom: "10px" }}
      >
        <Tabs
          value={currentTab}
          onChange={(_, value) => {
            handleTabChange(value);
          }}
          variant="scrollable"
          sx={{
            position: "sticky",
            top: 0,
            bottom: 0,
            backgroundColor: "white"
          }}
        >
          <Tab
            label={t("frontpage_labels.ongoing_tournaments")}
            value={"ongoing"}
          ></Tab>
          <Tab
            label={t("frontpage_labels.upcoming_tournaments")}
            value={"upcoming"}
          ></Tab>
          <Tab
            label={t("frontpage_labels.past_tournaments")}
            value={"past"}
          ></Tab>
        </Tabs>
      </Box>

      <Box display="flex" alignItems="center" marginBottom="10px">
        {/* Dropdown menu to choose sorting criteria all tournament tabs */}
        <label style={{ marginRight: "10px" }}>{t("sorting.orderBy")} </label>
        <Select
          value={sortBy}
          onChange={handleSortChange}
          style={{ marginBottom: "10px" }}
        >
          <MenuItem value="mostRecent">{t("sorting.mostRecent")}</MenuItem>
          <MenuItem value="oldest">{t("sorting.oldest")}</MenuItem>
          <MenuItem value="name">{t("sorting.name")}</MenuItem>
          <MenuItem value="nameDesc">{t("sorting.nameDesc")}</MenuItem>
          <MenuItem value="location">{t("sorting.location")}</MenuItem>
        </Select>
        {/* Filtering options button */}
        <FilterTournaments
          tournaments={tournamentsToRender()}
          handleFilteredTournaments={handleFilteredTournaments}
        />
      </Box>

      <Grid
        container
        spacing={2}
        direction={currentTab === "past" ? "column" : "row"}
        alignItems="stretch"
      >
        {tournamentsToRender().length > 0 ? (
          tournamentsToRender().map((tournament, key) => (
            <Grid item xs={12} md={6} key={tournament.id + key}>
              <TournamentCard tournament={tournament} type={currentTab} />
            </Grid>
          ))
        ) : (
          <Container>
            <Typography variant="h6" marginTop="32px" textAlign="center">
              {t("frontpage_labels.no_tournaments_found")}
            </Typography>
          </Container>
        )}
      </Grid>
    </Container>
  );
};

export default TournamentList;
