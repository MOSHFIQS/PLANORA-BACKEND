import type { IRequestUser } from "../app/interfaces/requestUser.interface";

declare global {
    namespace Express {
        export interface Request {
            user?: IRequestUser;
        }
    }
}
