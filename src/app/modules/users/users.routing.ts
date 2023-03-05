import { Route } from '@angular/router';
import { UsersComponent } from './users.component';
import { UsersListComponent } from './list/list.component';

import { UsersResolver } from './users.resolver';

export const usersRoutes: Route[] = [
    {
        path: '',
        component: UsersComponent,
        children: [
            {
                path: '',
                component: UsersListComponent,
                resolve: {
                    users: UsersResolver
                }
            }
        ]
    }
];
