import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort, Sort } from '@angular/material/sort';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoService } from '@ngneat/transloco';
import { environment } from 'environments/environment';
import { Subject, takeUntil } from 'rxjs';
import { BanksService } from '../banks.service';
import { Bank, BankPagination } from '../banks.types';

@Component({
    selector: 'banks-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss']
})
export class BanksListComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    assetsUrl = environment.baseUrl + '/bank/images';

    banks: Bank[];
    pagination: BankPagination;

    sort: any = {
        active: 'name',
        direction: 'asc'
    };
    page: any = {
        previousPageIndex: 0,
        pageIndex: 0,
        pageSize: 10,
        length: 0
    };

    // Logo Preview and Upload
    selectedFiles?: FileList;
    currentFile?: File;
    progress = 0;
    message = '';
    preview = '';

    flashMessage: 'success' | 'error' | null = null;
    isLoading: boolean = false;
    searchInputControl: UntypedFormControl = new UntypedFormControl();
    selectedBank: Bank | null = null;
    selectedBankForm: UntypedFormGroup;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _matSnackBar: MatSnackBar,
        private _translocoService: TranslocoService,
        private _banksService: BanksService,
    ) { }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the selected bank form
        this.selectedBankForm = this._formBuilder.group({
            id: [''],
            name: ['', [Validators.required]],
            description: [''],
            slug: [{ value: '', disabled: true }, [Validators.required]],
            logo: [''],
            email: ['', [Validators.email, Validators.required]],
            phone: ['', [Validators.required]],
            address: [''],
            website: [''],
            active: [false]
        });

        // Get the banks
        this.getBanksWithPagination();

        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
                (value: string) => {
                    if (!value || value.length < 3) {
                        this.getBanksWithPagination();
                        return;
                    }

                    this.searchWithPagination(value);
                }
            );
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
     * Get banks with pagination
     */
    getBanksWithPagination(): void {
        // Set the loading state
        this.isLoading = true;

        // Get the request params
        const params = {
            page: this.page.pageIndex,
            size: this.page.pageSize,
            sortBy: this.sort.active,
            sortDirection: this.sort.direction,
        };

        this._banksService.getBanksWithPagination(params).subscribe({
            next: (response: BankPagination) => {
                // Set the loading state
                this.isLoading = false;
                // Set the banks
                this.banks = response.banks;
                // Set the pagination
                this.pagination = response;
            }
        });
    }

    /**
     * Search banks with pagination
     */
    searchWithPagination(search: any): void {
        // Set the loading state
        this.isLoading = true;

        // Set the request params
        const params = {
            page: this.page.pageIndex,
            size: this.page.pageSize,
            sortBy: this.sort.active,
            sortDirection: this.sort.direction
        };

        this._banksService.searchBanksWithPagination(search, params).subscribe({
            next: (response: BankPagination) => {
                // Set the loading state
                this.isLoading = false;
                // Set the banks
                this.banks = response.banks;
                // Set the pagination
                this.pagination = response;
            },
            error: (error: any) => { }
        });
    }

    /**
     * Sort banks
     */
    sortBanks(event: Sort): void {
        this.sort = event;
        this.getBanksWithPagination();
    }

    /**
     * Handle page event
     */
    handlePageEvent(event: PageEvent): void {
        this.page = event;
        this.getBanksWithPagination();
    }

    /**
     * Toggle bank details
     *
     * @param bankId
     */
    toggleDetails(bankId: string): void {
        // If the bank is already selected...
        if (this.selectedBank && this.selectedBank.id === bankId) {
            // Close the details
            this.closeDetails();
            return;
        }

        // Set the loading state
        this.isLoading = true;

        // Get the bank by id
        this._banksService.getBankById(bankId).subscribe({
            next: (bank: Bank) => {
                // Set the loading state
                this.isLoading = false;

                // Set the selected bank
                this.selectedBank = bank;

                // Set the preview
                this.preview = bank.logo ? `${this.assetsUrl}/${bank.logo}` : '';

                // Fill the form
                this.selectedBankForm.patchValue(bank);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            },
            error: (error: any) => {
                // Set the loading state
                this.isLoading = false;

                // Show an error snackbar
                this.showSnackBar('Error getting bank details', 'error');
            }
        });
    }

    /**
     * Close the details
     */
    closeDetails(): void {
        // Set the logo preview to null
        this.preview = null;
        // Set the selected bank to null
        this.selectedBank = null;
    }

    /**
     * Create bank
     */
    createBank(): void {
        // Redirect to first page
        this.handlePageEvent({ pageIndex: 0, pageSize: this.page.pageSize, length: this.page.length });

        // Set the loading state
        this.isLoading = true;

        // Create the bank
        this._banksService.createBank().subscribe({
            next: (newBank: Bank) => {
                // Set the loading state
                this.isLoading = false;

                // Get the banks
                this.getBanksWithPagination();

                // Go to new bank
                this.selectedBank = newBank;

                // Set the preview
                this.preview = newBank.logo ? `${this.assetsUrl}/${newBank.logo}` : '';

                // Fill the form
                this.selectedBankForm.patchValue(newBank);

                // Mark for check
                this._changeDetectorRef.markForCheck();

                // Show a success snackbar
                this.showSnackBar('Bank created successfully', 'success');

            },
            error: (error: any) => {
                // Set the loading state
                this.isLoading = false;

                // Show an error snackbar
                this.showSnackBar('Error creating bank', 'error');
            }
        });
    }

    /**
     * Update selected bank using the form data
     */
    updateSelectedBank(): void {
        // Set the loading state
        this.isLoading = true;

        // Get the bank object
        const bank = this.selectedBankForm.getRawValue();

        // Update the bank on the server
        this._banksService.updateBank(bank, this.currentFile ?? null).subscribe({
            next: (updatedBank: Bank) => {
                // Set the loading state
                this.isLoading = false;

                // Get the banks
                this.getBanksWithPagination();

                // Show a success flash message
                this.showFlashMessage('success');

                // Show a success snackbar
                this.showSnackBar('Bank updated successfully', 'success');

            },
            error: (error: any) => {
                // Set the loading state
                this.isLoading = false;

                // Show an error flash message
                this.showFlashMessage('error');

                // Show an error snackbar
                this.showSnackBar('Error updating bank', 'error');
            }
        });
    }

    /**
     * Delete the selected bank using the form data
     */
    deleteSelectedBank(): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete bank',
            message: 'Are you sure you want to remove this bank? This action cannot be undone!',
            actions: {
                confirm: {
                    label: 'Delete'
                }
            }
        });

        // Subscribe to the confirmation dialog closed action
        confirmation.afterClosed().subscribe((result) => {

            // If the confirm button pressed...
            if (result === 'confirmed') {

                // Get the bank object
                const bank = this.selectedBankForm.getRawValue();

                // Delete the bank on the server
                this._banksService.deleteBank(bank.id).subscribe((response) => {
                    // Close the details
                    this.closeDetails();

                    // Get the banks
                    this.getBanksWithPagination();

                    // Show a success snackbar
                    this.showSnackBar('Bank deleted successfully', 'success');
                });
            }
        });
    }

    /**
     * Change selected bank logo
     *
     * @param event
     */
    selectLogo(event: any): void {
        this.message = '';
        this.preview = '';
        this.progress = 0;
        this.selectedFiles = event.target.files;

        if (this.selectedFiles) {
            const file: File | null = this.selectedFiles.item(0);

            if (file) {
                this.preview = '';
                this.currentFile = file;

                const reader = new FileReader();

                reader.onload = (e: any): any => {
                    console.log(e.target.result);
                    this.preview = e.target.result;
                };

                reader.readAsDataURL(this.currentFile);
            }
        }
    }

    /**
     * Turn bank name into slug
     *
     * @param name
     */
    bankNameToSlug(): void {
        const name: string = this.selectedBankForm.get('name').value;

        const slug: string = name.toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-')
            .replace(/^-+|-+$/g, '');

        this.selectedBankForm.get('slug').setValue(slug);
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
