import {
  registerUsers,
  login,
  createTournament,
  createTeams,
  signUpToTeams
} from "../util/tournamentCreationUtils.js";

const now = new Date();
const tenSecondsFromNow = new Date(now.getTime() + 10 * 1000);
const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

const timestamp = now.toLocaleTimeString();

let playerCount = 8;
let numberOfTeams = 2;

const args = process.argv.slice(2);

if (args[0] !== undefined) {
  playerCount = parseInt(args[0]);
}

if (args[1] !== undefined) {
  numberOfTeams = parseInt(args[1]);
}

let playersPerTeam = playerCount / 2

if (args[2] !== undefined) {
  playersPerTeam = parseInt(args[2]);
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
  "numberOfTeams": numberOfTeams,
  "paid": false,
  "password": "",
  "passwordEnabled": false,
  "playersPerTeam": playersPerTeam,
  "startDate": tenSecondsFromNow.toUTCString(),
  "type": "Team Round Robin"
};

async function run() {
  let credentials = await registerUsers(playerCount);
  let sessions = await login(credentials);
  let tournamentId = await createTournament(sessions[0].cookies, tournament);
  let teamIds = await createTeams(sessions[0].cookies, tournamentId, numberOfTeams);
  await signUpToTeams(tournamentId, sessions, teamIds);
}

run();