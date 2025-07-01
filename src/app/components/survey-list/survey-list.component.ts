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
import { InputNumber } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';

@Component({
    selector: 'app-survey-list',
    templateUrl: './survey-list.component.html',
    styleUrls: ['./survey-list.component.scss'],
    imports: [TableModule, ButtonDirective, RouterLink, Tag, ConfirmDialog, Card, NgIf, NgForOf, InputText, FormsModule, Textarea, Checkbox, DatePipe, InputNumber, DropdownModule],
    providers: [ConfirmationService, MessageService]
})
export class SurveyListComponent implements OnInit {
    surveys: any[] = [];
    loading = false;
    expandedSurvey: any = null;
    editMode = false;

    constructor(
        private surveyService: SurveyService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadSurveys();
    }

    loadSurveys() {
        this.loading = true;
        this.surveyService.getAllSurveys().subscribe({
            next: (res) => {
                this.surveys = res.data;
                this.loading = false;
            }
        });
    }

    toggleDetails(survey: any) {
        this.editMode = false;
        this.surveyService.getSurveyById(survey.id).subscribe({
            next: (res) => (this.expandedSurvey = res.data)
        });
    }

    toggleEdit(survey: any) {
        this.editMode = true;
        this.surveyService.getSurveyById(survey.id).subscribe({
            next: (res) => (this.expandedSurvey = JSON.parse(JSON.stringify(res.data))) // deep clone
        });
    }

    addQuestion() {
        this.expandedSurvey.questions.push({
            text: '',
            type: '',
            has_marks: false,
            marks: null,
            is_required: false,
            choices: []
        });
    }

    removeQuestion(index: number) {
        this.expandedSurvey.questions.splice(index, 1);
    }

    addChoice(qIndex: number) {
        this.expandedSurvey.questions[qIndex].choices.push({
            text: '',
            is_correct: false
        });
    }

    removeChoice(qIndex: number, cIndex: number) {
        this.expandedSurvey.questions[qIndex].choices.splice(cIndex, 1);
    }

    addTarget() {
        this.expandedSurvey.targets.push({
            target_type: '',
            role_name: '',
            department: null,
            site_id: null,
            user_id: null
        });
    }

    removeTarget(index: number) {
        this.expandedSurvey.targets.splice(index, 1);
    }

    cancelEdit() {
        this.editMode = false;
        this.expandedSurvey = null;
    }

    saveSurvey() {
        this.surveyService.updateSurvey(this.expandedSurvey.id, this.expandedSurvey).subscribe({
            next: () => {
                this.editMode = false;
                this.expandedSurvey = null;
                this.loadSurveys();
            }
        });
    }

    confirmDelete(id: number) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete this survey?',
            accept: () => {
                this.surveyService.deleteSurvey(id).subscribe(() => this.loadSurveys());
            }
        });
    }
}
