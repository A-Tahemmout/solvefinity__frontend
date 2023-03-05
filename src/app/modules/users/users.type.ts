import { Bank } from '../banks/banks.types';
// --------------------------------------------------
// User Interface
// --------------------------------------------------
export interface User {
    id: string;
    version?: number;
    cin: string;
    firstName: string;
    lastName: string;
    avatar: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    zipCode: string;
    country: string;
    birthDate: string;

    createdAt?: string;
    updatedAt?: string;

    username?: string;
    password?: string;
    roles?: UserRole[];

    bank?: Bank;
}

// --------------------------------------------------
// User Role Interface
// --------------------------------------------------
export interface UserRole {
    id: string;
    name: string;
    description: string;
}

// --------------------------------------------------
// User Pagination Interface
// --------------------------------------------------
export interface UserPagination {
    users: User[];
    pageSize: number;
    currentPage: number;
    totalItems: number;
    totalPages: number;
}

// --------------------------------------------------
// Banks Name Interface
// --------------------------------------------------
export interface BanksName {
    slug: string;
    name: string;
}
