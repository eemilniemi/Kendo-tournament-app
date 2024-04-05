import React, { useState } from "react";
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
import type {
  Tournament,
  TournamentType,
  Category,
  FilterCriteria
} from "types/models";
import DateRangePicker from "./TournamentListing/DateRangePicker";
import type { Dayjs } from "dayjs";

interface FilterTournamentsProps {
  tournaments: Tournament[];
  handleFilteredTournaments: (filteredTournaments: Tournament[]) => void;
  filtersApplied: boolean;
  filterCriteria: FilterCriteria;
  updateFilterCriteria: (newCriteria: FilterCriteria) => void;
}

const FilterTournaments: React.FC<FilterTournamentsProps> = ({
  tournaments,
  handleFilteredTournaments,
  filtersApplied,
  filterCriteria,
  updateFilterCriteria
}) => {
  const { t } = useTranslation();
  const [filteringDialog, setFilteringDialog] = useState(false);
  const { userId, isAuthenticated } = useAuth();

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

  // Function to reset all selections from filter dialog
  const resetFilters = (): void => {
    // Filter criteria state back to original
    updateFilterCriteria({
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
    // return back to original tournaments list state
    handleFilteredTournaments(tournaments);
  };

  // Function to create MenuItems for locations
  const createMenuItemsForLocations = (
    tournaments: Tournament[]
  ): JSX.Element[] => {
    // Create a Set to avoid duplicate locations
    const locations = new Set<string>();

    tournaments.forEach((tournament) => {
      locations.add(tournament.location);
    });

    return Array.from(locations).map((location, index) => (
      <MenuItem key={index} value={location}>
        {location}
      </MenuItem>
    ));
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

    // Call the updateFilterCriteria function with the updated criteria
    updateFilterCriteria(updatedCriteria);
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
    handleFilteredTournaments(filteredTournaments);
  };

  const applyFilters = (): Tournament[] => {
    let filtered: Tournament[] = [...tournaments];

    if (filterCriteria.participation) {
      if (userId !== undefined) {
        filtered = filterByParticipation(filtered, userId);
      }
    }
    if (filterCriteria.tournamentTypes.length > 0) {
      filtered = filterByTournamentType(
        tournaments,
        filterCriteria.tournamentTypes
      );
    }
    if (filterCriteria.categories.length > 0) {
      filtered = filterByCategory(filtered, filterCriteria.categories);
    }
    if (filterCriteria.startDate !== null && filterCriteria.endDate !== null) {
      filtered = filterByTime(
        filtered,
        filterCriteria.startDate,
        filterCriteria.endDate
      );
    }
    if (filterCriteria.location !== "") {
      filtered = filterByLocation(filtered, filterCriteria.location);
    }
    return filtered;
  };

  return (
    <div>
      <Button onClick={handleOpenDialog}>{t("filtering.options")}</Button>

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
              {createMenuItemsForLocations(tournaments)}
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

          <Button
            onClick={() => {
              handleFilterClick();
              handleCloseDialog();
            }}
          >
            {t("buttons.filter")}
          </Button>

          <Button
            onClick={() => {
              resetFilters();
            }}
          >
            {t("buttons.reset")}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FilterTournaments;
