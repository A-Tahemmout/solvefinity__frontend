import { Bank } from 'app/core/bank/bank.models';

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    roles: Array<string>;
    avatar?: string;
    status?: string;
    bank?: Bank;
}
