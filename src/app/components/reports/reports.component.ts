import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ReportsService } from '../../../services/reports/reports.service';

@Component({
    selector: 'app-reports',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        FormsModule,
    ],
    providers: [ReportsService],
    templateUrl: './reports.component.html',
    styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
    private reportsService = inject(ReportsService);

    responses: any[] = [];
    expandedRows: { [key: number]: boolean } = {};
    loading = true;

    ngOnInit(): void {
        this.fetchReports();
    }

    fetchReports() {
        this.loading = true;
        this.reportsService.getSurveyReport().subscribe({
            next: (res) => {
                this.responses = res.responses || [];
                this.loading = false;
            },
            error: (err) => {
                console.error('Failed to fetch reports:', err);
                this.loading = false;
            }
        });
    }

    onGlobalFilter(event: Event, dt: any) {
        const input = event.target as HTMLInputElement;
        dt.filterGlobal(input.value, 'contains');
    }

    toggleExpandRow(responseId: number): void {
        this.expandedRows[responseId] = !this.expandedRows[responseId];
    }

    isRowExpanded(responseId: number): boolean {
        return !!this.expandedRows[responseId];
    }

    downloadCSV() {
        const csvRows: string[] = [];
        csvRows.push('Response ID,Submitted By,Survey Title,Submitted At,Category,Question,Answer,Obtained,Marks');

        for (const res of this.responses) {
            const {
                response_id,
                submitted_by_user,
                survey_title,
                submitted_at,
                categories
            } = res;

            for (const category of categories) {
                for (const question of category.questions) {
                    const row = [
                        response_id,
                        submitted_by_user,
                        `"${survey_title}"`,
                        submitted_at,
                        `"${category.name}"`,
                        `"${question.question_text}"`,
                        `"${question.selected_choice?.text || question.answer || ''}"`,
                        question.obtained ?? '',
                        question.marks ?? ''
                    ];
                    csvRows.push(row.join(','));
                }
            }
        }

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'survey_report.csv';
        link.click();
    }
    toggleRowExpansion(responseId: number): void {
        this.expandedRows[responseId] = !this.expandedRows[responseId];
    }

}
