import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "api/axios";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import { useTranslation } from "react-i18next";
import Paper from "@mui/material/Paper";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { Grid, Link, Typography } from "@mui/material";
import routePaths from "routes/route-paths";
import { useAuth } from "context/AuthContext";
import type { Category, Tournament, TournamentType } from "types/models";

const generateTable = (
  tournament: Tournament,
  t: (key: string) => string
): React.ReactNode => {
  const tableHeaders = [
    t("user_info_labels.name"),
    t("user_info_labels.club"),
    t("user_info_labels.email_address"),
    t("user_info_labels.phone_number"),
    t("user_info_labels.suomisport_id"),
    t("user_info_labels.guardians_email")
  ] as const;

  // Generate table with player information
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {tableHeaders.map((header) => (
              <TableCell key={header} aria-label={`header-${header}`}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {header}
                </Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {tournament.players.map((player, index) => (
            <TableRow key={player.id} aria-label={`player-${index}`}>
              <TableCell aria-label={`cell-name-${index}`}>
                <Typography>
                  {`${player.firstName} ${player.lastName}`}
                </Typography>
              </TableCell>
              <TableCell aria-label={`cell-club-${index}`}>
                <Typography>{player.clubName ?? "-"}</Typography>
              </TableCell>
              <TableCell aria-label={`cell-email-${index}`}>
                <Typography>{player.email ?? "-"}</Typography>
              </TableCell>
              <TableCell aria-label={`cell-phone-${index}`}>
                <Typography>{player.phoneNumber ?? "-"}</Typography>
              </TableCell>
              <TableCell aria-label={`cell-suomisportId-${index}`}>
                <Typography>{player.suomisportId ?? "-"}</Typography>
              </TableCell>
              <TableCell aria-label={`cell-underage-${index}`}>
                <Typography>
                  {player.underage ? player.guardiansEmail : "-"}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const OwnTournament: React.FC = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const [tournament, setTournament] = useState<Tournament | undefined>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userId } = useAuth();

  const getTypeTranslationKey = (type: TournamentType): string => {
    switch (type) {
      case "Round Robin":
        return "types.round_robin";
      case "Playoff":
        return "types.playoff";
      case "Preliminary Playoff":
        return "types.preliminary_playoff";
      default:
        return "";
    }
  };

  // Function to translate tournament category to key
  const getCategoryTranslationKey = (type: Category): string => {
    switch (type) {
      case "championship":
        return "create_tournament_form.championship";
      case "hobby":
        return "create_tournament_form.hobby";
      case "league":
        return "create_tournament_form.league";
      default:
        return "";
    }
  };

  useEffect(() => {
    const fetchTournaments = async (): Promise<void> => {
      try {
        const tournamentsData = await api.tournaments.getAll();
        const foundTournament = tournamentsData.find(
          (tournament) => tournament.id === tournamentId
        );
        if (foundTournament !== undefined) {
          // Check if the current user is the creator of the tournament
          const isUserTheCreator = foundTournament.creator.id === userId;
          // If the current user is not the creator, redirect to home page
          if (!isUserTheCreator) {
            navigate(routePaths.homeRoute);
          }
        }
        setTournament(foundTournament ?? undefined);
      } catch (error) {
        // Error handling can be added here if necessary
      }
    };

    void fetchTournaments();
  }, [tournamentId]);

  // Render tournament details if available
  if (tournament !== undefined)
    return (
      <Container
        component="main"
        sx={{ display: "flex", flexDirection: "column", gap: "8px" }}
      >
        <Grid container alignItems="center" spacing={4}>
          <Grid item>
            <Typography
              variant="h4"
              className="header"
              fontWeight="bold"
              marginBottom="12px"
            >
              {tournament.name}
            </Typography>
          </Grid>
        </Grid>
        <Box>
          <Typography variant="subtitle1">
            <strong>{t("created_tournament.location_header")}:</strong>{" "}
            {tournament.location}
          </Typography>
        </Box>
        <Box>
          <Typography variant="subtitle1">
            <strong>{t("created_tournament.date_header")}:</strong>{" "}
            {new Date(tournament.startDate).toLocaleString("fi")} -{" "}
            {new Date(tournament.endDate).toLocaleString("fi")}
          </Typography>
        </Box>
        <Box>
          <Typography variant="subtitle1">
            <strong>{t("created_tournament.description")}:</strong>{" "}
            {tournament.description}
          </Typography>
        </Box>
        {tournament.linkToSite !== undefined &&
          tournament.linkToSite.trim() !== "" && (
            <Box>
              <Typography variant="subtitle1">
                <strong>{t("created_tournament.link_to_site_header")}:</strong>{" "}
                <Link href={tournament.linkToSite}>
                  {tournament.linkToSite}
                </Link>
              </Typography>
            </Box>
          )}
        {tournament.linkToPay !== undefined &&
          tournament.linkToPay.trim() !== "" && (
            <Box>
              <Typography variant="subtitle1">
                <strong>
                  {t("created_tournament.link_to_payment_header")}:
                </strong>{" "}
                <Link href={tournament.linkToPay}>{tournament.linkToPay}</Link>
              </Typography>
            </Box>
          )}
        <Box>
          <Typography variant="subtitle1">
            <strong>{t("created_tournament.match_time")}:</strong>{" "}
            {tournament.matchTime === 180000
              ? t("create_tournament_form.3_min")
              : tournament.matchTime === 240000
              ? t("create_tournament_form.4_min")
              : tournament.matchTime === 300000
              ? t("create_tournament_form.5_min")
              : ""}
          </Typography>
        </Box>
        <Box>
          <Typography variant="subtitle1">
            <strong>{t("created_tournament.type_header")}:</strong>{" "}
            {t(getTypeTranslationKey(tournament.type))}
          </Typography>
        </Box>
        <Box>
          <Typography variant="subtitle1">
            <strong>{t("created_tournament.category_header")}:</strong>{" "}
            {t(getCategoryTranslationKey(tournament.category))}
          </Typography>
        </Box>
        <Box>
          <Typography variant="subtitle1">
            <strong>{t("created_tournament.max_players")}: </strong>{" "}
            {tournament.maxPlayers}
          </Typography>
        </Box>
        <br />
        {/* There are players in the tournament, generate table if user is logged in */}
        {tournament.players.length > 0 && (
          <React.Fragment>
            <Typography variant="body1" className="header" fontWeight="bold">
              {t("created_tournament.signed_up")}
            </Typography>
            {generateTable(tournament, t)}
          </React.Fragment>
        )}
        {/* No players in the tournament */}
        {tournament.players.length === 0 && (
          <Typography variant="body1" className="header" fontWeight="bold">
            {t("created_tournament.no_players_signed_up")}
          </Typography>
        )}
      </Container>
    );
};

export default OwnTournament;
