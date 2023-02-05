import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { SessionStorageService } from 'app/core/auth/session-storage.service';
import { UserService } from 'app/core/user/user.service';
import { environment } from 'environments/environment';
import { Token } from '../token/token.models';

@Injectable()
export class AuthService {
    private _baseUrl = environment.baseUrl + '/auth';
    private _authenticated: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _sessionStorageService: SessionStorageService,
        private _userService: UserService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any> {
        return this._httpClient.post(`${this._baseUrl}/forgot-password`, email);
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string): Observable<any> {
        return this._httpClient.post(`${this._baseUrl}/reset-password`, password);
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: { username: string; password: string }): Observable<any> {
        // Throw error, if the user is already logged in
        if (this._authenticated) {
            return throwError(() => new Error('User is already logged in.'));
        }

        // Sign in
        return this._httpClient.post(`${this._baseUrl}/sign-in`, credentials).pipe(
            switchMap((response: Token) => {
                // Store the token in session storage
                this._sessionStorageService.token = response;

                // Set the authenticated flag to true
                this._authenticated = true;

                // Store the user on the user service
                this._userService.user = {
                    id: response.uuid,
                    firstName: response.firstName,
                    lastName: response.lastName,
                    email: response.email,
                    username: response.username,
                    roles: response.roles
                };

                // Return a new observable with the response
                return of(response);
            })
        );
    }

    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any> {
        // Sign in using the token
        return this._httpClient.post(`${this._baseUrl}/sign-in-with-token`, {
            accessToken: this._sessionStorageService.accessToken
        }).pipe(
            catchError(() =>
                // Return false
                of(false)
            ),
            switchMap((response: any) => {
                // Replace the access token with the new one if it's available on
                // the response object.
                //
                // This is an added optional step for better security. Once you sign
                // in using the token, you should generate a new one on the server
                // side and attach it to the response object. Then the following
                // piece of code can replace the token with the refreshed one.
                if (response.accessToken) {
                    this._sessionStorageService.token = response;
                }

                // Set the authenticated flag to true
                this._authenticated = true;

                // Store the user on the user service
                this._userService.user = {
                    id: response.uuid,
                    firstName: response.firstName,
                    lastName: response.lastName,
                    email: response.email,
                    username: response.username,
                    roles: response.roles
                };

                // Return true
                return of(true);
            })
        );
    }

    /**
     * Sign out
     */
    signOut(): Observable<any> {
        // Remove the access token from the local storage
        localStorage.removeItem('accessToken');

        // Remove the token from the session storage
        this._sessionStorageService.clear();

        // Set the authenticated flag to false
        this._authenticated = false;

        // Return the observable
        return of(true);
    }

    /**
     * Sign up
     *
     * @param user
     */
    signUp(user: { name: string; email: string; password: string; company: string }): Observable<any> {
        return this._httpClient.post('api/auth/sign-up', user);
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: { email: string; password: string }): Observable<any> {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean> {
        // Check if the user is logged in
        if (this._authenticated) {
            return of(true);
        }

        // Check the access token availability
        if (!this._sessionStorageService.accessToken) {
            return of(false);
        }

        // Check the access token expire date
        if (AuthUtils.isTokenExpired(this._sessionStorageService.accessToken)) {
            return of(false);
        }

        // If the access token exists and it didn't expire, sign in using it
        return this.signInUsingToken();
    }
}
