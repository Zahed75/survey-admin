import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { survey_app } from '../../enviornments/enviornment';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service'; // Add this import

@Injectable({
    providedIn: 'root'
})
export class SurveyService {
    private apiUrl = `${survey_app.apiBaseUrl}/survey/api`;

    constructor(
        private http: HttpClient,
        private authService: AuthService // Inject AuthService
    ) { }

    private getAuthHeaders(): HttpHeaders {
        const token = this.authService.getToken();
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
    }

    // Updated methods to include auth headers
    getAllSurveyTypes(): Observable<any> {
        return this.http.get(`${this.apiUrl}/survey-types/`, {
            headers: this.getAuthHeaders()
        });
    }

    getSurveyTypeById(id: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/survey-types/${id}/`, {
            headers: this.getAuthHeaders()
        });
    }

    createSurveyType(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/survey-types/create/`, data, {
            headers: this.getAuthHeaders()
        });
    }

    updateSurveyType(id: number, data: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/survey-types/update/${id}/`, data, {
            headers: this.getAuthHeaders()
        });
    }

    deleteSurveyType(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/survey-types/delete/${id}/`, {
            headers: this.getAuthHeaders()
        });
    }

    // Survey methods
    getAllSurveys(): Observable<any> {
        return this.http.get(`${this.apiUrl}/surveys/`, {
            headers: this.getAuthHeaders()
        });
    }

    getSurveyById(id: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/surveys/${id}/`, {
            headers: this.getAuthHeaders()
        });
    }

    createSurvey(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/surveys/create/`, data, {
            headers: this.getAuthHeaders()
        });
    }

    updateSurvey(id: number, data: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/surveys/update/${id}/`, data, {
            headers: this.getAuthHeaders()
        });
    }

    deleteSurvey(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/surveys/delete/${id}/`, {
            headers: this.getAuthHeaders()
        });
    }

    // Question methods
    getQuestionsBySurvey(surveyId: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/questions/?survey=${surveyId}`, {
            headers: this.getAuthHeaders()
        });
    }

    // Target methods
    getTargetsBySurvey(surveyId: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/survey-targets/?survey=${surveyId}`, {
            headers: this.getAuthHeaders()
        });
    }

    getAllSites(): Observable<any> {
        return this.http.get(`https://api.shwapno.app/api/sites`);
    }


}
