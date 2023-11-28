import {
  Route,
  Controller,
  Get,
  Path,
  Tags,
  Security,
  Body,
  Post,
  Put
} from "tsoa";
import { TournamentService } from "../services/tournamentService.js";
import { Tournament, AddPlayerRequest } from "../models/tournamentModel.js";
import { ObjectIdString } from "../models/requestModel.js";

@Route("tournament")
export class TournamentController extends Controller {
  @Security("jwt")
  @Get("{id}")
  @Tags("Tournament")
  public async getTournament(@Path() id: ObjectIdString): Promise<Tournament> {
    this.setStatus(200);
    return await this.service.getTournamentById(id);
  }

  @Security("jwt")
  @Post("create")
  @Tags("Tournament")
  public async createTournament(
    @Body() tournamentData: Tournament
  ): Promise<Tournament> {
    this.setStatus(201); // Created status

    return await this.service.createTournament(tournamentData);
  }

  @Security("jwt")
  @Put("{tournamentId}/addPlayer")
  @Tags("Tournament")
  public async addPlayerToTournament(
    @Path() tournamentId: ObjectIdString,
    @Body() requestBody: AddPlayerRequest
  ): Promise<Tournament> {
    const result = await this.service.addPlayerToTournament(
      tournamentId,
      requestBody.playerId
    );
    this.setStatus(200); // OK status
    return result;
  }

  private get service(): TournamentService {
    return new TournamentService();
  }
}
