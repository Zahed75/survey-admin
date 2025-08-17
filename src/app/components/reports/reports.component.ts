// import { Component, OnInit, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { TableModule } from 'primeng/table';
// import { ButtonModule } from 'primeng/button';
// import { InputTextModule } from 'primeng/inputtext';
// import { FormsModule } from '@angular/forms';
// import { ReportsService } from '../../../services/reports/reports.service';
//
// @Component({
//     selector: 'app-reports',
//     standalone: true,
//     imports: [
//         CommonModule,
//         TableModule,
//         ButtonModule,
//         InputTextModule,
//         FormsModule,
//     ],
//     providers: [ReportsService],
//     templateUrl: './reports.component.html',
//     styleUrls: ['./reports.component.scss']
// })
// export class ReportsComponent implements OnInit {
//     private reportsService = inject(ReportsService);
//
//     responses: any[] = [];
//     expandedRows: { [key: number]: boolean } = {};
//     loading = true;
//
//     ngOnInit(): void {
//         this.fetchReports();
//     }
//
//     fetchReports() {
//         this.loading = true;
//         this.reportsService.getSurveyReport().subscribe({
//             next: (res) => {
//                 this.responses = res.responses || [];
//                 this.loading = false;
//             },
//             error: (err) => {
//                 console.error('Failed to fetch reports:', err);
//                 this.loading = false;
//             }
//         });
//     }
//
//     onGlobalFilter(event: Event, dt: any) {
//         const input = event.target as HTMLInputElement;
//         dt.filterGlobal(input.value, 'contains');
//     }
//
//     toggleExpandRow(responseId: number): void {
//         this.expandedRows[responseId] = !this.expandedRows[responseId];
//     }
//
//     isRowExpanded(responseId: number): boolean {
//         return !!this.expandedRows[responseId];
//     }
//
//     downloadCSV() {
//         const csvRows: string[] = [];
//         csvRows.push('Response ID,Submitted By,Survey Title,Submitted At,Category,Question,Answer,Obtained,Marks');
//
//         for (const res of this.responses) {
//             const {
//                 response_id,
//                 submitted_by_user,
//                 survey_title,
//                 submitted_at,
//                 categories
//             } = res;
//
//             for (const category of categories) {
//                 for (const question of category.questions) {
//                     const row = [
//                         response_id,
//                         submitted_by_user,
//                         `"${survey_title}"`,
//                         submitted_at,
//                         `"${category.name}"`,
//                         `"${question.question_text}"`,
//                         `"${question.selected_choice?.text || question.answer || ''}"`,
//                         question.obtained ?? '',
//                         question.marks ?? ''
//                     ];
//                     csvRows.push(row.join(','));
//                 }
//             }
//         }
//
//         const csvContent = csvRows.join('\n');
//         const blob = new Blob([csvContent], { type: 'text/csv' });
//         const link = document.createElement('a');
//         link.href = URL.createObjectURL(blob);
//         link.download = 'survey_report.csv';
//         link.click();
//     }
//     toggleRowExpansion(responseId: number): void {
//         this.expandedRows[responseId] = !this.expandedRows[responseId];
//     }
//
// }
//
//









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
    expandedRows: { [key: number]: boolean } = {}; // Store expanded rows
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

    // Toggle the expansion of the row when clicked
    toggleRowExpansion(responseId: number): void {
        this.expandedRows[responseId] = !this.expandedRows[responseId];
    }

    // Check if a row is expanded
    isRowExpanded(responseId: number): boolean {
        return !!this.expandedRows[responseId];
    }

    // All Type Report CSV Generation
    generateAllTypeCSV() {
        const csvRows: string[] = [];
        csvRows.push('Response ID, Staff ID, User Name, Outlet Code, Submitted By, Survey Title, Submitted At, Category Id, Category Name, Question');

        for (const res of this.responses) {
            const {
                response_id,
                submitted_by_user,
                survey_title,
                submitted_at,
                categories
            } = res;

            // Check if categories is defined and is an array
            if (Array.isArray(categories) && categories.length > 0) {
                for (const category of categories) {
                    for (const question of category.questions) {
                        const row = [
                            response_id,
                            res.staff_id || '—',
                            res.user_name || '—',
                            res.site_code || '—',
                            submitted_by_user,
                            survey_title,
                            submitted_at,
                            category.id || '—',
                            category.name || '—',
                            question.question_text || '—'
                        ];
                        csvRows.push(row.join(','));
                    }
                }
            }
        }

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'all_type_report.csv';
        link.click();
    }

    // Category Wise Report CSV Generation
    generateCategoryWiseCSV() {
        const csvRows: string[] = [];
        csvRows.push('Response ID, Staff ID, User Name, Outlet Code, Survey Id, Survey Name, Category 1, Category 2, Category 3');

        for (const res of this.responses) {
            const {
                response_id,
                submitted_by_user,
                survey_title,
                site_code,
                categories
            } = res;

            // Check if categories is defined and is an array
            if (Array.isArray(categories) && categories.length > 0) {
                const categoryNames = categories.map((cat: { name: string }) => cat.name).join(', ');
                const row = [
                    response_id,
                    res.staff_id || '—',
                    res.user_name || '—',
                    site_code || '—',
                    res.survey_id || '—',
                    survey_title,
                    ...categoryNames.split(',').map(cat => cat || '—')
                ];
                csvRows.push(row.join(','));
            }
        }

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'category_wise_report.csv';
        link.click();
    }

    // Survey Wise Report CSV Generation
    generateSurveyWiseCSV() {
        const csvRows: string[] = [];
        csvRows.push('Response ID, Staff ID, User Name, Outlet Code, Survey Id, Survey Name, Total Questions, Total Answers, Total Marks, Obtained Marks, Result Percentage');

        for (const res of this.responses) {
            const {
                response_id,
                submitted_by_user,
                survey_title,
                site_code,
                categories
            } = res;

            // Check if categories is defined and is an array
            if (Array.isArray(categories) && categories.length > 0) {
                const totalQuestions = categories.reduce((acc: any, cat: any) => acc + cat.questions.length, 0);
                const totalAnswers = categories.reduce((acc: any, cat: any) => acc + cat.questions.filter((q: any) => q.answer).length, 0);
                const totalMarks = categories.reduce((acc: any, cat: any) => acc + cat.total_marks, 0);
                const obtainedMarks = categories.reduce((acc: any, cat: any) => acc + cat.obtained_marks, 0);
                const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;

                const row = [
                    response_id,
                    res.staff_id || '—',
                    res.user_name || '—',
                    site_code || '—',
                    res.survey_id || '—',
                    survey_title,
                    totalQuestions,
                    totalAnswers,
                    totalMarks,
                    obtainedMarks,
                    percentage.toFixed(2) + '%'
                ];
                csvRows.push(row.join(','));
            }
        }

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'survey_wise_report.csv';
        link.click();
    }

    // General CSV Download Action
    downloadCSV(reportType: string) {
        if (reportType === 'all_type') {
            this.generateAllTypeCSV();
        } else if (reportType === 'category_wise') {
            this.generateCategoryWiseCSV();
        } else if (reportType === 'survey_wise') {
            this.generateSurveyWiseCSV();
        }
    }
}





