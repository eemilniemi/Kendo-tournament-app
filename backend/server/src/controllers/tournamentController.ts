import {
  Route,
  Controller,
  Get,
  Path,
  Tags,
  Security,
  Body,
  Post,
  Put,
  Request,
  Query,
  Delete
} from "tsoa";
import { TournamentService } from "../services/tournamentService.js";
import { UnsavedMatch } from "../models/tournamentModel.js";
import type { Tournament } from "../models/tournamentModel.js";
import {
  CreateTournamentRequest,
  EditTournamentRequest,
  ObjectIdString,
  SignupForTournamentRequest
} from "../models/requestModel.js";
import type { JwtPayload } from "jsonwebtoken";
import type * as express from "express";

@Route("tournaments")
export class TournamentController extends Controller {
  /*
   * Get tournament details from a specific tournament.
   */
  @Get("{tournamentId}")
  @Tags("Tournaments")
  public async getTournament(
    @Path() tournamentId: ObjectIdString
  ): Promise<Tournament> {
    this.setStatus(200);
    return await this.service.getTournamentById(tournamentId);
  }

  /*
   * Get all tournaments.
   */
  @Get()
  @Tags("Tournaments")
  public async getTournaments(
    @Query() limit: number = 20
  ): Promise<Tournament[]> {
    this.setStatus(200);
    return await this.service.getAllTournaments(limit);
  }

  /*
   * Create a new tournament.
   */
  @Post()
  @Tags("Tournaments")
  @Security("jwt")
  public async createTournament(
    @Request() request: express.Request & { user: JwtPayload },
    @Body() tournamentData: CreateTournamentRequest
  ): Promise<Tournament> {
    this.setStatus(201);

    const creator = request.user.id;

    return await this.service.createTournament(tournamentData, creator);
  }

  /*
   *  Add a player to a tournament.
   */
  @Put("{tournamentId}/sign-up")
  @Tags("Tournaments")
  @Security("jwt")
  public async signUpForTournament(
    @Path() tournamentId: ObjectIdString,
    @Body() requestBody: SignupForTournamentRequest
  ): Promise<void> {
    this.setStatus(204);
    await this.service.addPlayerToTournament(
      tournamentId,
      requestBody.playerId
    );
  }

  /*
   *  Remove a player from a tournament.
   */
  @Delete("{tournamentId}/cancel-signup")
  @Tags("Tournaments")
  @Security("jwt")
  public async cancelSignup(
    @Path() tournamentId: ObjectIdString,
    @Body() request: { playerId: ObjectIdString }
  ): Promise<void> {
    this.setStatus(204);
    await this.service.removePlayerFromTournament(
      tournamentId,
      request.playerId
    );
  }

  /*
   *  Add a match to a tournament.
   */
  @Put("{tournamentId}/manual-schedule")
  @Tags("Tournaments")
  @Security("jwt")
  public async manualSchedule(
    @Path() tournamentId: ObjectIdString,
    @Body() requestBody: UnsavedMatch
  ): Promise<Tournament> {
    const result = await this.service.addMatchToTournament(
      tournamentId,
      requestBody
    );
    this.setStatus(201);
    return result;
  }

  /*
  *  Update tournament details.
  */
  @Put("{tournamentId}")
  @Tags("Tournaments")
  @Security("jwt")
  public async updateTournament(
    @Request() request: express.Request & { user: JwtPayload },
    @Path() tournamentId: ObjectIdString,
    @Body() requestBody: EditTournamentRequest
  ): Promise<void> {
    const updaterId = request.user.id;

    this.setStatus(204);
    await this.service.updateTournamentById(
      tournamentId,
      requestBody,
      updaterId
    );
  }

  /*
  * Delete a tournament
  */
  @Delete("{tournamentId}")
  @Tags("Tournaments")
  @Security("jwt")
  public async deleteTournament(
    @Path() tournamentId: ObjectIdString
  ): Promise<void> {
    this.setStatus(204);
    await this.service.deleteTournamentById(tournamentId);
  }

  private get service(): TournamentService {
    return new TournamentService();
  }
}
