/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@angular/core';
import { Token } from 'app/core/token/token.models';

const TOKEN_KEY = 'token';

@Injectable({
    providedIn: 'root'
})
export class SessionStorageService {

    /**
     * Constructor
     */
    constructor() { }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for token
     */

    set token(token: Token) {
        // Remove the token from the session storage
        sessionStorage.removeItem(TOKEN_KEY);

        // Store the token in the session storage
        sessionStorage.setItem(TOKEN_KEY, JSON.stringify(token));
    }

    get token(): Token {
        // Get the token from the session storage
        const token = sessionStorage.getItem(TOKEN_KEY);

        // Return the token
        return token ? JSON.parse(token) : null;
    }

    /**
     * Getter for token details
     */
    get uuid(): string {
        return this.token?.uuid ?? '';
    }
    get firstName(): string {
        return this.token?.firstName ?? '';
    }

    get lastName(): string {
        return this.token?.lastName ?? '';
    }

    get email(): string {
        return this.token?.email ?? '';
    }

    get username(): string {
        return this.token?.username ?? '';
    }

    get roles(): string[] {
        return this.token?.roles ?? [];
    }

    get accessToken(): string {
        return this.token?.accessToken ?? '';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Clear the session storage
     */
    clear(): void {
        // Remove the token from the session storage
        sessionStorage.removeItem(TOKEN_KEY);
    }
}
