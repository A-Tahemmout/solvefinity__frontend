import { Route } from '@angular/router';
import { BanksComponent } from './banks.component';
import { BanksListComponent } from './list/list.component';

import { BanksResolver } from './banks.resolver';

export const banksRoutes: Route[] = [
    {
        path: '',
        component: BanksComponent,
        children: [
            {
                path: '',
                component: BanksListComponent,
                resolve: {
                    banks: BanksResolver
                }
            }
        ]
    }
];
