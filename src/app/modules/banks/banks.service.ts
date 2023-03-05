import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Bank, BankPagination } from './banks.types';

@Injectable({
    providedIn: 'root'
})
export class BanksService {
    // Private
    private _baseUrl = environment.baseUrl + '/bank';

    private _banks: BehaviorSubject<Bank[] | null> = new BehaviorSubject(null);
    private _bank: BehaviorSubject<Bank | null> = new BehaviorSubject(null);

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
     * Getter for banks
     */
    get banks$(): Observable<Bank[]> {
        return this._banks.asObservable();
    }

    /**
     * Getter for bank
     */
    get bank$(): Observable<Bank> {
        return this._bank.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get banks
     */
    getBanks(): Observable<Bank[]> {
        return this._httpClient.get<Bank[]>(`${this._baseUrl}/all`).pipe(
            tap((banks: Bank[]) => {
                this._banks.next(banks);
            })
        );
    }

    /**
     * Get banks with pagination
     *
     * @param params
     */
    getBanksWithPagination(params: any = {}): Observable<BankPagination> {
        return this._httpClient.get<any>(`${this._baseUrl}/pagination/all`, { params: params });
    }

    /**
     * Search banks with pagination
     *
     * @param value
     * @param params
     */
    searchBanksWithPagination(value: string, params: any = {}): Observable<BankPagination> {
        // Add the search value to the params
        params = { ...params, search: value };

        return this._httpClient.get<any>(`${this._baseUrl}/pagination/search`, { params: params });
    }

    /**
     * Get bank by id
     *
     * @param id
     */
    getBankById(id: string): Observable<Bank> {
        return this._httpClient.get<Bank>(`${this._baseUrl}/${id}`).pipe(
            tap((bank: Bank) => {
                this._bank.next(bank);
            })
        );
    }

    /**
     * Create bank
     */
    createBank(): Observable<Bank> {
        // Create a new bank
        const bank: Bank = {
            id: null,
            name: 'A new bank',
            description: 'Bank\'s description',
            slug: null,
            logo: 'bank-icon.png',
            address: null,
            phone: '+212 000 000 000',
            email: 'contact@bank.ma',
            website: 'https://bank-website.ma',
            active: true
        };

        // Create the form data
        const formData = new FormData();
        formData.append('bank', new Blob([JSON.stringify(bank)], { type: 'application/json' }));
        formData.append('logo', null);

        return this._httpClient.post<Bank>(`${this._baseUrl}/create`, formData);
    }

    /**
     * Update bank
     *
     * @param bank
     * @param logo
     */
    updateBank(bank: Bank, logo: File | null): Observable<Bank> {
        // Create the form data
        const formData = new FormData();
        formData.append('bank', new Blob([JSON.stringify(bank)], { type: 'application/json' }));
        formData.append('logo', logo);

        return this._httpClient.post<Bank>(`${this._baseUrl}/update`, formData);
    }

    /**
     * Delete bank
     *
     * @param id
     */
    deleteBank(id: string): Observable<any> {
        return this._httpClient.delete(`${this._baseUrl}/delete/${id}`);
    }
}
