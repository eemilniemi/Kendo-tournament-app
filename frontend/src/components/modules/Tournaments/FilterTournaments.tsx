import React, { useState, useEffect } from "react";
import type { SelectChangeEvent } from "@mui/material";
import { useAuth } from "context/AuthContext";
import {
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Select,
  Typography,
  FormGroup,
  MenuItem,
  Box
} from "@mui/material";
import FormControlLabel from "@mui/material/FormControlLabel";
import { useTranslation } from "react-i18next";
import {
  filterByTime,
  filterByParticipation,
  filterByTournamentType,
  filterByCategory,
  filterByLocation
} from "utils/filters";
import type { Tournament, TournamentType, Category } from "types/models";
import DateRangePicker from "./TournamentListing/DateRangePicker";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { useTournaments } from "context/TournamentsContext";
import { sortTournamentsByLocation } from "utils/sorters";

interface FilterTournamentsProps {
  tournaments: Tournament[];
  tab: string;
  handleFilteredTournaments: (
    filteredTournaments: Tournament[],
    areFiltersApplied: boolean
  ) => void;
}

interface FilterCriteria {
  participation: boolean;
  tournamentTypes: TournamentType[];
  categories: Category[];
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  location: string;
}

const FilterTournaments: React.FC<FilterTournamentsProps> = ({
  tournaments,
  tab,
  handleFilteredTournaments
}) => {
  const { t } = useTranslation();
  const [filteringDialog, setFilteringDialog] = useState(false);
  const { userId, isAuthenticated } = useAuth();
  const [isFilterCriteriaLoaded, setIsFilterCriteriaLoaded] = useState(false);
  const { upcoming, ongoing, past } = useTournaments();

  const getOriginalTournamentData = (): Tournament[] => {
    if (tab === "upcoming") {
      return upcoming;
    } else if (tab === "ongoing") {
      return ongoing;
    } else {
      return past;
    }
  };

  // Arrays of tuples containing the type and its localization key, for populating dialog window
  const tournamentTypeOptions: Array<[TournamentType, string]> = [
    ["Round Robin", "types.round_robin"],
    ["Playoff", "types.playoff"],
    ["Preliminary Playoff", "types.preliminary_playoff"]
  ];
  const categoryOptions: Array<[Category, string]> = [
    ["hobby", "create_tournament_form.hobby"],
    ["championship", "create_tournament_form.championship"],
    ["league", "create_tournament_form.league"]
  ];

  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>({
    participation: false,
    tournamentTypes: [],
    categories: [],
    startDate: null,
    endDate: null,
    location: ""
  });

  // Reset filter criteria when tab changes
  useEffect(() => {
    resetFilters();
  }, [tab]);

  // State variables for keeping track of checkbox states
  const [tournamentTypeSelections, setTournamentTypeSelections] = useState<{
    [key in TournamentType]: boolean;
  }>({
    "Round Robin": false,
    Playoff: false,
    "Preliminary Playoff": false
  });
  const [categorySelections, setCategorySelections] = useState<{
    [key in Category]: boolean;
  }>({
    hobby: false,
    championship: false,
    league: false
  });

  // When app mounts check if there is filters stored in sessionStorage
  useEffect(() => {
    const storedFilters = sessionStorage.getItem("tournamentFilters");
    if (storedFilters !== null && storedFilters !== undefined) {
      const parsedFilters = JSON.parse(storedFilters);
      // Check if startDate and endDate exist in parsedFilters
      if (parsedFilters.startDate !== null && parsedFilters.endDate !== null) {
        // Convert dates to Day.js objects
        const startDate = dayjs(parsedFilters.startDate);
        const endDate = dayjs(parsedFilters.endDate);
        updateCriteria({
          ...parsedFilters,
          startDate,
          endDate
        });
      } else {
        updateCriteria(parsedFilters);
      }
      // Update checkbox selections based on loaded filter criteria
      setTournamentTypeSelections((prevSelections) => {
        const updatedSelections: { [key in TournamentType]: boolean } = {
          ...prevSelections
        };
        parsedFilters.tournamentTypes.forEach((type: TournamentType) => {
          updatedSelections[type] = true;
        });
        return updatedSelections;
      });

      setCategorySelections((prevSelections) => {
        const updatedSelections: { [key in Category]: boolean } = {
          ...prevSelections
        };
        parsedFilters.categories.forEach((category: Category) => {
          updatedSelections[category] = true;
        });
        return updatedSelections;
      });
      setIsFilterCriteriaLoaded(true);
    }
  }, []);

  // Show previously chosen filtered tournaments
  useEffect(() => {
    const storedTournaments = sessionStorage.getItem("filteredTournaments");
    if (storedTournaments !== null && storedTournaments !== undefined) {
      const parsedTournaments = JSON.parse(storedTournaments);
      handleFilteredTournaments(parsedTournaments, true);
    }
  }, [filterCriteria, isFilterCriteriaLoaded]);

  // Function to reset all selections from filter dialog
  const resetFilters = (): void => {
    // Filter criteria state back to original
    setFilterCriteria({
      participation: false,
      tournamentTypes: [],
      categories: [],
      startDate: null,
      endDate: null,
      location: ""
    });

    // Reset tournament type selections
    setTournamentTypeSelections((prevSelections) => {
      const resetSelections: Record<TournamentType, boolean> = {
        ...prevSelections
      };
      for (const key in resetSelections) {
        if (Object.prototype.hasOwnProperty.call(resetSelections, key)) {
          resetSelections[key as TournamentType] = false;
        }
      }
      return resetSelections;
    });

    // Reset category selections
    setCategorySelections((prevSelections) => {
      const resetSelections: Record<Category, boolean> = { ...prevSelections };
      for (const key in resetSelections) {
        if (Object.prototype.hasOwnProperty.call(resetSelections, key)) {
          resetSelections[key as Category] = false;
        }
      }
      return resetSelections;
    });

    sessionStorage.clear();
    handleFilteredTournaments([], false);
  };

  const getLocations = (): string[] => {
    let currentTournaments: Tournament[];
    if (tab === "upcoming") {
      currentTournaments = sortTournamentsByLocation(upcoming);
    } else if (tab === "ongoing") {
      currentTournaments = sortTournamentsByLocation(ongoing);
    } else {
      currentTournaments = sortTournamentsByLocation(past);
    }

    const locations = new Set<string>();
    currentTournaments.forEach((tournament) => {
      locations.add(tournament.location);
    });
    return Array.from(locations);
  };

  // Function to create MenuItems for locations
  const createMenuItemsForLocations = (): JSX.Element[] => {
    const locations = getLocations();
    const menuItems: JSX.Element[] = [];
    // Include empty selection as first value
    menuItems.push(
      <MenuItem key="empty" value="">
        <em>{t("filtering.no_location")}</em>
      </MenuItem>
    );

    Array.from(locations).map((location, index) =>
      menuItems.push(
        <MenuItem key={index} value={location}>
          {location}
        </MenuItem>
      )
    );
    return menuItems;
  };

  const handleOpenDialog = (): void => {
    setFilteringDialog(true);
  };

  const handleCloseDialog = (): void => {
    setFilteringDialog(false);
  };

  // Function to update filter criteria state
  const updateCriteria = (newCriteria: Partial<FilterCriteria>): void => {
    // Combine the existing filter criteria with the new criteria
    const updatedCriteria: FilterCriteria = {
      ...filterCriteria, // Include the previous criteria
      ...newCriteria // Include the new criteria
    };
    setFilterCriteria(updatedCriteria);
  };

  const handleParticipationChange = (): void => {
    const newCriteria: Partial<FilterCriteria> = {
      participation: !filterCriteria.participation
    };
    updateCriteria(newCriteria);
  };

  const handleStartDateChange = (date: Dayjs | null): void => {
    updateCriteria({
      startDate: date
    });
  };

  const handleEndDateChange = (date: Dayjs | null): void => {
    updateCriteria({
      endDate: date
    });
  };

  const handleTournamentTypeChange = (tournamentType: TournamentType): void => {
    setTournamentTypeSelections((prevSelections) => ({
      ...prevSelections,
      [tournamentType]: !prevSelections[tournamentType]
    }));

    const prevTourCriteria = filterCriteria.tournamentTypes;
    updateCriteria({
      tournamentTypes: prevTourCriteria.includes(tournamentType)
        ? prevTourCriteria.filter((type) => type !== tournamentType)
        : [...prevTourCriteria, tournamentType]
    });
  };

  const handleCategoryChange = (category: Category): void => {
    setCategorySelections((prevSelections) => ({
      ...prevSelections,
      [category]: !prevSelections[category]
    }));

    const prevCatCriteria = filterCriteria.categories;
    updateCriteria({
      categories: prevCatCriteria.includes(category)
        ? prevCatCriteria.filter((cat: Category) => cat !== category)
        : [...prevCatCriteria, category]
    });
  };

  const handleLocationChange = (event: SelectChangeEvent<string>): void => {
    updateCriteria({
      location: event.target.value
    });
  };

  // Function to apply filters when the user clicks the filter button
  const handleFilterClick = (): void => {
    const filteredTournaments = applyFilters();
    // Store updated filter data in session storage
    sessionStorage.setItem("tournamentFilters", JSON.stringify(filterCriteria));
    sessionStorage.setItem(
      "filteredTournaments",
      JSON.stringify(filteredTournaments)
    );
    handleFilteredTournaments(filteredTournaments, true);
  };

  const applyFilters = (): Tournament[] => {
    let filtered: Tournament[] = getOriginalTournamentData();

    if (filterCriteria.participation) {
      if (userId !== undefined) {
        filtered = filterByParticipation(filtered, userId);
      }
    }
    if (filterCriteria.tournamentTypes.length > 0) {
      filtered = filterByTournamentType(
        filtered,
        filterCriteria.tournamentTypes
      );
    }
    if (filterCriteria.categories.length > 0) {
      filtered = filterByCategory(filtered, filterCriteria.categories);
    }
    if (filterCriteria.location !== "") {
      filtered = filterByLocation(filtered, filterCriteria.location);
    }
    // Apply filter by time in any case, nulls are also handled by filterByTime
    filtered = filterByTime(
      filtered,
      filterCriteria.startDate,
      filterCriteria.endDate
    );
    return filtered;
  };

  return (
    <div>
      <Button onClick={handleOpenDialog}>{t("buttons.filter")}</Button>

      <Dialog open={filteringDialog} onClose={handleCloseDialog}>
        <DialogTitle variant="h5">{t("filtering.options")}</DialogTitle>
        <DialogContent>
          {/* this needs to be made visible only for logged in user */}
          {isAuthenticated && (
            <Box>
              <Typography variant="h6">
                {t("filtering.participation")}
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filterCriteria.participation}
                    onChange={handleParticipationChange}
                  />
                }
                label={t("filtering.user_participates")}
              />
            </Box>
          )}
          <Typography variant="h6">{t("filtering.by_time")}</Typography>
          <DateRangePicker
            startDate={filterCriteria.startDate}
            endDate={filterCriteria.endDate}
            onStartDateChange={handleStartDateChange}
            onEndDateChange={handleEndDateChange}
          />

          <Box display="flex" alignItems="center" marginBottom="10px">
            <Typography variant="h6" style={{ marginRight: "10px" }}>
              {t("filtering.by_location")}
            </Typography>
            <Select
              value={filterCriteria.location}
              onChange={handleLocationChange}
              style={{ marginBottom: "10px" }}
            >
              {createMenuItemsForLocations()}
            </Select>
          </Box>

          <FormGroup>
            <Typography variant="h6">
              {t("filtering.by_tournament_type")}
            </Typography>
            {tournamentTypeOptions.map(([type, localizationKey]) => (
              <FormControlLabel
                key={type}
                control={
                  <Checkbox
                    checked={tournamentTypeSelections[type]}
                    onChange={() => {
                      handleTournamentTypeChange(type);
                    }}
                  />
                }
                label={t(localizationKey)}
              />
            ))}

            <Typography variant="h6">
              {t("filtering.by_tournament_category")}
            </Typography>
            {categoryOptions.map(([category, localizationKey]) => (
              <FormControlLabel
                key={category}
                control={
                  <Checkbox
                    checked={categorySelections[category]}
                    onChange={() => {
                      handleCategoryChange(category);
                    }}
                  />
                }
                label={t(localizationKey)}
              />
            ))}
          </FormGroup>

          <Box display="flex" justifyContent={"space-evenly"}>
            <Button
              color="error"
              variant="outlined"
              onClick={() => {
                handleCloseDialog();
              }}
            >
              {t("buttons.cancel_button")}
            </Button>

            <Button
              color="secondary"
              variant="outlined"
              onClick={() => {
                resetFilters();
              }}
            >
              {t("buttons.reset")}
            </Button>

            <Button
              color="success"
              variant="outlined"
              onClick={() => {
                handleFilterClick();
                handleCloseDialog();
              }}
            >
              {t("buttons.filter")}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FilterTournaments;
