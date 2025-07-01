// auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { catchError, throwError } from 'rxjs';

// auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    console.log('Interceptor running for:', req.url); // Debug log

    // Skip for auth-related requests
    if (req.url.includes('/auth/') || req.url.includes('/login')) {
        return next(req);
    }

    const token = authService.getToken();
    console.log('Current token:', token); // Debug log

    if (!token) {
        console.warn('No token found!'); // Debug log
        authService.logout();
        inject(Router).navigate(['/sign-in']);
        return throwError(() => new Error('No authentication token found'));
    }

    const authReq = req.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`
        }
    });

    return next(authReq).pipe(
        catchError((error) => {
            if (error.status === 401) {
                console.warn('401 Unauthorized response!'); // Debug log
                authService.logout();
                inject(Router).navigate(['/sign-in']);
            }
            return throwError(() => error);
        })
    );
};
