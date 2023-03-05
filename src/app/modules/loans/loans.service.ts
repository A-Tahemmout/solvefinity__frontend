import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { BehaviorSubject, map, Observable, pipe, switchMap, take, tap } from 'rxjs';
import { Loan, Loaner } from './loans.types';

@Injectable({
    providedIn: 'root'
})
export class LoansService {
    // Private
    private _baseUrl = environment.baseUrl + '/loan';
    private _baseUrlLoaner = environment.baseUrl + '/loaner';

    private _loans: BehaviorSubject<Loan[] | null> = new BehaviorSubject(null);
    private _loan: BehaviorSubject<Loan | null> = new BehaviorSubject(null);

    private _loaner: BehaviorSubject<Loaner | null> = new BehaviorSubject(null);
    private _loanerLoans: BehaviorSubject<Loan[] | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) { }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for loans
     */
    get loans$(): Observable<Loan[]> {
        return this._loans.asObservable();
    }

    /**
     * Getter for loan
     */
    get loan$(): Observable<Loan> {
        return this._loan.asObservable();
    }

    /**
     * Getter for loaner
     */
    get loaner$(): Observable<Loaner> {
        return this._loaner.asObservable();
    }

    /**
     * Getter for loaner loans
     */
    get loanerLoans$(): Observable<Loan[]> {
        return this._loanerLoans.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get loans
     */
    getLoans(): Observable<Loan[]> {
        return this._httpClient.get<Loan[]>(`${this._baseUrl}/all`).pipe(
            tap((loans: Loan[]) => {
                this._loans.next(loans);
            })
        );
    }

    /**
     * Get loans with pagination
     *
     * @param params
     */
    getLoansWithPagination(params: any): Observable<Loan[]> {
        return this._httpClient.get<Loan[]>(`${this._baseUrl}/pagination/all`, { params });
    }

    /**
     * Get loan by id
     *
     * @param id
     */
    getLoanById(id: string): Observable<Loan> {
        return this._httpClient.get<Loan>(`${this._baseUrl}/${id}`).pipe(
            tap((loan: Loan) => {
                this._loan.next(loan);
            })
        );
    }

    /**
     * Get loaner with loans by cin
     *
     * @param cin
     */
    getLoanerWithLoans(cin: string): Observable<Loaner> {
        return this._httpClient.get<Loaner>(`${this._baseUrlLoaner}/cin/${cin}`).pipe(
            tap((loaner: Loaner) => {
                this._loaner.next(loaner);
                this._loanerLoans.next(loaner.loans);
            })
        );
    }


    /**
     * Create loan
     *
     * @param loan
     * @param loanerId
     */
    createLoan(loan: Loan, loanerId: string): Observable<Loan> {
        const request: any = { loan, loanerId };
        return this._httpClient.post<Loan>(`${this._baseUrl}/create`, request).pipe(
            tap((newLoan: Loan) => {
                // Add to loaner loans
                const loans = this._loanerLoans.getValue();

                if (loans) {
                    loans.push(newLoan);
                    this._loanerLoans.next(loans);
                }
            })
        );
    }

    /**
     * Update loan
     *
     * @param loan
     * @param loanerId
     */
    updateLoan(loan: Loan, loanerId: string): Observable<Loan> {
        return this._httpClient.put<Loan>(`${this._baseUrl}/update`, { loan, loanerId });
    }

    /**
     * Delete Loan
     *
     * @param id
     */
    deleteLoan(id: string): Observable<boolean> {
        return this.loanerLoans$.pipe(
            take(1),
            switchMap(loanerLoans => this._httpClient.delete(`${this._baseUrl}/delete/${id}`).pipe(
                map((isDeleted: boolean) => {

                    // Find the index of the deleted loaner
                    const index = loanerLoans.findIndex(item => item.id === id);

                    // Delete the loaner
                    loanerLoans.splice(index, 1);

                    // Update the loaners
                    this._loanerLoans.next(loanerLoans);

                    isDeleted = true;

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }

    /**
     * Predict loan
     *
     * @param loan
     * @param loanerId
     */
    predictLoan(loan: Loan, loanerId: string): Observable<number> {
        return this._httpClient.post<number>(`${this._baseUrl}/predict`, { loan, loanerId });
    }

}
