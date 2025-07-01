import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environmentCentral } from '../../enviornments/enviornment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class RoleService {
    private apiUrl = `${environmentCentral.apiBaseUrl}/api/roles`;

    constructor(private http: HttpClient) {} // Removed MessageService dependency

    getAllRoles(): Observable<any> {
        return this.http.get(`${this.apiUrl}`);
    }
}
