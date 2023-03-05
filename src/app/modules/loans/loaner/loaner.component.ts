import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoService } from '@ngneat/transloco';
import { environment } from 'environments/environment';
import { Observable, Subject } from 'rxjs';
import { LoansAddComponent } from '../add/add.component';
import { LoansDetailsComponent } from '../details/details.component';
import { LoansService } from '../loans.service';
import { Loan, Loaner } from '../loans.types';

@Component({
    selector: 'loan-loaner',
    templateUrl: './loaner.component.html'
})
export class LoansLoanerComponent implements OnInit, AfterViewInit, OnDestroy {

    assetsUrl = environment.baseUrl + '/loaner/images';

    loaner: Loaner;
    loanerLoans$: Observable<Loan[]>;

    searchLoanerControl: FormControl;

    flashMessage: 'success' | 'error' | null = null;
    isLoading: boolean = false;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _matDialog: MatDialog,
        private _matSnackBar: MatSnackBar,
        private _router: Router,
        private _translocoService: TranslocoService,
        private _loansService: LoansService
    ) { }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Get the loaner's loans
        this.loanerLoans$ = this._loansService.loanerLoans$;

        // Set the search field
        this.searchLoanerControl = new FormControl('L000001');
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void { }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Search loaner
     */
    searchLoaner(): void {
        // Get the search value
        const searchValue = this.searchLoanerControl.value;

        // Return if the search value is empty
        if (searchValue === '') {
            return;
        }

        // Set the loading state
        this.isLoading = true;

        // Get the loaner
        this._loansService.getLoanerWithLoans(searchValue).subscribe({
            next: (loaner: Loaner) => {
                // Set the loaner
                this.loaner = loaner;

                // Show the success snackBar
                this.showSnackBar(this._translocoService.translate('loans.loaner_found'), 'success');

                // Set the loading state
                this.isLoading = false;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            },
            error: (error: any) => {
                if (error.status === 404) {
                    this.showSnackBar(this._translocoService.translate('loans.loaner_not_found'), 'warning');
                } else {
                    this.showSnackBar(this._translocoService.translate('loans.error'), 'error');
                }

                // Set the loading state
                this.isLoading = false;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    /**
     * Edit loaner
     */
    editLoaner(): void {
        // Navigate to the edit page
        this._router.navigate(['/loaners', this.loaner.id]);
    }

    /**
     * Open add loan dialog
     *
     * @param loanerId
     */
    openAddLoanDialog(loanerId: string): void {
        // Open the dialog
        const dialogRef = this._matDialog.open(LoansAddComponent, {
            autoFocus: false,
            data: {
                loanerId: loanerId
            }
        });
    }


    /**
     * Open details dialog
     *
     * @param loan
     */
    openLoanDetailsDialog(loan: Loan): void {
        // Open the dialog
        const dialogRef = this._matDialog.open(LoansDetailsComponent, {
            autoFocus: false,
            data: {
                loan: loan,
                loanerId: this.loaner.id
            }
        });
    }

    /**
     * Show flash message
     */
    showFlashMessage(type: 'success' | 'error'): void {
        // Show the message
        this.flashMessage = type;

        // Mark for check
        this._changeDetectorRef.markForCheck();

        // Hide it after 3 seconds
        setTimeout(() => {
            // Set the flash message to null
            this.flashMessage = null;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        }, 3000);
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    /**
     * Show snackBar
     *
     * @param message
     * @param type
     */
    showSnackBar(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
        let bg: string = null;

        switch (type) {
            case 'info': bg = 'bg-blue-600'; break;
            case 'success': bg = 'bg-green-600'; break;
            case 'warning': bg = 'bg-orange-600'; break;
            case 'error': bg = 'bg-red-600'; break;
            default: bg = 'bg-blue-600'; break;
        }

        this._matSnackBar.open(message, null, {
            verticalPosition: 'bottom',
            horizontalPosition: 'right',
            duration: 5000,
            panelClass: [bg, 'text-white', 'font-medium']
        });
    }
}
