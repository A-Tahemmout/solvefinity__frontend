import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { BanksName, User, UserPagination } from './users.type';

@Injectable({
    providedIn: 'root'
})
export class UsersService {
    // Private
    private _baseUrl = environment.baseUrl + '/user';
    private _baseUrlBank = environment.baseUrl + '/bank';

    private _users: BehaviorSubject<User[] | null> = new BehaviorSubject(null);
    private _user: BehaviorSubject<User | null> = new BehaviorSubject(null);

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) { }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for users
     */
    get banks$(): Observable<User[]> {
        return this._users.asObservable();
    }

    /**
     * Getter for user
     */
    get bank$(): Observable<User> {
        return this._user.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get users
     */
    getUsers(): Observable<User[]> {
        return this._httpClient.get<User[]>(`${this._baseUrl}/all`).pipe(
            tap((users: User[]) => {
                this._users.next(users);
            })
        );
    }

    /**
     * Get banks (id and name only)
     * Used in the select component
     */
    getBanksName(): Observable<BanksName[]> {
        // convert array [0] to object {id: 0, name: 'name'}
        return this._httpClient.get<BanksName[]>(`${this._baseUrlBank}/all/name`).pipe(
            map((banks: BanksName[]) => banks.map((bank: BanksName) => ({ name: bank[0], slug: bank[1] })))
        );
    }

    /**
     * Get users with pagination
     *
     * @param params
     */
    getUsersWithPagination(params: any): Observable<UserPagination> {
        return this._httpClient.get<UserPagination>(`${this._baseUrl}/pagination/all`, { params });
    }

    /**
     * Search users with pagination
     *
     * @param value
     * @param params
     */
    searchUsersWithPagination(value: string, params: any): Observable<UserPagination> {
        // Add the search value to the params
        params = { ...params, search: value };

        return this._httpClient.get<UserPagination>(`${this._baseUrl}/pagination/search`, { params });
    }

    /**
     * Get user by id
     *
     * @param id
     */
    getUserById(id: string): Observable<User> {
        return this._httpClient.get<User>(`${this._baseUrl}/${id}`).pipe(
            tap((user: User) => {
                this._user.next(user);
            })
        );
    }

    /**
     * Create user
     */
    createUser(): Observable<User> {
        // Create a new user
        const user: User = {
            id: null,
            cin: 'A000000',
            firstName: null,
            lastName: null,
            avatar: 'user-icon.png',
            email: null,
            phone: null,
            address: null,
            city: null,
            zipCode: null,
            country: 'Morocco',
            birthDate: null,
            bank: null,
            username: null,
            password: null,
            roles: [{ id: null, name: 'BANK_AGENT', description: null }]
        };

        // Create the form data
        const formData = new FormData();
        formData.append('user', new Blob([JSON.stringify(user)], { type: 'application/json' }));
        formData.append('avatar', null);

        return this._httpClient.post<User>(`${this._baseUrl}/create`, formData);
    }

    /**
     * Update user
     *
     * @param user
     * @param avatar
     */
    updateUser(user: User, avatar: File | null): Observable<User> {
        // Create the form data
        const formData = new FormData();
        formData.append('user', new Blob([JSON.stringify(user)], { type: 'application/json' }));
        formData.append('avatar', avatar);

        return this._httpClient.post<User>(`${this._baseUrl}/update`, formData);
    }

    /**
     * Delete user
     *
     * @param id
     */
    deleteUser(id: string): Observable<any> {
        return this._httpClient.delete(`${this._baseUrl}/delete/${id}`);
    }
}
