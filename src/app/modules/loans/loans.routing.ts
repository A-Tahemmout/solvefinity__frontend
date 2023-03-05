import { Route } from '@angular/router';
import { LoansComponent } from './loans.component';
import { LoansLoanerComponent } from './loaner/loaner.component';

import { LoansResolver } from './loans.resolver';


export const loansRoutes: Route[] = [
    {
        path: '',
        component: LoansComponent,
        children: [
            {
                path: '',
                component: LoansLoanerComponent,
                resolve: {
                    loans: LoansResolver
                }
            }
        ]
    }
];
