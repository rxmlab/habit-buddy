import { AuthUser } from "../interfaces/user.interface";


export class User {
    private _id: string;
    private _email: string | null;
    private _displayName: string | null;
    private _emailVerified: boolean;
    constructor(user: AuthUser) {
        this._id = user.uid;
        this._email = user.email;
        this._displayName = user.displayName;
        this._emailVerified = user.emailVerified;
    }

    get id(): string {
        return this._id;
    }

    get email(): string | null {
        return this._email;
    }

    get displayName(): string | null {
        return this._displayName;
    }

    get emailVerified(): boolean {
        return this._emailVerified;
    }
}