import React from "react";
import { NavLink } from "react-router-dom";

import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";

import type { NavigationItem, NavigationData } from "./navigation-bar";

interface Props {
  container: (() => HTMLElement) | undefined;
  toggleDrawer: () => void;
  drawerIsOpen: boolean;
  navigationItems: NavigationData;
  drawerTitle: string;
}

const NavigationDrawer: React.FC<Props> = (props) => {
  const {
    toggleDrawer,
    drawerIsOpen,
    container,
    navigationItems,
    drawerTitle
  } = props;

  const drawer = (
    <Box
      onClick={toggleDrawer}
      sx={{ textAlign: "center", bgcolor: "white", height: "100%" }}
    >
      {/* Navigation List */}
      <List>
        {navigationItems.map((item: NavigationItem) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={NavLink}
              to={item.link}
              sx={{
                textAlign: "left",
                color: "black",
                "&.active": {
                  color: "#B83B39", // Darker shade for active
                  fontWeight: "bold"
                },
                "&:hover": {
                  bgcolor: "#d5d3d2" // Slightly darker for hover effect
                },
                minHeight: 60
              }}
            >
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: "15px", // Increased font size
                  color: "inherit",
                  fontWeight: "inherit"
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      {/* Drawer Title */}
      <Box
        sx={{
          position: "absolute",
          bottom: 20,
          width: "100%",
          textAlign: "center"
        }}
      >
        <Typography
          variant="h6"
          sx={{ color: "#B83B39", padding: "16px", fontWeight: "bold" }}
        >
          {drawerTitle}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <nav>
      <Drawer
        container={container}
        variant="temporary"
        open={drawerIsOpen}
        onClose={toggleDrawer}
        ModalProps={{
          keepMounted: true // Better open performance on mobile.
        }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 280,
            bgcolor: "#D01C1C", // Main drawer background color
            color: "#fff",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)"
          }
        }}
      >
        {drawer}
      </Drawer>
    </nav>
  );
};

export default NavigationDrawer;
