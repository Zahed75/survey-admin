import { Component, OnInit } from '@angular/core';
import { SurveyService } from '../../../services/survey/survey.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonDirective } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { Tag } from 'primeng/tag';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Card } from 'primeng/card';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { InputText } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { Textarea } from 'primeng/textarea';
import { Checkbox } from 'primeng/checkbox';

@Component({
    selector: 'app-survey-list',
    templateUrl: './survey-list.component.html',
    styleUrls: ['./survey-list.component.scss'],
    imports: [TableModule, ButtonDirective, RouterLink, Tag, ConfirmDialog, Card, NgIf, NgForOf, InputText, FormsModule, Textarea, Checkbox, DatePipe],
    providers: [ConfirmationService, MessageService]
})
export class SurveyListComponent implements OnInit {
    surveys: any[] = [];
    loading = false;
    expandedSurvey: any = null;
    editMode: boolean = false;

    constructor(
        private surveyService: SurveyService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.loadSurveys();
    }

    loadSurveys(): void {
        this.loading = true;
        this.surveyService.getAllSurveys().subscribe({
            next: (res) => {
                this.surveys = res.data || [];
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load surveys' });
            }
        });
    }

    toggleDetails(survey: any): void {
        if (this.expandedSurvey?.id === survey.id && !this.editMode) {
            this.expandedSurvey = null;
        } else {
            this.editMode = false;
            this.expandedSurvey = { ...survey };
        }
    }

    toggleEdit(survey: any): void {
        if (this.expandedSurvey?.id === survey.id && this.editMode) {
            this.cancelEdit();
        } else {
            this.editMode = true;
            this.expandedSurvey = { ...survey };
        }
    }

    cancelEdit(): void {
        this.editMode = false;
        this.expandedSurvey = null;
    }

    saveSurvey(updatedSurvey: any): void {
        const payload = {
            ...updatedSurvey,
            questions: updatedSurvey.questions,
            targets: updatedSurvey.targets
        };
        this.surveyService.updateSurvey(updatedSurvey.id, payload).subscribe({
            next: (res) => {
                this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Survey updated successfully' });
                this.editMode = false;
                this.expandedSurvey = null;
                this.loadSurveys();
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update survey' });
            }
        });
    }

    confirmDelete(id: number): void {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete this survey?',
            accept: () => {
                this.deleteSurvey(id);
            }
        });
    }

    deleteSurvey(id: number): void {
        this.surveyService.deleteSurvey(id).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Survey deleted successfully' });
                this.loadSurveys();
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete survey' });
            }
        });
    }
}
