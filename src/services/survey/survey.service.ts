import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { surveyEnviornment } from '../../enviornments/enviornment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SurveyService {
    private apiUrl = `${surveyEnviornment.apiBaseUrl}/survey/api/survey-types`;

    constructor(private http: HttpClient) { }

    getAllSurveyTypes(): Observable<any> {
        return this.http.get(`${this.apiUrl}/`);
    }

    getSurveyTypeById(id: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/${id}/`);
    }

    createSurveyType(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/create/`, data);
    }

    updateSurveyType(id: number, data: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/update/${id}/`, data);
    }

    deleteSurveyType(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/delete/${id}/`);
    }
}
