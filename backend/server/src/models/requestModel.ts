/**
 * MongoDB Object ID.
 * Represents a 24-character hexadecimal string.
 * Used for the purpose of identifying and handling invalid ID query parameters prior to initiating queries.
 * @pattern ^[0-9a-fA-F]{24}$
 * @format objectId
 */
export type ObjectIdString = string;

export interface RegisterRequest {
  /**
   * @example "john.doe@gmail.com"
   * @pattern ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ email format invalid
   */
  email: string;
  /**
   * @example "Foobar123"
   * @pattern ^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]{8,30})$ password format invalid
   */
  password: string;
  /**
   * @example "0401234567"
   * @pattern ^[0-9]{10,15}$ phone number format invalid
   */
  phoneNumber: string;
  /**
   * @example "John"
   */
  firstName: string;
  /**
   * @example "Doe"
   */
  lastName: string;
  /**
   * @example "Seinäjoki Kendo club"
   */
  clubName: string;
  /**
   * @example "someRank"
   */
  danRank: string;
  underage: boolean;
  /**
   * @example "guardian@gmail.com"
   * @pattern ^$|^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ email format invalid
   */
  guardiansEmail?: string;
}

export interface LoginRequest {
  /**
   * @example "john.doe@gmail.com"
   * @pattern ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ email format invalid
   */
  email: string;
  /**
   * @example "Foobar123"
   * @pattern ^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]{8,30})$ password format invalid
   */
  password: string;
}

interface MatchPlayerPayload {
  id: ObjectIdString;
  color: PlayerColor;
}

export interface CreateMatchRequest {
  /**
   * @minItems 2 Two players are required
   * @maxItems 2 Two players are required
   */
  players: MatchPlayerPayload[];
  matchType: MatchType;
  comment?: string;
}
