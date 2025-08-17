import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ReportsService } from '../../../services/reports/reports.service';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'app-reports',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        FormsModule,
        TooltipModule
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
    responsiveLayout: string = 'stack';

    ngOnInit(): void {
        this.fetchReports();
    }

    fetchReports() {
        this.loading = true;
        this.reportsService.getSurveyReport().subscribe({
            next: (res: any) => {
                this.responses = res.responses || [];
                this.loading = false;
            },
            error: (err: any) => {
                console.error('Failed to fetch reports:', err);
                this.loading = false;
            }
        });
    }

    onGlobalFilter(event: Event, dt: any) {
        const input = event.target as HTMLInputElement;
        dt.filterGlobal(input.value, 'contains');
    }

    toggleRowExpansion(responseId: number): void {
        this.expandedRows[responseId] = !this.expandedRows[responseId];
    }

    isRowExpanded(responseId: number): boolean {
        return !!this.expandedRows[responseId];
    }

    calculatePercentage(obtained: number, total: number): number {
        if (!total || total === 0) return 0;
        const percentage = (obtained / total) * 100;
        return Math.min(100, Math.max(0, Math.round(percentage * 100) / 100));
    }

    downloadCSV() {
        // Prepare data for all three reports
        const allTypeReport = this.generateAllTypeReport();
        const categoryWiseReport = this.generateCategoryWiseReport();
        const surveyWiseReport = this.generateSurveyWiseReport();

        // Create CSV content with three sections
        const csvContent = [
            '=== ALL TYPE REPORT ===',
            allTypeReport.header.join(','),
            ...allTypeReport.rows.map(row => row.join(',')),

            '\n\n=== CATEGORY WISE REPORT ===',
            categoryWiseReport.header.join(','),
            ...categoryWiseReport.rows.map(row => row.join(',')),

            '\n\n=== SURVEY WISE REPORT ===',
            surveyWiseReport.header.join(','),
            ...surveyWiseReport.rows.map(row => row.join(','))
        ].join('\n');

        // Create and download the CSV file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', 'survey_reports.csv');
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    private generateAllTypeReport(): { header: string[]; rows: any[][] } {
        const header = [
            'Response ID',
            'Staff ID',
            'User Name',
            'Outlet Code',
            'Survey Title',
            'Submitted At',
            'Category Name',
            'Question',
            'Answer',
            'Marks',
            'Obtained Marks',
            'Percentage'
        ];

        const rows = [];
        for (const response of this.responses) {
            for (const category of response.categories || []) {
                for (const question of category.questions || []) {
                    rows.push([
                        response['Response ID'],
                        response['Staff ID'],
                        response['Name'],
                        response['Outlet Code'],
                        response['Survey Name'],
                        response['Submitted At'],
                        category.name,
                        question.question_text,
                        question.selected_choice?.text || question.answer || 'No answer',
                        question.marks || 0,
                        question.obtained || 0,
                        (question.percentage || 0) + '%'
                    ]);
                }
            }
        }
        return { header, rows };
    }

    private generateCategoryWiseReport(): { header: string[]; rows: any[][] } {
        const header = [
            'Response ID',
            'Staff ID',
            'User Name',
            'Outlet Code',
            'Survey Title',
            ...this.getUniqueCategoryNames()
        ];

        const rows = [];
        for (const response of this.responses) {
            const row = [
                response['Response ID'],
                response['Staff ID'],
                response['Name'],
                response['Outlet Code'],
                response['Survey Name']
            ];

            const categoryMap = new Map<string, number>();
            for (const category of response.categories || []) {
                categoryMap.set(category.name, category.percentage || 0);
            }

            for (const categoryName of this.getUniqueCategoryNames()) {
                row.push(categoryMap.get(categoryName) || 0);
            }

            rows.push(row);
        }
        return { header, rows };
    }

    private generateSurveyWiseReport(): { header: string[]; rows: any[][] } {
        const header = [
            'Response ID',
            'Staff ID',
            'User Name',
            'Outlet Code',
            'Survey Title',
            'Total Questions',
            'Total Answered',
            'Total Marks',
            'Obtained Marks',
            'Percentage'
        ];

        const rows = [];
        for (const response of this.responses) {
            let totalQuestions = 0;
            let totalAnswered = 0;
            let totalMarks = 0;
            let obtainedMarks = 0;

            for (const category of response.categories || []) {
                for (const question of category.questions || []) {
                    totalQuestions++;
                    totalMarks += question.marks || 0;
                    obtainedMarks += question.obtained || 0;
                    if (question.answer || question.selected_choice) {
                        totalAnswered++;
                    }
                }
            }

            rows.push([
                response['Response ID'],
                response['Staff ID'],
                response['Name'],
                response['Outlet Code'],
                response['Survey Name'],
                totalQuestions,
                totalAnswered,
                totalMarks,
                obtainedMarks,
                totalMarks > 0 ? ((obtainedMarks / totalMarks) * 100).toFixed(2) + '%' : '0%'
            ]);
        }
        return { header, rows };
    }

    private getUniqueCategoryNames(): string[] {
        const categories = new Set<string>();
        for (const response of this.responses) {
            for (const category of response.categories || []) {
                categories.add(category.name);
            }
        }
        return Array.from(categories);
    }
}
