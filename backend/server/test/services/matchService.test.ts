import { describe, beforeEach, afterEach } from "mocha";
import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";
import MatchModel, { MatchPlayer } from "../../src/models/matchModel.ts";
import { MatchService } from "../../src/services/matchService.ts";
import NotFoundError from "../../src/errors/NotFoundError.ts";
import BadRequestError from "../../src/errors/BadRequestError.ts";
import { Types } from "mongoose";
import { CreateMatchRequest, AddPointRequest } from "../../src/models/requestModel.ts";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('MatchService', () => {
    let matchService: MatchService;

    beforeEach(() => {
        matchService = new MatchService();
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('createMatch', () => {
        it('should create a match successfully', async () => {
            const matchRequest: CreateMatchRequest = {
                tournamentId: new Types.ObjectId().toString(),
                matchType: "group",
                players: [{id: new Types.ObjectId().toString(), color: "white"}, {id: new Types.ObjectId().toString(), color: "red"}],
                matchTime: 300000
            };
            const expectedMatch = {
                ...matchRequest,
                id: new Types.ObjectId(),
                toObject: () => ({ ...matchRequest }) // Ensuring toObject is present
            };

            sinon.stub(MatchModel, 'create').resolves(expectedMatch);

            const result = await matchService.createMatch(matchRequest);
            expect(result).to.include(matchRequest);
        });

        it('should throw an error when required fields are missing', async () => {
            const matchRequest: Partial<CreateMatchRequest> = {}; // Missing required fields
            sinon.stub(MatchModel, 'create').rejects(new Error("Required fields missing"));

            await expect(matchService.createMatch(matchRequest as CreateMatchRequest))
                .to.be.rejectedWith(Error);
        });
    });

    describe('getMatchById', () => {
        it('should return a match by ID', async () => {
            const matchId = new Types.ObjectId();
            const matchData = {
                id: matchId,
                type: "group",
                players: [],
                matchTime: 180000,
                toObject: () => ({ id: matchId })
            };

            sinon.stub(MatchModel, 'findById').returns({
                exec: sinon.stub().resolves(matchData) 
            });

            const result = await matchService.getMatchById(matchId.toString());
            expect(result).to.have.property('id').that.equals(matchId);
        });

        it('should throw NotFoundError if no match is found', async () => {
            const matchId = new Types.ObjectId();
            sinon.stub(MatchModel, 'findById').returns({
                exec: sinon.stub().resolves(null) 
            });

            await expect(matchService.getMatchById(matchId.toString()))
                .to.be.rejectedWith(NotFoundError);
        });
    });

    describe('startTimer', () => {
        it('should throw BadRequestError if match is already finished', async () => {
            const matchId = new Types.ObjectId();
            const matchData = {
                id: matchId,
                winner: new Types.ObjectId(),
                timerStartedTimestamp: null
            };

            sinon.stub(MatchModel, 'findById').returns({
                exec: sinon.stub().resolves(matchData)
            });

            await expect(matchService.startTimer(matchId.toString()))
                .to.be.rejectedWith(BadRequestError);
        });
    });

    describe('addPointToMatchById', () => {
        it('should throw BadRequestError if match is already finished', async () => {
            const matchId = new Types.ObjectId();
            const pointRequest: AddPointRequest = {
                pointType: "men",
                pointColor: "red"
            };
            const matchData = {
                id: matchId,
                winner: new Types.ObjectId()
            };

            sinon.stub(MatchModel, 'findById').returns({
                exec: sinon.stub().resolves(matchData)
            });

            await expect(matchService.addPointToMatchById(matchId.toString(), pointRequest))
                .to.be.rejectedWith(BadRequestError);
        });
    });

});
