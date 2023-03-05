import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { LoansService } from '../loans.service';

@Component({
    selector: 'loans-add',
    templateUrl: './add.component.html'
})
export class LoansAddComponent implements OnInit, OnDestroy {

    loanForm: UntypedFormGroup;

    // Select options
    termOptions: any[] = [
        { value: 1, label: '36 Months' },
        { value: 2, label: '60 Months' },
    ];

    gradeOptions: any[] = [
        { value: 1, label: 'E' },
        { value: 2, label: 'D' },
        { value: 3, label: 'C' },
        { value: 4, label: 'B' },
        { value: 5, label: 'A' },
    ];

    purposeOptions: any[] = [
        { value: 0, label: 'Car' },
        { value: 1, label: 'Credit Card' },
        { value: 2, label: 'Debt Consolidation' },
        { value: 3, label: 'Educational' },
        { value: 4, label: 'Home Improvement' },
        { value: 5, label: 'House' },
        { value: 6, label: 'Major Purchase' },
        { value: 7, label: 'Medical' },
        { value: 8, label: 'Moving' },
        { value: 9, label: 'Other' },
        { value: 10, label: 'Renewable Energy' },
        { value: 11, label: 'Small Business' },
        { value: 12, label: 'Vacation' },
        { value: 13, label: 'Wedding' },
    ];

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        @Inject(MAT_DIALOG_DATA) private _data: { loanerId: string },
        private _matDialogRef: MatDialogRef<LoansAddComponent>,
        private _formBuilder: FormBuilder,
        private _loansService: LoansService,
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Loan form
        this.loanForm = this._formBuilder.group({
            loanerId: [this._data.loanerId],
            id: [null],
            amount: [0.00, [Validators.required]],
            interestRate: [0.00, [Validators.required]],
            term: [1, [Validators.required]],
            installment: [0.00, [Validators.required]],
            grade: [5, [Validators.required]],
            purpose: ['', [Validators.required]],
            note: [''],
            status: [1, [Validators.required]],
        });
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
     * Create loan
     */
    createLoan(): void {
        // Return if the form is invalid
        if (this.loanForm.invalid) {
            return;
        }

        // Get the form values
        const loan = this.loanForm.getRawValue();

        // Create the loan
        this._loansService.createLoan(loan, this._data.loanerId).subscribe({
            next: () => {
                // Close the dialog
                this._matDialogRef.close();
            },
            error: () => {
                // Mark the form as dirty
                this.loanForm.markAllAsTouched();
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

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------
}
