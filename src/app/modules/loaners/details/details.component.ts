import { Overlay } from '@angular/cdk/overlay';
import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { environment } from 'environments/environment';
import { Subject, takeUntil } from 'rxjs';
import { LoanersListComponent } from '../list/list.component';
import { LoanersService } from '../loaners.service';
import { Loaner } from '../loaners.types';

@Component({
    selector: 'loaners-details',
    templateUrl: './details.component.html'
})
export class LoanersDetailsComponent implements OnInit, OnDestroy {

    @ViewChild('avatarFileInput') private _avatarFileInput: ElementRef;

    assetsUrl = environment.baseUrl + '/loaner/images';

    // Select options
    employmentLengthOptions: any[] = [
        { value: 1, label: 'Less than 1 year' },
        { value: 2, label: '1 year' },
        { value: 3, label: '2 years' },
        { value: 4, label: '3 years' },
        { value: 5, label: '4 years' },
        { value: 6, label: '5 years' },
        { value: 7, label: '6 years' },
        { value: 8, label: '7 years' },
        { value: 9, label: '8 years' },
        { value: 10, label: '9 years' },
        { value: 11, label: '10 years' },
        { value: 12, label: 'More than 10 years' },
        { value: 0, label: 'Unknown' }
    ];

    homeOwnershipOptions: any[] = [
        { value: 1, label: 'Rent' },
        { value: 2, label: 'Mortgage' },
        { value: 3, label: 'Own' },
        { value: 0, label: 'Other' }
    ];

    verificationStatusOptions: any[] = [
        { value: 1, label: 'Verified' },
        { value: 2, label: 'Source Verified' },
        { value: 3, label: 'Not Verified' }
    ];

    editMode: boolean = false;
    tagsEditMode: boolean = false;
    loaner: Loaner;
    loanerForm: UntypedFormGroup;
    loaners: Loaner[];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _loanersListComponent: LoanersListComponent,
        private _loanersService: LoanersService,
        private _formBuilder: UntypedFormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _renderer2: Renderer2,
        private _router: Router,
        private _overlay: Overlay,
        private _viewContainerRef: ViewContainerRef
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Open the drawer
        this._loanersListComponent.matDrawer.open();

        // Create the loaner form
        this.loanerForm = this._formBuilder.group({
            id: [''],
            cin: ['', [Validators.required]],
            firstName: ['', [Validators.required]],
            lastName: ['', [Validators.required]],
            avatar: [null],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', [Validators.required]],
            address: [null],
            city: [null],
            zipCode: [null],
            country: [null],
            birthDate: [null],

            employmentTitle: [null],
            employmentLength: [null],
            annualIncome: [null],
            verificationStatus: [null],
            homeOwnership: [null]
        });

        // Get the loaners
        this._loanersService.loaners$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((loaners: Loaner[]) => {
                this.loaners = loaners;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the loaner
        this._loanersService.loaner$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((loaner: Loaner) => {
                // Open the drawer in case it is closed
                this._loanersListComponent.matDrawer.open();

                // Get the loaner
                this.loaner = loaner;

                // Patch values to the form
                this.loanerForm.patchValue(loaner);

                // Toggle the edit mode off
                this.toggleEditMode(false);

                // Mark for check
                this._changeDetectorRef.markForCheck();
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
     * Close the drawer
     */
    closeDrawer(): Promise<MatDrawerToggleResult> {
        return this._loanersListComponent.matDrawer.close();
    }

    /**
     * Toggle edit mode
     *
     * @param editMode
     */
    toggleEditMode(editMode: boolean | null = null): void {
        if (editMode === null) {
            this.editMode = !this.editMode;
        }
        else {
            this.editMode = editMode;
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Update the loaner
     */
    updateLoaner(): void {
        // Get the loaner object
        const loaner = this.loanerForm.getRawValue();

        // Update the loaner on the server
        this._loanersService.updateLoaner(loaner).subscribe(() => {

            // Toggle the edit mode off
            this.toggleEditMode(false);
        });
    }

    /**
     * Delete the loaner
     */
    deleteLoaner(): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete loaner',
            message: 'Are you sure you want to delete this loaner? This action cannot be undone!',
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
                // Get the current loaner's id
                const id = this.loaner.id;

                // Delete the loaner
                this._loanersService.deleteLoaner(id)
                    .subscribe((isDeleted) => {

                        // Return if the loaner wasn't deleted...
                        if (!isDeleted) {
                            return;
                        } else {
                            // Navigate to the parent
                            this._router.navigate(['../'], { relativeTo: this._activatedRoute });
                        }

                        // Toggle the edit mode off
                        this.toggleEditMode(false);
                    });

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
        });

    }

    /**
     * Upload avatar
     *
     * @param fileList
     */
    uploadAvatar(fileList: FileList): void {
        // Return if canceled
        if (!fileList.length) {
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/png'];
        const file = fileList[0];

        // Return if the file is not allowed
        if (!allowedTypes.includes(file.type)) {
            return;
        }

        // Upload the avatar
        this._loanersService.uploadLoanerAvatar(this.loaner.id, file).subscribe();
    }

    /**
     * Remove the avatar
     */
    removeAvatar(): void {
        // Get the form control for 'avatar'
        const avatarFormControl = this.loanerForm.get('avatar');

        // Set the avatar as null
        avatarFormControl.setValue(null);

        // Set the file input value as null
        this._avatarFileInput.nativeElement.value = null;

        // Update the loaner
        this.loaner.avatar = null;
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
     * Compare two objects
     * Used for the select's trackBy function
     * to avoid unnecessary re-rendering
     *
     * @param object1
     * @param object2
     */
    compareObjects(object1: any, object2: any): boolean {
        return object1 && object2 && object1 === object2;
    }
}
