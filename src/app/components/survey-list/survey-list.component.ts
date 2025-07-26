import { Component, OnInit } from '@angular/core';
import { SurveyService } from '../../../services/survey/survey.service';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonDirective } from 'primeng/button';
import { Card } from 'primeng/card';

@Component({
    selector: 'app-survey-list',
    templateUrl: './survey-list.component.html',
    imports: [TableModule, ButtonDirective, Card],
    styleUrls: ['./survey-list.component.scss']
})
export class SurveyListComponent implements OnInit {
    surveys: any[] = [];
    loading = false;

    constructor(
        private surveyService: SurveyService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.loadSurveys();
    }

    loadSurveys() {
        this.loading = true;
        this.surveyService.getAllSurveys().subscribe({
            next: (res) => {
                this.surveys = res.data || [];
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            }
        });
    }

    editSurvey(surveyId: number) {
        this.router.navigate(['/survey-edit', surveyId]);
    }
}
