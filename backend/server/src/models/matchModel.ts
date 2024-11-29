import mongoose, { Schema, type Types } from "mongoose";
import type { Tournament } from "./tournamentModel";

export type PlayerColor = "red" | "white";
export type PointType = "men" | "kote" | "do" | "tsuki" | "hansoku";
export type MatchType =
  | "group"
  | "playoff"
  | "preliminary"
  | "pre playoff"
  | "swiss"
  | "team";
export type MatchTime = 180000 | 240000 | 300000;

export interface MatchPoint {
  type: PointType;
  timestamp: Date;
}

export interface MatchPlayer {
  id: Types.ObjectId;
  points: MatchPoint[];
  color: PlayerColor;
}

export interface Match {
  id: Types.ObjectId;
  startTimestamp?: Date;
  scheduledTime?: string;
  timerStartedTimestamp: Date | null;
  elapsedTime: number;
  endTimestamp?: Date;
  type: MatchType;
  players: Array<Types.ObjectId | MatchPlayer>;
  winner?: Types.ObjectId;
  winnerTeamId?: Types.ObjectId;
  comment?: string;
  tournamentId: Types.ObjectId | Tournament;
  officials: Types.ObjectId[];
  tournamentRound: number;
  timeKeeper?: Types.ObjectId;
  pointMaker?: Types.ObjectId;
  isTimerOn: boolean;
  isOvertime: boolean;
  player1Score: number;
  player2Score: number;
  matchTime: MatchTime;
  courtNumber: number;

  roundIndex: number;
  order: number;
  sides: Array<{
    title?: string,
    contestantId?: string,
    scores?: Array<{
      mainScore: number | string,
      subscore?: number | string,
      isWinner?: boolean
    }>,
    currentScore?: string,
    isServing?: boolean,
    isWinner?: string,
  }>;
  matchStatus?: string;
  isLive?: boolean;
  isBronzeMatch?: string;
}

const pointSchema = new Schema<MatchPoint>(
  {
    type: { type: String, required: true },
    timestamp: { type: Date, required: true }
  },
  { _id: false }
);

const playerSchema = new Schema<MatchPlayer>(
  {
    points: {
      type: [pointSchema],
      required: true,
      default: []
    },
    color: { type: String, required: true }
  },
  {
    toObject: {
      virtuals: true,
      versionKey: false,
      transform(_doc, ret, _options) {
        ret.id = ret._id;
        delete ret._id;
      }
    }
  }
);

const matchSchema = new Schema<Match>(
  {
    startTimestamp: { type: Date, required: false },
    timerStartedTimestamp: { type: Date, required: false, default: null },
    elapsedTime: { type: Number, required: true, default: 0 },
    endTimestamp: { type: Date, required: false },
    type: { type: String, required: true },
    winner: { type: Schema.Types.ObjectId, ref: "User", required: false },
    winnerTeamId: { type: Schema.Types.ObjectId, ref: "Team", required: false },
    scheduledTime: {
      type: String,
      required: true,
      default: "XX:XX"
    },
    players: {
      type: [playerSchema],
      required: true
    },
    comment: { type: String, required: false },
    tournamentId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Tournament"
    },
    officials: {
      type: [Schema.Types.ObjectId],
      default: []
    },
    tournamentRound: {
      type: Number,
      default: 1
    },
    timeKeeper: { type: Schema.Types.ObjectId, required: false },
    pointMaker: { type: Schema.Types.ObjectId, required: false },
    isTimerOn: { type: Boolean, required: true, default: false },
    isOvertime: { type: Boolean, required: true, default: false },
    player1Score: { type: Number, required: true, default: 0 },
    player2Score: { type: Number, required: true, default: 0 },
    matchTime: { type: Number, required: true },
    courtNumber: { type: Number, default: 1 },

    roundIndex: { type: Number },
    order: { type: Number },
    sides: [{
      title: { type: String },
      contestantId: { type: String },
      scores: {
        type: [{
          mainScore: {type: Schema.Types.Mixed },
          subscore: {type: Schema.Types.Mixed },
          isWinner: { type: Boolean }
        }],
        default: undefined
      },
      currentScore: {type: Schema.Types.Mixed },
      isServing: { type: Boolean },
      isWinner: { type: Boolean }
    }],
    matchStatus: { type: String },
    isLive: { type: Boolean },
    isBronzeMatch: { type: Boolean }
  },
  {
    toObject: {
      virtuals: true,
      versionKey: false,
      transform(_doc, ret, _options) {
        ret.id = ret._id;
        delete ret._id;
      }
    }
  }
);

const MatchModel = mongoose.model("Match", matchSchema);

export default MatchModel;
