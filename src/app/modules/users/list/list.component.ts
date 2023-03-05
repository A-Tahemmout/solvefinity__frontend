import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort, Sort } from '@angular/material/sort';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoService } from '@ngneat/transloco';
import { environment } from 'environments/environment';
import { map, Observable, startWith, Subject, takeUntil } from 'rxjs';
import { UsersService } from '../users.service';
import { BanksName, User, UserPagination, UserRole } from '../users.type';

@Component({
    selector: 'users-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss']
})
export class UsersListComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    assetsUrl = environment.baseUrl + '/user/images';

    users: User[];
    banks: BanksName[];
    roles: any = [{ value: 'APP_ADMIN', name: 'App Admin' }, { value: 'BANK_ADMIN', name: 'Bank Admin' }, { value: 'BANK_AGENT', name: 'Bank Agent' }];
    pagination: UserPagination;

    sort: any = {
        active: 'cin',
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

    // Filtered banks
    filteredBanks: Observable<BanksName[]>;

    flashMessage: 'success' | 'error' | null = null;
    isLoading: boolean = false;
    searchInputControl: UntypedFormControl = new UntypedFormControl();
    selectedUser: User | null = null;
    selectedUserForm: UntypedFormGroup;

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
        private _usersService: UsersService,
    ) { }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the selected user form
        this.selectedUserForm = this._formBuilder.group({
            id: [''],
            cin: ['', [Validators.required]],
            firstName: ['', [Validators.required]],
            lastName: ['', [Validators.required]],
            avatar: [''],
            email: ['', [Validators.email, Validators.required]],
            phone: ['', [Validators.required]],
            address: [''],
            username: [''],
            password: [''],
            roleName: [''],
            bankSlug: [''],
            active: [false]
        });

        // Filter the banks list
        this.filteredBanks = this.selectedUserForm.get('bankSlug').valueChanges.pipe(
            takeUntil(this._unsubscribeAll),
            startWith(''),
            map((value: string) => this._filterBanks(value || '')),
        );

        // Get the users
        this.getUsersWithPagination();

        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
                (value: string) => {
                    if (!value || value.length < 3) {
                        this.getUsersWithPagination();
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
     * Get banks
     */
    getBanks(): void {
        this._usersService.getBanksName().subscribe({
            next: (response: BanksName[]) => {
                this.banks = response;
            }
        });
    }

    /**
     * Get users with pagination
     */
    getUsersWithPagination(): void {
        // Set the loading state
        this.isLoading = true;

        // Get the request params
        const params = {
            page: this.page.pageIndex,
            size: this.page.pageSize,
            sortBy: this.sort.active,
            sortDirection: this.sort.direction,
        };

        this._usersService.getUsersWithPagination(params).subscribe({
            next: (response: UserPagination) => {
                // Set the loading state
                this.isLoading = false;
                // Set the users
                this.users = response.users;
                // Set the pagination
                this.pagination = response;
            }
        });
    }

    /**
     * Search users with pagination
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

        this._usersService.searchUsersWithPagination(search, params).subscribe({
            next: (response: UserPagination) => {
                // Set the loading state
                this.isLoading = false;
                // Set the users
                this.users = response.users;
                // Set the pagination
                this.pagination = response;
            },
            error: (error: any) => { }
        });
    }

    /**
     * Sort users
     */
    sortUsers(event: Sort): void {
        this.sort = event;
        this.getUsersWithPagination();
    }

    /**
     * Handle page event
     */
    handlePageEvent(event: PageEvent): void {
        this.page = event;
        this.getUsersWithPagination();
    }

    /**
     * Toggle user details
     *
     * @param userId
     */
    toggleDetails(userId: string): void {
        // If the user is already selected...
        if (this.selectedUser && this.selectedUser.id === userId) {
            // Close the details
            this.closeDetails();
            return;
        }

        // Set the loading state
        this.isLoading = true;

        // Get banks
        this.getBanks();

        // Get the user by id
        this._usersService.getUserById(userId).subscribe({
            next: (user: User) => {
                console.log(user);
                // Set the loading state
                this.isLoading = false;

                // Set the selected user
                this.selectedUser = user;

                // Set the preview
                this.preview = user.avatar ? `${this.assetsUrl}/${user.avatar}` : '';

                // Fill the form
                this.selectedUserForm.patchValue(user);

                // Fill the form details
                this.selectedUserForm.patchValue({ bankSlug: user.bank.slug });
                this.selectedUserForm.patchValue({ roleName: user.roles[0]?.name });
                console.log(user.roles[0]?.name);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            },
            error: (error: any) => {
                // Set the loading state
                this.isLoading = false;

                // Show an error snackbar
                this.showSnackBar('Error getting user details', 'error');
            }
        });
    }

    /**
     * Close the details
     */
    closeDetails(): void {
        // Set the avatar preview to null
        this.preview = null;
        // Set the selected user to null
        this.selectedUser = null;
    }

    /**
     * Create user
     */
    createUser(): void {
        // Redirect to first page
        this.handlePageEvent({ pageIndex: 0, pageSize: this.page.pageSize, length: this.page.length });

        // Set the loading state
        this.isLoading = true;

        // Create the user
        this._usersService.createUser().subscribe({
            next: (newUser: User) => {
                // Set the loading state
                this.isLoading = false;

                // Get the users
                this.getUsersWithPagination();

                // Go to new user
                this.selectedUser = newUser;

                // Set the preview
                this.preview = newUser.avatar ? `${this.assetsUrl}/${newUser.avatar}` : '';

                // Fill the form
                this.selectedUserForm.patchValue(newUser);

                // Mark for check
                this._changeDetectorRef.markForCheck();

                // Show a success snackbar
                this.showSnackBar('User created successfully', 'success');

            },
            error: (error: any) => {
                // Set the loading state
                this.isLoading = false;

                // Show an error snackbar
                this.showSnackBar('Error creating user', 'error');
            }
        });
    }

    /**
     * Update selected user using the form data
     */
    updateSelectedUser(): void {
        // Set the loading state
        this.isLoading = true;

        // Get the user object
        const user = this.selectedUserForm.getRawValue();

        // Set manually values
        user.bank = { slug: user.bankSlug };
        user.roles = [{ name: user.roleName }];
        user.username = user.email;
        user.password = user.password ? user.password : null;

        // Update the user on the server
        this._usersService.updateUser(user, this.currentFile ?? null).subscribe({
            next: (updatedUser: User) => {
                // Set the loading state
                this.isLoading = false;

                // Get the users
                this.getUsersWithPagination();

                // Show a success flash message
                this.showFlashMessage('success');

                // Show a success snackbar
                this.showSnackBar('User updated successfully', 'success');
            },
            error: (error: any) => {
                // Set the loading state
                this.isLoading = false;

                // Show an error flash message
                this.showFlashMessage('error');

                // Show an error snackbar
                this.showSnackBar('Error updating user', 'error');
            }
        });
    }

    /**
     * Delete the selected user using the form data
     */
    deleteSelectedUser(): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete user',
            message: 'Are you sure you want to remove this user? This action cannot be undone!',
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

                // Get the user object
                const user = this.selectedUserForm.getRawValue();

                // Delete the user on the server
                this._usersService.deleteUser(user.id).subscribe((response) => {
                    // Close the details
                    this.closeDetails();

                    // Get the users
                    this.getUsersWithPagination();

                    // Show a success snackbar
                    this.showSnackBar('User deleted successfully', 'success');
                });
            }
        });
    }

    /**
     * Change selected user avatar
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
     * Turn user name into slug
     *
     * @param name
     */
    userNameToSlug(): void {
        const name: string = this.selectedUserForm.get('name').value;

        const slug: string = name.toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-')
            .replace(/^-+|-+$/g, '');

        this.selectedUserForm.get('slug').setValue(slug);
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

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Filter banks
     *
     * @param value
     */
    private _filterBanks(value: string): BanksName[] {
        const filterValue = value.toLowerCase();

        return this.banks.filter(bank => bank.name.toLowerCase().includes(filterValue));
    }
}
