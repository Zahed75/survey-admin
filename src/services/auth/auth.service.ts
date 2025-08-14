// src/app/services/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environmentCentral } from '../../enviornments/enviornment';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private baseURL = `${environmentCentral.apiBaseUrl}`; // e.g. https://api.shwapno.app
    private tokenKey = 'access_token';
    private refreshKey = 'refresh_token';
    private userKey = 'current_user';
    redirectUrl: string | null = null;

    constructor(private http: HttpClient, private router: Router) {}

    // Register new user
    register(userData: {
        name: string;
        phone_number: string;
        password: string;
        email: string;
        staff_id: number | string;
        designation: string;
    }): Observable<any> {
        // NOTE: added missing slash after baseURL
        return this.http.post(`${this.baseURL}/api/user/register`, userData);
    }

    // Verify OTP (kept as-is; adjust if your verify API returns different shape)
    verifyOTP(otpData: { phone_number: string; otp: number }): Observable<any> {
        return this.http.post(`${this.baseURL}/verify-otp`, otpData).pipe(
            tap((response: any) => {
                // If your verify endpoint returns a "user" object/array, persist it
                const rawUser = Array.isArray(response?.user) ? response.user[0] : response?.user;
                if (rawUser) this.setUser(rawUser);
            })
        );
    }

    // Login user — parse token from user[0].access_token
    login(credentials: { phone_number: string; password: string }): Observable<any> {
        return this.http.post(`${this.baseURL}/api/user/login`, credentials).pipe(
            tap((response: any) => {
                // Response example:
                // { message: 'Login successful.', user: [{ access_token, refresh_token, ... }] }
                const rawUser = Array.isArray(response?.user) ? response.user[0] : response?.user;

                const access = rawUser?.access_token;
                const refresh = rawUser?.refresh_token;

                if (access) this.setToken(access);
                if (refresh) localStorage.setItem(this.refreshKey, refresh);

                if (rawUser) this.setUser(rawUser);
            })
        );
    }

    // Logout user
    logout(): void {
        this.clearAuthData();
        this.router.navigate(['/sign-in']);
    }

    // Check if user is authenticated (token-based)
    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    // Get current user
    getCurrentUser(): any {
        const raw = localStorage.getItem(this.userKey);
        return raw ? JSON.parse(raw) : null;
    }

    // Get user role (supports role object { name: 'user' } or plain string)
    getRole(): string | null {
        const u = this.getCurrentUser();
        const r = u?.role;
        return r?.name ?? (typeof r === 'string' ? r : null);
    }

    // Token helpers
    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    setToken(token: string): void {
        if (token) localStorage.setItem(this.tokenKey, token);
    }

    private setUser(user: any): void {
        // Store a single user object, not the array
        localStorage.setItem(this.userKey, JSON.stringify(user));
    }

    private clearAuthData(): void {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.refreshKey);
        localStorage.removeItem(this.userKey);
    }

    // Optional: implement if your API supports token refresh
    refreshToken(): Observable<any> {
        throw new Error('Not implemented');
    }

    // Example permission check (adjust to your needs)
    hasPermission(permission: string): boolean {
        const role = this.getRole();
        if (!role) return false;
        if (role === 'admin') return true;
        if (role === 'staff' && permission === 'dashboard') return true;
        return false;
    }
}
