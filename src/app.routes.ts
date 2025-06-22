import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { SurveyComponent } from './app/components/survey/survey.component';
import { RoleComponent } from './app/components/role/role.component';
import { DecimalPipe } from '@angular/common';
import { DepartmentComponent } from './app/components/department/department.component';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        children: [
            { path: '', component: Dashboard },
            {
                path: 'survey',
                component: SurveyComponent
            },
            {
                path:'role',
                component:RoleComponent
            },
            {
                path:'department',
                component:DepartmentComponent
            },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
        ]
    },
    { path: 'landing', component: Landing },
    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
