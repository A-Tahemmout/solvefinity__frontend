import { Injectable } from '@angular/core';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { BanksService } from './banks.service';
import { Bank, BankPagination } from './banks.types';

@Injectable({
    providedIn: 'root'
})
export class BanksResolver implements Resolve<any> {
    /**
     * Constructor
     */
    constructor(private _banksService: BanksService) { }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Bank[]> {
        return this._banksService.getBanks();
    }
}

export class BanksWithPaginationResolver implements Resolve<any> {
    /**
     * Constructor
     */
    constructor(private _banksService: BanksService) { }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<BankPagination> {
        return this._banksService.getBanksWithPagination();
    }
}
