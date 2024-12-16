# Kendo Tournament App Manual Testing Scripts

This module contains tournament creation scripts for manual testing purposes.

### Prerequisites

- **Node.js** (v18.x or higher)
- The database and backend need to be running

### Set up

- Install dependencies:
  ```bash
  npm install
  ```
- Create a `.env` with your backend API url. You can do this by copying `.env.example` and changing the URL (if necessary):
  ```bash
  cp `.env.example` `.env`
  ```

### Using the scripts

- The scripts are located in the `example_scripts` directory
  - One script included for each currently available tournament type
  - The scripts set the tournament to begin in 10 seconds
- You can create your own scripts inside the `local_scripts` directory if you don't want to bloat the remote repository with them
- You can run a script in your terminal with
    ```bash
    Node <filepath>
    ```
- The example scripts accept command line arguments to modify some key values:
  - playoff: player count
  - preliminary playoff: player count, group size, players to playoffs per group
  - round robin: player count
  - team round robin: player count, number of teams, players per team
  - swiss: player count, number of rounds

For example, to create a team round robin tournament with 16 players, 2 teams, and 8 players per team, run:
```bash
Node example_scripts/team_round_robin.js 16 2 8
```