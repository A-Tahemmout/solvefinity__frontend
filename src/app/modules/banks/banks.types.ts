// --------------------------------------------------
// Bank Interface
// --------------------------------------------------
export interface Bank {
    id: string;
    version?: number;

    name: string;
    description: string;
    slug: string;
    logo: string;
    address: string;
    email: string;
    phone: string;
    website: string;
    active: boolean;

    usersCount?: number;

    createdAt?: string;
    updatedAt?: string;
}

// --------------------------------------------------
// Bank Pagination Interface
// --------------------------------------------------
export interface BankPagination {
    banks: Bank[];
    pageSize: number;
    currentPage: number;
    totalItems: number;
    totalPages: number;
}
