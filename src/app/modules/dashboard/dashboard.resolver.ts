import { Injectable } from '@angular/core';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { DashboardService } from './dashboard.service';

@Injectable({
    providedIn: 'root'
})
export class DashboardResolver implements Resolve<boolean> {
    /**
     * Constructor
     */
    constructor(private _dashboardService: DashboardService) { }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        return this._dashboardService.getData();
    }
}
