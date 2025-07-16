import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SurveyService } from '../../../services/survey/survey.service';
import { MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialog, ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';


@Component({
    selector: 'app-survey-type',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule, ToastModule,
        ToolbarModule, DialogModule,ConfirmDialog],
    templateUrl: './survey-type.component.html',
    styleUrls: ['./survey-type.component.scss'],
    providers: [MessageService, ConfirmationService]
})
export class SurveyTypeComponent implements OnInit {
    @ViewChild('dt') dt: Table | undefined;

    surveyTypes: any[] = [];
    cols: any[] = [
        { field: 'id', header: 'ID' },
        { field: 'name', header: 'Name' },
        { field: 'description', header: 'Description' }
    ];
    loading: boolean = false;
    searchText: string = '';
    displayDialog: boolean = false;
    currentSurveyType: any = {};
    isEditMode: boolean = false;

    constructor(
        private surveyService: SurveyService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {
        this.loadSurveyTypes();
    }

    loadSurveyTypes(): void {
        this.loading = true;
        this.surveyService.getAllSurveyTypes().subscribe({
            next: (response) => {
                this.surveyTypes = response.data || [];
                this.loading = false;
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load survey types'
                });
                this.loading = false;
            }
        });
    }

    showDialogToAdd(): void {
        this.currentSurveyType = {};
        this.isEditMode = false;
        this.displayDialog = true;
    }

    showDialogToEdit(surveyType: any): void {
        this.currentSurveyType = { ...surveyType };
        this.isEditMode = true;
        this.displayDialog = true;
    }

    saveSurveyType(): void {
        if (this.isEditMode) {
            this.surveyService.updateSurveyType(this.currentSurveyType.id, this.currentSurveyType).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Survey type updated successfully'
                    });
                    this.loadSurveyTypes();
                    this.displayDialog = false;
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to update survey type'
                    });
                }
            });
        } else {
            this.surveyService.createSurveyType(this.currentSurveyType).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Survey type created successfully'
                    });
                    this.loadSurveyTypes();
                    this.displayDialog = false;
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to create survey type'
                    });
                }
            });
        }
    }

    confirmDelete(surveyType: any): void {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete this survey type?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.deleteSurveyType(surveyType);
            }
        });
    }

    deleteSurveyType(surveyType: any): void {
        this.surveyService.deleteSurveyType(surveyType.id).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Survey type deleted successfully'
                });
                this.loadSurveyTypes();
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to delete survey type'
                });
            }
        });
    }

    onGlobalFilter(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        if (this.dt && inputElement) {
            this.dt.filterGlobal(inputElement.value, 'contains');
        }
    }

    filterTable(event: Event, field: string): void {
        const inputElement = event.target as HTMLInputElement;
        if (this.dt && inputElement) {
            this.dt.filter(inputElement.value, field, 'contains');
        }
    }

    getFilterValue(field: string): string {
        if (!this.dt || !this.dt.filters) return '';

        const filter = this.dt.filters[field];
        if (!filter) return '';

        if (Array.isArray(filter)) {
            return (filter[0] as any)?.value || '';
        } else {
            return (filter as any).value || '';
        }
    }
}
