import { CustomError, type CustomErrorContent } from "./CustomError.js";

export default class NotFoundError extends CustomError {
  private static readonly _statusCode = 404;
  private readonly _code: number;
  private readonly _logging: boolean;
  private readonly _context: Record<string, any>;

  constructor(params?: {
    code?: number;
    message?: string;
    logging?: boolean;
    context?: Record<string, any>;
  }) {
    const { code, message, logging } = params ?? {};

    super(message ?? "Not found");
    this._code = code ?? NotFoundError._statusCode;
    this._logging = logging ?? false;
    this._context = params?.context ?? {};

    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  get errors(): CustomErrorContent[] {
    return [{ message: this.message, context: this._context }];
  }

  get statusCode(): number {
    return this._code;
  }

  get logging(): boolean {
    return this._logging;
  }
}
