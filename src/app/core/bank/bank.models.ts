import { IBank } from './bank.types';

// Bank Class
export class Bank implements Required<IBank> {
    id: string;
    name: string;
    url: string;
    description: string;
    logo: string;
    address: string;
    phone: string;
    email: string;
    website: string;

    constructor(bank: IBank) {
        this.id = bank.id;
        this.name = bank.name;
        this.url = bank.url;
        this.description = bank.description;
        this.logo = bank.logo;
        this.address = bank.address;
        this.phone = bank.phone;
        this.email = bank.email;
        this.website = bank.website;
    }
}
