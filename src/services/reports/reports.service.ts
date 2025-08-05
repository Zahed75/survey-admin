import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { survey_app } from '../../enviornments/enviornment';

@Injectable({
    providedIn: 'root',
})
export class ReportsService {
    private baseUrl = survey_app.apiBaseUrl;

    constructor(private http: HttpClient) {}

    getSurveyReport(): Observable<any> {
        return this.http.get(`${this.baseUrl}/survey/api/survey_csv_report/`);
    }
}
