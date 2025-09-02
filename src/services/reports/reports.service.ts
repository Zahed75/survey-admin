import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { survey_app } from '../../enviornments/enviornment';

@Injectable({
    providedIn: 'root',
})
export class ReportsService {
    private baseUrl = survey_app.apiBaseUrl;

    constructor(private http: HttpClient) {}

    // Existing method (keep it if you still need it)
    // getSurveyReport(): Observable<any> {
    //     return this.http.get(`${this.baseUrl}/survey/api/survey_csv_report/`);
    // }

    // New method for the 3-type report
    getSurveyReportByType(reportType: string = 'all'): Observable<any> {
        const params = new HttpParams().set('type', reportType);
        return this.http.get(`${this.baseUrl}/survey/api/survey-report/`, { params });
    }
}