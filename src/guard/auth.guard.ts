import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const authService = inject(AuthService);

    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
        // Store the attempted URL for redirecting after login
        authService.redirectUrl = state.url;
        router.navigate(['/sign-in']);
        return false;
    }

    // Check for role-based access if specified in route data
    const requiredRoles = route.data?.['roles'] as string[] | undefined;
    const userRole = authService.getRole();

    // If no roles are required, allow access
    if (!requiredRoles) return true;

    // Check if user has required role
    if (!userRole || !requiredRoles.includes(userRole)) {
        router.navigate(['/notfound']);
        return false;
    }

    return true;
};
