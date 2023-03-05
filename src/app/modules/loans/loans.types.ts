// --------------------------------------------------
// Loaner Interface
// --------------------------------------------------
export interface Loaner {
    id: string;
    version?: number;

    firstName: string;
    lastName: string;
    cin: string;
    avatar: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    zipCode: string;
    country: string;
    birthDate: string;

    employmentTitle: string;
    employmentLength: number;
    annualIncome: number;
    verificationStatus: number;
    homeOwnership: number;

    loans: Loan[];

    createdAt?: string;
    updatedAt?: string;
}
// --------------------------------------------------
// Loan Interface
// --------------------------------------------------
export interface Loan {
    id: string;
    version?: number;

    amount: number;
    term: number;
    interestRate: number;
    installment: number;
    grade: string;
    purpose: string;
    note: string;
    status: string;

    createdAt?: string;
    updatedAt?: string;
}
// --------------------------------------------------
// Loan Pagination Interface
// --------------------------------------------------
export interface LoanPagination {
    loans: Loan[];
    pageSize: number;
    currentPage: number;
    totalItems: number;
    totalPages: number;
}

