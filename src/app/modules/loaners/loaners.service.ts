import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { BehaviorSubject, filter, map, Observable, switchMap, take, tap } from 'rxjs';
import { Loaner } from './loaners.types';

@Injectable({
    providedIn: 'root'
})
export class LoanersService {
    // Private
    private _baseUrl = environment.baseUrl + '/loaner';

    private _loaners: BehaviorSubject<Loaner[] | null> = new BehaviorSubject(null);
    private _loaner: BehaviorSubject<Loaner | null> = new BehaviorSubject(null);

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient
    ) { }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for loaners
     */
    get loaners$(): Observable<Loaner[]> {
        return this._loaners.asObservable();
    }

    /**
     * Getter for loaner
     */
    get loaner$(): Observable<Loaner> {
        return this._loaner.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get loaners
     */
    getLoaners(): Observable<Loaner[]> {
        return this._httpClient.get<Loaner[]>(`${this._baseUrl}/all`).pipe(
            tap((loaners: Loaner[]) => {
                this._loaners.next(loaners);
            })
        );
    }

    /**
     * Get loaner by id
     *
     * @param id
     */
    getLoanerById(id: string): Observable<Loaner> {
        return this._httpClient.get<Loaner>(`${this._baseUrl}/${id}`).pipe(
            tap((loaner: Loaner) => {
                this._loaner.next(loaner);
            })
        );
    }

    /**
     * Create loaner
     *
     * @param loaner
     */
    createLoaner(): Observable<Loaner> {
        const loaner: Loaner = {
            id: null,
            cin: 'A000000',
            firstName: 'New',
            lastName: 'Loaner',
            avatar: 'loaner-icon.png',
            email: null,
            phone: null,
            address: null,
            city: null,
            zipCode: null,
            country: 'Morocco',
            birthDate: null,
            employmentTitle: null,
            employmentLength: 1,
            annualIncome: 1,
            verificationStatus: 1,
            homeOwnership: 1,
            loans: [],
            bank: null,
        };

        // Create the form data
        const formData = new FormData();
        formData.append('loaner', new Blob([JSON.stringify(loaner)], { type: 'application/json' }));
        formData.append('avatar', null);

        return this.loaners$.pipe(
            take(1),
            switchMap(loaners => this._httpClient.post<Loaner>(`${this._baseUrl}/create`, formData).pipe(
                map((newLoaner) => {

                    // Update the loaners with the new loaner
                    this._loaners.next([newLoaner, ...loaners]);

                    // Return the new loaner
                    return newLoaner;
                })
            ))
        );
    }

    /**
     * Update loaner
     *
     * @param loaner
     */
    updateLoaner(loaner: Loaner): Observable<Loaner> {
        // Create the form data
        const formData = new FormData();
        formData.append('loaner', new Blob([JSON.stringify(loaner)], { type: 'application/json' }));
        formData.append('avatar', null);

        return this.loaners$.pipe(
            take(1),
            switchMap(loaners => this._httpClient.patch<Loaner>(`${this._baseUrl}/update`, formData).pipe(
                map((updatedLoaner) => {

                    // Find the index of the updated loaner
                    const index = loaners.findIndex(item => item.id === updatedLoaner.id);

                    // Update the loaner
                    loaners[index] = updatedLoaner;

                    // Update the loaners
                    this._loaners.next(loaners);

                    // Return the updated loaner
                    return updatedLoaner;
                }),
                switchMap(updatedLoaner => this.loaner$.pipe(
                    take(1),
                    filter(item => item && item.id === updatedLoaner.id),
                    tap(() => {

                        // Update the loaner if it's selected
                        this._loaner.next(updatedLoaner);

                        // Return the updated loaner
                        return updatedLoaner;
                    })
                ))
            ))
        );
    }

    /**
     * upload loaner avatar
     *
     * @param id
     * @param avatar
     */
    uploadLoanerAvatar(id: string, avatar: File): Observable<Loaner> {
        // Create the form data
        const formData = new FormData();
        formData.append('id', new Blob([JSON.stringify(id)], { type: 'application/json' }));
        formData.append('avatar', avatar);

        return this.loaners$.pipe(
            take(1),
            switchMap(loaners => this._httpClient.post<Loaner>(`${this._baseUrl}/upload-avatar`, formData).pipe(
                map((updatedLoaner) => {

                    // Find the index of the updated loaner
                    const index = loaners.findIndex(item => item.id === id);

                    // Update the loaner
                    loaners[index] = updatedLoaner;

                    // Update the loaners
                    this._loaners.next(loaners);

                    // Return the updated loaner
                    return updatedLoaner;
                }),
                switchMap(updatedLoaner => this.loaner$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {

                        // Update the loaner if it's selected
                        this._loaner.next(updatedLoaner);

                        // Return the updated loaner
                        return updatedLoaner;
                    })
                ))
            ))
        );
    }

    /**
     * Delete loaner
     *
     * @param id
     */
    deleteLoaner(id: string): Observable<boolean> {
        return this.loaners$.pipe(
            take(1),
            switchMap(loaners => this._httpClient.delete(`${this._baseUrl}/delete/${id}`).pipe(
                map((isDeleted: boolean) => {

                    // Find the index of the deleted loaner
                    const index = loaners.findIndex(item => item.id === id);

                    // Delete the loaner
                    loaners.splice(index, 1);

                    // Update the loaners
                    this._loaners.next(loaners);

                    isDeleted = true;

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }

    /**
     * Search loaners
     *
     * @param query
     */
    searchLoaners(query: any): Observable<Loaner[]> {
        return this._httpClient.post<Loaner[]>(`${this._baseUrl}/search`, query);
    }
}
