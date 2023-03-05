/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, ReplaySubject, tap } from 'rxjs';
import { User } from 'app/core/user/user.types';
import { environment } from 'environments/environment';
import { SessionStorageService } from 'app/core/auth/session-storage.service';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private _baseUrl = environment.baseUrl + '/user';
    private _user: ReplaySubject<User> = new ReplaySubject<User>(1);

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _sessionStorageService: SessionStorageService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for user
     *
     * @param value
     */
    set user(value: User) {
        // Store the value
        this._user.next(value);
    }

    get user$(): Observable<User> {
        return this._user.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the current logged in user data
     */
    get(): Observable<User> {
        // Get the user's uuid from the session storage
        const uuid = this._sessionStorageService.uuid;

        console.log('UserService.get() uuid: ' + uuid);
        if (uuid) {
            return this._httpClient.get<User>(`${this._baseUrl}/${uuid}`).pipe(
                tap((user) => {
                    user.avatar = this._baseUrl + '/images/' + user.avatar;
                    this._user.next(user);
                })
            );
        } else {
            // Return an empty observable
            return new Observable<User>();
        }
    }

    /**
     * Update the user
     *
     * @param user
     */
    update(user: User): Observable<any> {
        return this._httpClient.patch<User>('api/common/user', { user }).pipe(
            map((response) => {
                this._user.next(response);
            })
        );
    }
}
