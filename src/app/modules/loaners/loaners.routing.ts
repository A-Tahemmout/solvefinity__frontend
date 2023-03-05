import { Route } from '@angular/router';

import { LoanersComponent } from './loaners.component';
import { LoanersListComponent } from './list/list.component';
import { LoanersDetailsComponent } from './details/details.component';

import { LoanersResolver, LoanersLoanerResolver } from './loaners.resolver';

import { CanDeactivateLoanersDetails } from './loaners.guards';

export const loanersRoutes: Route[] = [
    {
        path: '',
        component: LoanersComponent,
        children: [
            {
                path: '',
                component: LoanersListComponent,
                resolve: {
                    loaners: LoanersResolver
                },
                children: [
                    {
                        path: ':id',
                        component: LoanersDetailsComponent,
                        resolve: {
                            loaner: LoanersLoanerResolver,
                        },
                        canDeactivate: [CanDeactivateLoanersDetails]
                    }
                ]
            }
        ]
    }
];
