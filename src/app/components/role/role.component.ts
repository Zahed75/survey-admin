import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { RoleService } from '../../../services/role/role.service';
import { Toolbar } from 'primeng/toolbar';
import { ToolbarModule } from 'primeng/toolbar'; // Note: Changed from Toolbar to ToolbarModule

@Component({
    selector: 'app-role',
    standalone: true,
    imports: [CommonModule, FormsModule,
        TableModule, ButtonModule, InputTextModule,
        ToastModule, Toolbar,
        ToolbarModule
    ],
    templateUrl: './role.component.html',
    styleUrls: ['./role.component.scss'],
    providers: [MessageService]

})

export class RoleComponent implements OnInit {
    roles: any[] = [];
    cols: any[] = [
        { field: 'id', header: 'ID' },
        { field: 'name', header: 'Role Name' },
        { field: 'platform.name', header: 'Platform' },
        { field: 'platform.description', header: 'Platform Description' }
    ];
    loading: boolean = false;
    searchText: string = '';

    constructor(
        private roleService: RoleService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.loadRoles();
    }

    loadRoles() {
        this.loading = true;
        this.roleService.getAllRoles().subscribe({
            next: (response) => {
                this.roles = response.data || [];
                this.loading = false;
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load roles'
                });
                this.loading = false;
            }
        });
    }

    getProperty(obj: any, path: string) {
        return path.split('.').reduce((o, p) => o && o[p], obj);
    }

    // Placeholder methods for UI actions
    editRole(role: any) {
        this.messageService.add({
            severity: 'info',
            summary: 'Info',
            detail: 'Edit functionality not implemented yet'
        });
    }

    deleteRole(role: any) {
        this.messageService.add({
            severity: 'info',
            summary: 'Info',
            detail: 'Delete functionality not implemented yet'
        });
    }
}
