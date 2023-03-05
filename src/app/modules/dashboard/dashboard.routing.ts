import { Route } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { DashboardComponent } from './dashboard.component';
import { DashboardResolver } from './dashboard.resolver';

export const dashboardRoutes: Route[] = [
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        data: {
            roles: ['APP_ADMIN', 'BANK_ADMIN', 'BANK_AGENT']
        },
        component: DashboardComponent,
        resolve: {
            categories: DashboardResolver
        }
    }
];
