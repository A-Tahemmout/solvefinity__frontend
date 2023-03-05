import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FuseScrollbarModule } from '@fuse/directives/scrollbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRippleModule } from '@angular/material/core';
import { MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedModule } from 'app/shared/shared.module';
import { RouterModule } from '@angular/router';

import { LoansComponent } from './loans.component';
import { LoansListComponent } from './list/list.component';
import { LoansLoanerComponent } from './loaner/loaner.component';
import { LoansAddComponent } from './add/add.component';
import { LoansDetailsComponent } from './details/details.component';

import { loansRoutes } from './loans.routing';

@NgModule({
    declarations: [
        LoansComponent,
        LoansListComponent,
        LoansLoanerComponent,
        LoansAddComponent,
        LoansDetailsComponent
    ],
    imports: [
        CommonModule,
        FuseScrollbarModule,
        MatButtonModule,
        MatCheckboxModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatRippleModule,
        MatSortModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatSnackBarModule,
        MatTooltipModule,
        SharedModule,
        RouterModule.forChild(loansRoutes)
    ]
})
export class LoansModule { }
