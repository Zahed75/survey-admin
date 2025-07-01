import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environmentCentral } from '../../enviornments/enviornment';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private baseURL = `${environmentCentral.apiBaseUrl}`;
    private tokenKey = 'access_token';
    private userKey = 'current_user';
    redirectUrl: string | null = null;

    constructor(
        private http: HttpClient,
        private router: Router
    ) { }

    // Register new user
    register(userData: {
        name: string;
        phone_number: string;
        password: string;
        email: string;
        staff_id: number;
        designation: string;
    }): Observable<any> {
        return this.http.post(`${this.baseURL}api/user/register`, userData);
    }

    // Verify OTP
    verifyOTP(otpData: {
        phone_number: string;
        otp: number;
    }): Observable<any> {
        return this.http.post(`${this.baseURL}/verify-otp`, otpData).pipe(
            tap((response: any) => {
                if (response.user) {
                    this.setUser(response.user);
                }
            })
        );
    }

    // Login user
    login(credentials: {
        phone_number: string;
        password: string;
    }): Observable<any> {
        return this.http.post(`${this.baseURL}/api/user/login`, credentials).pipe(
            tap((response: any) => {
                this.setToken(response.access_token);
                this.setUser(response.user);
            })
        );
    }

    // Logout user
    logout(): void {
        this.clearAuthData();
        this.router.navigate(['/sign-in']);
    }

    // Check if user is authenticated
    isAuthenticated(): boolean {
        return !!this.getToken();
    }



    // Get current user
    getCurrentUser(): any {
        const user = localStorage.getItem(this.userKey);
        return user ? JSON.parse(user) : null;
    }

    // Get user role
    getRole(): string | null {
        const user = this.getCurrentUser();
        return user ? user.role : null;
    }

    // Check if user is staff
    isStaff(): boolean {
        return this.getRole() === 'staff';
    }





    getToken(): string | null {
        const token = localStorage.getItem(this.tokenKey); // Changed TOKEN_KEY to tokenKey
        console.log('Retrieved token:', token);
        return token;
    }

    setToken(token: string): void {
        console.log('Setting token:', token);
        localStorage.setItem(this.tokenKey, token); // Changed TOKEN_KEY to tokenKey
    }



    private setUser(user: any): void {
        localStorage.setItem(this.userKey, JSON.stringify(user));
    }

    private clearAuthData(): void {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
    }

    // Token refresh (if needed)
    refreshToken(): Observable<any> {
        // Implement if your API supports token refresh
        throw new Error('Not implemented');
    }

    // Check permissions (extend as needed)
    hasPermission(permission: string): boolean {
        // Implement your permission logic based on user role
        const user = this.getCurrentUser();
        if (!user) return false;

        // Example permission check - adjust based on your requirements
        if (user.role === 'admin') return true;
        if (user.role === 'staff' && permission === 'dashboard') return true;

        return false;
    }
}
