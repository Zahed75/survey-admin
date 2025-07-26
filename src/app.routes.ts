

import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { SurveyComponent } from './app/components/survey/survey.component';
import { RoleComponent } from './app/components/role/role.component';
import { DepartmentComponent } from './app/components/department/department.component';
import { SurveyTargetComponent } from './app/components/survey-target/survey-target.component';
import { SignUpComponent } from './app/components/sign-up/sign-up.component';
import { SignInComponent } from './app/components/sign-in/sign-in.component';
import { authGuard } from '../src/guard/auth.guard';
import { VerifyOtpComponent } from './app/components/verify-otp/verify-otp.component';
import { SurveyTypeComponent } from './app/components/survey-type/survey-type.component';
import { SurveyListComponent } from './app/components/survey-list/survey-list.component';
import { SurveyEditComponent } from './app/components/survey-edit/survey-edit.component';

export const appRoutes: Routes = [
    // Public routes (no auth required)
    { path: 'sign-in', component: SignInComponent },
    { path: 'sign-up', component: SignUpComponent },
    { path: 'otp-verify', component: VerifyOtpComponent },
    { path: 'landing', component: Landing },

    // Protected routes (require authentication)
    {
        path: '',
        component: AppLayout,
        canActivate: [authGuard],
        children: [
            { path: '', component: Dashboard },
            { path: 'survey', component: SurveyComponent },
            { path: 'role', component: RoleComponent },
            { path: 'department', component: DepartmentComponent },
            { path: 'survey-target', component: SurveyTargetComponent },
            { path: 'survey-type', component: SurveyTypeComponent },
            { path: 'survey-edit/:id', component: SurveyEditComponent },

            {path:'survey-list',component: SurveyListComponent },
            {
                path: 'pages',
                loadChildren: () => import('./app/pages/pages.routes'),
                canActivate: [authGuard] // Guard for lazy-loaded module
            }
        ]
    },

    // Error routes
    { path: 'notfound', component: Notfound },

    // Redirects
    { path: '**', redirectTo: '/sign-in' } // Default to sign-in page for unknown routes
];
