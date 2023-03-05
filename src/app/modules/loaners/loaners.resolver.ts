import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { LoanersService } from './loaners.service';
import { Loaner } from './loaners.types';

@Injectable({
    providedIn: 'root'
})
export class LoanersResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _loanersService: LoanersService) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Loaner[]> {
        return this._loanersService.getLoaners();
    }
}

@Injectable({
    providedIn: 'root'
})
export class LoanersLoanerResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _loanersService: LoanersService,
        private _router: Router
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Loaner> {
        return this._loanersService.getLoanerById(route.paramMap.get('id'))
            .pipe(
                // Error here means the requested loaner is not available
                catchError((error) => {

                    // Log the error
                    console.error(error);

                    // Get the parent url
                    const parentUrl = state.url.split('/').slice(0, -1).join('/');

                    // Navigate to there
                    this._router.navigateByUrl(parentUrl);

                    // Throw an error
                    return throwError(() => new Error('Loaner not found'));
                })
            );
    }
}
