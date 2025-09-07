


import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ReportsService } from '../../../services/reports/reports.service';
import { TooltipModule } from 'primeng/tooltip';
import { TabViewModule } from 'primeng/tabview';
import * as XLSX from 'xlsx';

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

    downloadExcel() {
        // Check if all data is loaded
        if (!this.allTypeData.length || !this.categoryWiseData.length || !this.surveyWiseData.length) {
            console.warn('Some report data is not loaded yet. Please wait for all reports to load.');
            alert('Please wait for all reports to load before downloading.');
            return;
        }
        
        // Create workbook
        const workbook = XLSX.utils.book_new();
        
        // Add All Type Report sheet
        const allTypeWS = XLSX.utils.json_to_sheet(this.prepareDataForExcel(this.allTypeData, 'all'));
        XLSX.utils.book_append_sheet(workbook, allTypeWS, 'All Type Report');
        
        // Add Category Wise Report sheet
        const categoryWS = XLSX.utils.json_to_sheet(this.prepareDataForExcel(this.categoryWiseData, 'category'));
        XLSX.utils.book_append_sheet(workbook, categoryWS, 'Category Wise Report');
        
        // Add Survey Wise Report sheet
        const surveyWS = XLSX.utils.json_to_sheet(this.prepareDataForExcel(this.surveyWiseData, 'survey'));
        XLSX.utils.book_append_sheet(workbook, surveyWS, 'Survey Wise Report');
        
        // Generate and download Excel file
        XLSX.writeFile(workbook, 'survey_reports.xlsx');
    }

    private prepareDataForExcel(data: any[], reportType: string): any[] {
        // Convert data to Excel-friendly format
        return data.map(item => {
            const excelRow: any = {};
            
            switch(reportType) {
                case 'all':
                    excelRow['Response ID'] = item['Response ID'];
                    excelRow['StaffId'] = item['StaffId'];
                    excelRow['User Name'] = item['User Name'];
                    excelRow['User Phone'] = item['User Phone'];
                    excelRow['Site_code'] = item['Site_code'];
                    excelRow['Survey Title'] = item['Survey Title'];
                    excelRow['Category Name'] = item['Category Name'];
                    excelRow['Question'] = item['Question'];
                    excelRow['Total score'] = item['Total score'];
                    excelRow['Question Has Marks'] = item['Question Has Marks'] ? 'Yes' : 'No';
                    excelRow['Marks obtained'] = item['Marks obtained'];
                    excelRow['Survey Submitted Date Time'] = item['Survey Submitted Date Time'];
                    excelRow['User Submitted Answer'] = item['User Submitted Answer'];
                    break;
                    
                case 'category':
                    excelRow['Response ID'] = item['Response ID']; // Updated field name
                    excelRow['StaffId'] = item['StaffId']; // Updated field name
                    excelRow['User Name'] = item['User Name'];
                    excelRow['User Phone'] = item['User Phone'];
                    excelRow['Site_code'] = item['Site_code']; // Updated field name
                    excelRow['Survey Name'] = item['Survey Name'];
                    excelRow['Category Name'] = item['Category Name'];
                    excelRow['Total Marks'] = item['Total Marks'];
                    excelRow['Obtained Marks'] = item['Obtained Marks'];
                    excelRow['Question Category Score Percentage'] = item['Question Category Score Percentage'];
                    excelRow['Remarks'] = item['Remarks'];
                    break;
                    
                case 'survey':
                    excelRow['Response ID'] = item['Response ID']; // Updated field name
                    excelRow['StaffId'] = item['StaffId']; // Updated field name
                    excelRow['User Name'] = item['User Name'];
                    excelRow['User Phone'] = item['User Phone'];
                    excelRow['Site_code'] = item['Site_code']; // Updated field name
                    excelRow['Survey Title'] = item['Survey Title']; // Updated field name
                    excelRow['Survey Id'] = item['Survey Id'];
                    excelRow['Total Question'] = item['Total Question'];
                    excelRow['Total Answer'] = item['Total Answer'];
                    excelRow['Total Marks'] = item['Total Marks'];
                    excelRow['Obtained Marks'] = item['Obtained Marks'];
                    excelRow['Result Percentage'] = item['Result Percentage'];
                    break;
            }
            
            return excelRow;
        });
    }
}