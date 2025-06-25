import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { surveyEnviornment } from '../../enviornments/enviornment';
import { Observable } from 'rxjs';
import { MessageService } from 'primeng/api';

@Injectable({
    providedIn: 'root'
})
export class DepartmentService {
    private apiUrl = `${surveyEnviornment.apiBaseUrl}/survey/api/departments`;

    constructor(private http: HttpClient) {}

    // Get all departments
    getAllDepartments(): Observable<any> {
        return this.http.get(`${this.apiUrl}/`);
    }

    // Get department by ID
    getDepartmentById(id: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/${id}/`);
    }

    // Create new department
    createDepartment(department: {name: string, description: string}): Observable<any> {
        return this.http.post(`${this.apiUrl}/create/`, department);
    }

    // Update department
    updateDepartment(id: number, department: {name: string, description: string}): Observable<any> {
        return this.http.put(`${this.apiUrl}/update/${id}/`, department);
    }

    // Delete department
    deleteDepartment(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/delete/${id}/`);
    }
}
