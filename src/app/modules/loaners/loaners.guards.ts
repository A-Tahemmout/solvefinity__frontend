import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { LoanersDetailsComponent } from 'app/modules/loaners/details/details.component';

@Injectable({
    providedIn: 'root'
})
export class CanDeactivateLoanersDetails implements CanDeactivate<LoanersDetailsComponent>
{
    canDeactivate(
        component: LoanersDetailsComponent,
        currentRoute: ActivatedRouteSnapshot,
        currentState: RouterStateSnapshot,
        nextState: RouterStateSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        // Get the next route
        let nextRoute: ActivatedRouteSnapshot = nextState.root;
        while (nextRoute.firstChild) {
            nextRoute = nextRoute.firstChild;
        }

        // If the next state doesn't contain '/loaners'
        // it means we are navigating away from the
        // loaners app
        if (!nextState.url.includes('/loaners')) {
            // Let it navigate
            return true;
        }

        // If we are navigating to another loaner...
        if (nextRoute.paramMap.get('id')) {
            // Just navigate
            return true;
        }
        // Otherwise...
        else {
            // Close the drawer first, and then navigate
            return component.closeDrawer().then(() => true);
        }
    }
}
