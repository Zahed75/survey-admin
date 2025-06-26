import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { surveyEnviornment } from '../../enviornments/enviornment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SurveyService {
    private apiUrl = `${surveyEnviornment.apiBaseUrl}/survey/api`;

    constructor(private http: HttpClient) { }

    // Survey Type methods
    getAllSurveyTypes(): Observable<any> {
        return this.http.get(`${this.apiUrl}/survey-types/`);
    }

    getSurveyTypeById(id: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/survey-types/${id}/`);
    }

    createSurveyType(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/survey-types/create/`, data);
    }

    updateSurveyType(id: number, data: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/survey-types/update/${id}/`, data);
    }

    deleteSurveyType(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/survey-types/delete/${id}/`);
    }

    // Survey methods
    getAllSurveys(): Observable<any> {
        return this.http.get(`${this.apiUrl}/surveys/`);
    }

    getSurveyById(id: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/surveys/${id}/`);
    }

    createSurvey(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/surveys/create/`, data);
    }

    updateSurvey(id: number, data: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/surveys/update/${id}/`, data);
    }

    deleteSurvey(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/surveys/delete/${id}/`);
    }

    // Question methods
    getQuestionsBySurvey(surveyId: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/questions/?survey=${surveyId}`);
    }

    // Target methods
    getTargetsBySurvey(surveyId: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/survey-targets/?survey=${surveyId}`);
    }
}
