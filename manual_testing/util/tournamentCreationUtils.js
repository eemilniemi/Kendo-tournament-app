import axios from "axios";
import dotenv from 'dotenv';

dotenv.config();

const baseUrl = process.env.API_BASEURL;

export async function registerUsers(numberOfUsers) {

  let credentials = [];

  for (let i = 0; i < numberOfUsers; i++) {
    try {
      const userRequest = {
        "email": `testaaja${i}@kendo.app`,
        "firstName": `testaaja${i}`,
        "lastName": `sukunimi${i}`,
        "phoneNumber": "0000000001",
        "password": "salasana123",
        "inNationalTeam": false,
        "underage": false
      }
      const registerResponse = await axios.post(`${baseUrl}/user/register`, userRequest);

      console.log(`registering user ${i}:`, registerResponse.status, registerResponse.statusText);

    } catch (error) {
      console.error(`An error occurred in registering user ${i}\n(user might already exist)`);
    } finally {
      credentials.push({
        "email": `testaaja${i}@kendo.app`,
        "password": "salasana123"
      });
    }
  }

  return credentials;
}

export async function login(credentials) {

  let sessions = [];

  for (let creds of credentials) {
    try {
      const loginResponse = await axios.post(`${baseUrl}/auth/login`,
        creds,
        {
          withCredentials: true
        }
      );

      const c = loginResponse.headers['set-cookie'];
      let cookies = "";
      if (c !== undefined) {
        cookies = c.join(" ");
      }

      const userId = loginResponse.data["userId"];

      sessions.push({
        cookies: cookies,
        userId: userId
      });

    } catch (error) {
      console.error(`An error occurred logging in with ${creds.email}`);
    }
  }

  return sessions;
}

export async function createTournament(cookies, tournament) {
  let tournamentId = "";
  try {
    const tournamentResponse = await axios.post(`${baseUrl}/tournaments`, tournament, {
      withCredentials: true,
      headers: {
        Cookie: cookies
      }
    });

    console.log("tournament:", tournamentResponse.status, tournamentResponse.statusText);

    tournamentId = tournamentResponse.data["id"];
  } catch (error) {
    console.error(`An error occurred while creating tournament`);
  }

  return tournamentId;
}

export async function signUpToTournament(tournamentId, sessions) {
  for (let i in sessions) {
    const cookies = sessions[i].cookies;
    const userId = sessions[i].userId;

    try {
      const registerResponse = await axios.put(`${baseUrl}/tournaments/${tournamentId}/sign-up`, {
        "playerId": userId
      }, {
        withCredentials: true,
        headers: {
          Cookie: cookies
        }
      });

      console.log(`Signing up user ${i}:`, registerResponse.status, registerResponse.statusText);
    } catch (error) {
      console.error(`An error occurred signing up with user ${i}`);
    }
  }

}