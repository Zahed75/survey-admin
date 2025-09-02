import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ReportsService } from '../../../services/reports/reports.service';
import { TooltipModule } from 'primeng/tooltip';
import { TabViewModule } from 'primeng/tabview';

@Component({
    selector: 'app-reports',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        FormsModule,
        TooltipModule,
        TabViewModule
    ],
    providers: [ReportsService],
    templateUrl: './reports.component.html',
    styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
    private reportsService = inject(ReportsService);

    allTypeData: any[] = [];
    categoryWiseData: any[] = [];
    surveyWiseData: any[] = [];
    activeTabIndex: number = 0;
    loading = false;
    responsiveLayout: string = 'stack';

    ngOnInit(): void {
        this.fetchAllReports();
    }

    fetchAllReports() {
        this.loading = true;
        
        // Fetch all three report types
        this.reportsService.getSurveyReportByType('all').subscribe({
            next: (res: any) => {
                this.allTypeData = res.data || [];
                this.loading = false;
            },
            error: (err: any) => {
                console.error('Failed to fetch all type report:', err);
                this.loading = false;
            }
        });

        this.reportsService.getSurveyReportByType('category').subscribe({
            next: (res: any) => {
                this.categoryWiseData = res.data || [];
            },
            error: (err: any) => {
                console.error('Failed to fetch category report:', err);
            }
        });

        this.reportsService.getSurveyReportByType('survey').subscribe({
            next: (res: any) => {
                this.surveyWiseData = res.data || [];
            },
            error: (err: any) => {
                console.error('Failed to fetch survey report:', err);
            }
        });
    }

    onTabChange(event: any) {
        this.activeTabIndex = event.index;
    }

    onSearchInput(event: Event, table: any): void {
        const inputElement = event.target as HTMLInputElement;
        if (inputElement && table) {
            table.filterGlobal(inputElement.value, 'contains');
        }
    }

    downloadCSV() {
        // Create CSV content with three tabs/sections
        const csvContent = this.generateCSVContent();
        
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

    private generateCSVContent(): string {
        // Tab 1: All Type Report
        const allTypeCSV = this.generateAllTypeCSV();
        
        // Tab 2: Category Wise Report
        const categoryWiseCSV = this.generateCategoryWiseCSV();
        
        // Tab 3: Survey Wise Report
        const surveyWiseCSV = this.generateSurveyWiseCSV();
        
        // Combine all with sheet names (Excel will interpret these as tabs)
        return [
            '=== ALL TYPE REPORT ===',
            allTypeCSV.header.join(','),
            ...allTypeCSV.rows.map(row => row.join(',')),

            '\n\n=== CATEGORY WISE REPORT ===',
            categoryWiseCSV.header.join(','),
            ...categoryWiseCSV.rows.map(row => row.join(',')),

            '\n\n=== SURVEY WISE REPORT ===',
            surveyWiseCSV.header.join(','),
            ...surveyWiseCSV.rows.map(row => row.join(','))
        ].join('\n');
    }

    private generateAllTypeCSV(): { header: string[]; rows: any[][] } {
        const header = [
            'Response ID',
            'StaffId',
            'User Name',
            'User Phone',
            'Site_code',
            'Survey Title',
            'Category Name',
            'Question',
            'Total score',
            'Question Has Marks',
            'Marks obtained'
        ];

        const rows = this.allTypeData.map(item => [
            item['Response ID'],
            item['StaffId'],
            item['User Name'],
            item['User Phone'],
            item['Site_code'],
            item['Survey Title'],
            item['Category Name'],
            item['Question'],
            item['Total score'],
            item['Question Has Marks'] ? 'Yes' : 'No',
            item['Marks obtained']
        ]);

        return { header, rows };
    }

    private generateCategoryWiseCSV(): { header: string[]; rows: any[][] } {
        const header = [
            'Survey Name',
            'Category Name',
            'User Name',
            'User Phone',
            'Total Marks',
            'Obtained Marks',
            'Question Category Score Percentage'
        ];

        const rows = this.categoryWiseData.map(item => [
            item['Survey Name'],
            item['Category Name'],
            item['User Name'],
            item['User Phone'],
            item['Total Marks'],
            item['Obtained Marks'],
            item['Question Category Score Percentage']
        ]);

        return { header, rows };
    }

    private generateSurveyWiseCSV(): { header: string[]; rows: any[][] } {
        const header = [
            'Survey Name',
            'User Name',
            'User Phone',
            'Survey Id',
            'Site_Code',
            'Total Question',
            'Total Answer',
            'Total Marks',
            'Obtained Marks',
            'Result Percentage'
        ];

        const rows = this.surveyWiseData.map(item => [
            item['Survey Name'],
            item['User Name'],
            item['User Phone'],
            item['Survey Id'],
            item['Site_Code'],
            item['Total Question'],
            item['Total Answer'],
            item['Total Marks'],
            item['Obtained Marks'],
            item['Result Percentage']
        ]);

        return { header, rows };
    }
}