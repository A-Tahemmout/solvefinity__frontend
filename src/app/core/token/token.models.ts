import { IToken } from './token.types';

// Token Class
export class Token implements Required<IToken> {
    uuid: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    roles: string[];
    accessToken: string;

    constructor(token: IToken) {
        this.uuid = token.uuid;
        this.firstName = token.firstName;
        this.lastName = token.lastName;
        this.email = token.email;
        this.username = token.username;
        this.roles = token.roles;
        this.accessToken = token.accessToken;
    }
}
