import NotFoundError from "../errors/NotFoundError.js";
import {
  TournamentModel,
  type Tournament,
  type UnsavedMatch,
  TournamentType
} from "../models/tournamentModel.js";
import UserModel, { type User } from "../models/userModel.js";
import BadRequestError from "../errors/BadRequestError.js";
import { type HydratedDocument, Types } from "mongoose";
import MatchModel, {
  type MatchType,
  type Match,
  type MatchPlayer
} from "../models/matchModel.js";
import {
  type EditTournamentRequest,
  type CreateTournamentRequest
} from "../models/requestModel.js";

export class TournamentService {
  public async getTournamentById(id: string): Promise<Tournament> {
    const tournament = await TournamentModel.findById(id)
      .populate<{ creator: User }>({ path: "creator", model: "User" })
      .populate<{ players: User[] }>({ path: "players", model: "User" })
      .populate<{
        matchSchedule: Match[];
      }>({
        path: "matchSchedule",
        model: "Match"
      })
      .exec();
    if (tournament === null || tournament === undefined) {
      throw new NotFoundError({
        message: "Tournament not found"
      });
    }

    return await tournament.toObject();
  }

  public async getAllTournaments(limit: number): Promise<Tournament[]> {
    const tournaments = await TournamentModel.find()
      .limit(limit)
      .populate<{ creator: User }>({ path: "creator", model: "User" })
      .populate<{ players: User[] }>({ path: "players", model: "User" })
      .populate<{
        matchSchedule: Match[];
      }>({
        path: "matchSchedule",
        model: "Match"
      })
      .exec();

    if (tournaments === null || tournaments === undefined) {
      throw new NotFoundError({
        message: "No tournaments found"
      });
    }

    return tournaments.map((tournament) => tournament.toObject());
  }

  public async createTournament(
    tournamentData: CreateTournamentRequest,
    creator: string
  ): Promise<Tournament> {
    await this.validateTournamentDetails(tournamentData, creator);

    const newTournament = await TournamentModel.create({
      ...tournamentData,
      creator
    });

    return await newTournament.toObject();
  }

  public async addPlayerToTournament(
    tournamentId: string,
    playerId: string
  ): Promise<void> {
    const tournament = await TournamentModel.findById(tournamentId).exec();

    if (tournament === null || tournament === undefined) {
      throw new NotFoundError({
        message: "Tournament not found"
      });
    }

    const player = await UserModel.findById(playerId).exec();
    if (player === null || player === undefined) {
      throw new NotFoundError({
        message: "Player not found"
      });
    }

    // Check if the player is already in the tournament
    if (tournament.players.includes(player.id)) {
      throw new BadRequestError({
        message: "Player already registered in the tournament"
      });
    }

    const currentDate = new Date();
    const startDate = new Date(tournament.startDate);
    if (currentDate > startDate) {
      throw new BadRequestError({
        message: `Cannot add new players as the tournament has already started on ${startDate.toDateString()}`
      });
    }

    if (tournament.players.length >= tournament.maxPlayers) {
      throw new BadRequestError({
        message: "Tournament has reached its maximum number of players"
      });
    }

    tournament.players.push(player.id);

    // Adding new player to preliminary requires redoing all groups and matches,
    // perhaps a better way would be possible?
    if (tournament.type === TournamentType.PreliminiaryPlayoff) {
      tournament.groups = this.dividePlayersIntoGroups(
        tournament.players as Types.ObjectId[],
        tournament.groupsSizePreference
      );
      await MatchModel.deleteMany({ tournamentId: tournament.id });

      tournament.matchSchedule = [];
    }
    await tournament.save();

    if (tournament.players.length > 1) {
      const newMatchIds = await this.generateTournamentSchedule(
        tournament,
        player.id
      );
      if (newMatchIds.length !== 0) {
        tournament.matchSchedule.push(...newMatchIds);
        await tournament.save();
      }
    }
    return await tournament.toObject();
  }

