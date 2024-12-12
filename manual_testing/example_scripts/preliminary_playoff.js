import {
  registerUsers, login, createTournament, signUpToTournament
} from "../util/tournamentCreationUtils.js"

const now = new Date();
const tenSecondsFromNow = new Date(now.getTime() + 10 * 1000);
const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

const timestamp = now.toLocaleTimeString();

let playerCount = 8;

const args = process.argv.slice(2);

if (args[0] !== undefined) {
  playerCount = parseInt(args[0]);
}

let groupsSizePreference = playerCount / 2;

if (args[1] !== undefined) {
  groupsSizePreference = parseInt(args[1]);
}

let playersToPlayoffsPerGroup = groupsSizePreference / 2;

if (args[2] !== undefined) {
  playersToPlayoffsPerGroup = parseInt(args[2]);
}

const tournament = {
  "category": "hobby",
  "description": "Dev test tournament",
  "differentOrganizer": false,
  "endDate": threeDaysFromNow.toUTCString(),
  "linkToPay": "",
  "linkToSite": "",
  "location": "Tampere",
  "matchTime": 300000,
  "maxPlayers": playerCount,
  "name": `test ${timestamp}`,
  "numberOfCourts": 1,
  "numberOfTeams": 0,
  "paid": false,
  "password": "",
  "passwordEnabled": false,
  "playersPerTeam": 0,
  "startDate": tenSecondsFromNow.toUTCString(),
  "type": "Preliminary Playoff",
  "playersToPlayoffsPerGroup": playersToPlayoffsPerGroup,
  "groupsSizePreference": groupsSizePreference
};

async function run() {
  let credentials = await registerUsers(playerCount);
  let sessions = await login(credentials);
  let tournamentId = await createTournament(sessions[0].cookies, tournament);
  await signUpToTournament(tournamentId, sessions);
}

run();