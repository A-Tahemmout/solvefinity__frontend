import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Subject } from 'rxjs';
import { LoansService } from '../loans.service';
import { Loan } from '../loans.types';

@Component({
    selector: 'loans-details',
    templateUrl: './details.component.html'
})
export class LoansDetailsComponent implements OnInit, OnDestroy {

    loan: Loan;
    loanerId: string;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        @Inject(MAT_DIALOG_DATA) private _data: { loan: Loan; loanerId: string },
        private _matDialogRef: MatDialogRef<LoansDetailsComponent>,
        private _loansService: LoansService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Set the loan
        this.loan = this._data.loan;
        // Set the loaner id
        this.loanerId = this._data.loanerId;
    }

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
     * Predict loan
     */
    predictLoan(): void {
        const approve: any = {
            title: 'Approve Loan',
            message: 'Are you sure you want to approve this loan? This action cannot be undone!',
            actions: {
                confirm: {
                    label: 'Approve'
                }
            }
        };

        const reject: any = {
            title: 'Reject Loan',
            message: 'Are you sure you want to reject this loan? This action cannot be undone!',
            actions: {
                confirm: {
                    label: 'Reject'
                }
            }
        };

        // Predict the loan
        this._loansService.predictLoan(this.loan, this.loanerId).subscribe({
            next: (response) => {
                let confirmation: any;

                if (response) {
                    confirmation = approve;
                } else {
                    confirmation = reject;
                }

                // Show the confirmation dialog
                this._fuseConfirmationService.open(confirmation).afterClosed().subscribe((result) => {
                    if (result === 'confirmed') {
                        if (response) {
                            this.editLoanStatus('2');
                        } else {
                            this.editLoanStatus('3');
                        }
                    }
                });
            },
            error: () => {
                // Close the dialog
                this._matDialogRef.close();
            }
        });
    }

    /**
     * Edit loan Status
     *
     * @param status
     */
    editLoanStatus(status: string): void {
        // Set the status
        this.loan.status = status;

        // Update the loan
        this._loansService.updateLoan(this.loan, this.loanerId).subscribe({
            next: () => {
                // Close the dialog
                this._matDialogRef.close();
            },
            error: () => {
                // Close the dialog
                this._matDialogRef.close();
            }
        });
    }

    /**
     * Delete loan
     */
    deleteLoan(): void {
        // Delete the loan
        this._loansService.deleteLoan(this.loan.id).subscribe({
            next: () => {
                // Close the dialog
                this._matDialogRef.close();
            },
            error: () => {
                // Close the dialog
                this._matDialogRef.close();
            }
        });
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

}