  public async addMatchToTournament(
    tournamentId: string,
    unsavedMatch: UnsavedMatch
  ): Promise<Tournament> {
    const tournament = await TournamentModel.findById(tournamentId).exec();
    if (tournament === null || tournament === undefined) {
      throw new NotFoundError({
        message: "Tournament not found"
      });
    }

    const currentDate = new Date();
    const startDate = new Date(tournament.startDate);
    if (currentDate > startDate) {
      throw new BadRequestError({
        message: `Cannot add new players as the tournament has already started on ${startDate.toDateString()}`
      });
    }

    for (const player of unsavedMatch.players) {
      // player.id is a String from the requestBody. conversion is necessary here.
      const playerId = new Types.ObjectId(player.id);

      if (!tournament.players.includes(playerId)) {
        const user = await UserModel.findById(playerId).exec();

        if (user === null || user === undefined) {
          throw new NotFoundError({
            message: "Player not found!"
          });
        }
        throw new BadRequestError({
          message: `Cannot create the match: Player: ${user.firstName} ${user.lastName} is not registered for this tournament.`
        });
      }
    }

    const newMatch = await MatchModel.create(unsavedMatch);
    tournament.matchSchedule.push(newMatch._id);
    await tournament.save();
    return await tournament.toObject();
  }

  public async updateTournamentById(
    tournamentId: string,
    requestBody: EditTournamentRequest,
    updaterId: string
  ): Promise<void> {
    const tournamentDoc = await this.getTournamentDocumentById(tournamentId);
    await this.validateTournamentDetails(
      requestBody,
      updaterId,
      true,
      tournamentDoc
    );

    // Apply the updates from requestBody to the tournament document
    tournamentDoc.set(requestBody);
    await tournamentDoc.save();
  }

  public async deleteTournamentById(tournamentId: string): Promise<void> {
    const result = await TournamentModel.deleteOne({
      _id: tournamentId
    }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundError({
        message: "Tournament not found or already deleted"
      });
    }
  }

  private async generateTournamentSchedule(
    tournament: Tournament,
    newPlayer: Types.ObjectId
  ): Promise<Types.ObjectId[]> {
    let matches: UnsavedMatch[] = [];
    switch (tournament.type) {
      case TournamentType.RoundRobin:
        matches = TournamentService.generateRoundRobinSchedule(
          tournament.players as Types.ObjectId[],
          newPlayer,
          tournament.id
        );
        break;
      case TournamentType.Playoff:
        matches = await this.generatePlayoffSchedule(
          tournament.players as Types.ObjectId[],
          tournament.matchSchedule as Types.ObjectId[],
          tournament.id
        );
        break;
      case TournamentType.PreliminiaryPlayoff:
        for (const group of tournament.groups) {
          const addedPlayers: Types.ObjectId[] = [];
          for (const player of group) {
            const groupMatches = TournamentService.generateRoundRobinSchedule(
              addedPlayers,
              player,
              tournament.id,
              "preliminary"
            );
            matches.push(...groupMatches);
            addedPlayers.push(player);
          }
        }
        break;
    }

    if (matches.length === 0) {
      return [];
    }
    const matchDocuments = await MatchModel.insertMany(matches);
    return matchDocuments.map((doc) => doc._id);
  }

  public static generateRoundRobinSchedule(
    playerIds: Types.ObjectId[],
    newPlayer: Types.ObjectId,
    tournament: Types.ObjectId,
    tournamentType: MatchType = "group",
    tournamentRound: number = 1
  ): UnsavedMatch[] {
    const matches: UnsavedMatch[] = [];
    for (const playerId of playerIds) {
      if (!playerId.equals(newPlayer)) {
        matches.push({
          players: [
            { id: newPlayer, points: [], color: "white" },
            { id: playerId, points: [], color: "red" }
          ],
          type: tournamentType,
          elapsedTime: 0,
          timerStartedTimestamp: null,
          tournamentRound,
          tournamentId: tournament
        });
      }
    }
    return matches;
  }

  private async generatePlayoffSchedule(
    playerIds: Types.ObjectId[],
    previousMatches: Types.ObjectId[],
    tournament: Types.ObjectId
  ): Promise<UnsavedMatch[]> {
    const matches: UnsavedMatch[] = [];
    const playerSet = new Set<string>();

    const matchDatas = await MatchModel.find({
      _id: { $in: previousMatches }
    }).exec();

    for (const matchData of matchDatas) {
      matchData.players.forEach((player) => {
        const playerAsMatchPlayer = player as MatchPlayer;
        if (
          playerAsMatchPlayer.id !== null &&
          playerAsMatchPlayer.id !== undefined
        ) {
          playerSet.add((player as MatchPlayer).id.toString());
        }
      });
    }
    const extraPlayers = [];
    for (const id of playerIds) {
      if (!playerSet.has(id.toString())) {
        extraPlayers.push(id);
      }
    }

    if (extraPlayers.length === 2) {
      matches.push({
        players: [
          { id: extraPlayers[0], points: [], color: "white" },
          { id: extraPlayers[1], points: [], color: "red" }
        ],
        type: "playoff",
        elapsedTime: 0,
        timerStartedTimestamp: null,
        tournamentRound: 1,
        tournamentId: tournament
      });
    }

    return matches;
  }

  private isPowerOfTwo(n: number): boolean {
    if (n <= 0) {
      return false;
    }
    return (n & (n - 1)) === 0;
  }

  private calculateRoundRobinMatches(playerCount: number): number {
    if (playerCount < 2) {
      throw new BadRequestError({
        message:
          "At least two players are required for a round robin tournament."
      });
    }
    return (playerCount * (playerCount - 1)) / 2;
  }

  private dividePlayersIntoGroups(
    players: Types.ObjectId[],
    preferredGroupSize: number
  ): Types.ObjectId[][] {
    const totalPlayers = players.length;
    const numGroups = Math.ceil(totalPlayers / preferredGroupSize);

    const groups: Types.ObjectId[][] = Array.from(
      { length: numGroups },
      () => []
    );

    for (let i = 0; i < totalPlayers; i++) {
      const currentPlayer = players[i];
      const groupIndex = i % numGroups;

      groups[groupIndex].push(currentPlayer);
    }

    return groups;
  }

  private async getTournamentDocumentById(
    id: string
  ): Promise<HydratedDocument<Tournament>> {
    const tournament = await TournamentModel.findById(id).exec();

    if (tournament === null || tournament === undefined) {
      throw new NotFoundError({
        message: "Tournament not found"
      });
    }

    return tournament;
  }

  private async validateTournamentDetails(
    tournamentDetails: CreateTournamentRequest | EditTournamentRequest,
    creatorOrUpdaterId: string,
    isUpdate: boolean = false,
    existingTournamentDoc?: HydratedDocument<Tournament>
  ): Promise<void> {
    // If the tournament is of type playoff, validate maax players
    if (
      tournamentDetails.type === TournamentType.Playoff &&
      tournamentDetails.maxPlayers !== undefined &&
      !this.isPowerOfTwo(tournamentDetails.maxPlayers)
    ) {
      throw new BadRequestError({
        message:
          "Invalid number of players for a playoff tournament. The total number of players must be a power of 2."
      });
    } else if (
      tournamentDetails.type === TournamentType.RoundRobin &&
      tournamentDetails.maxPlayers !== undefined
    ) {
      this.calculateRoundRobinMatches(tournamentDetails.maxPlayers);
    }

    // Validate startDate and endDate
    if (
      tournamentDetails.startDate !== undefined &&
      tournamentDetails.endDate !== undefined
    ) {
      const startDate = new Date(tournamentDetails.startDate);
      const endDate = new Date(tournamentDetails.endDate);

      if (startDate >= endDate) {
        throw new BadRequestError({
          message:
            "Invalid tournament dates. The start date must be before the end date."
        });
      }
    }

    // If creating a new tournament or differentOrganizer is true during an update, validate organizer details
    if (tournamentDetails.differentOrganizer === false) {
      const organizer = await UserModel.findById(creatorOrUpdaterId).exec();

      if (organizer === null) {
        throw new NotFoundError({
          message: "No user data found for the organizer."
        });
      }

      tournamentDetails.organizerEmail = organizer.email;
      tournamentDetails.organizerPhone = organizer.phoneNumber;
    }

    // Additional checks for updates can be added here, e.g., ensuring the tournament hasn't started
    if (isUpdate && existingTournamentDoc !== undefined) {
      const currentDate = new Date();
      const tournamentStartDate = new Date(existingTournamentDoc.startDate);
      if (currentDate >= tournamentStartDate) {
        throw new BadRequestError({
          message: "Cannot update the tournament after it has started."
        });
      }
    }
  }
}
