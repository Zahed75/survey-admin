import { Component } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { NgForOf } from '@angular/common';

@Component({
    selector: 'app-role',
    templateUrl: './role.component.html',
    imports: [TableModule, ButtonDirective, InputText, NgForOf],
    styleUrls: ['./role.component.scss']
})
export class RoleComponent {
    roles: any[] = [
        {
            id: 1,
            name: 'Admin',
            platform: {
                id: 1,
                name: 'View Fish Inventory',
                description: 'Heavy Products'
            }
        },
        {
            id: 2,
            name: 'Manager',
            platform: {
                id: 1,
                name: 'View Fish Inventory',
                description: 'Heavy Products'
            }
        },
        {
            id: 3,
            name: 'Admin',
            platform: {
                id: 1,
                name: 'View Fish Inventory',
                description: 'Heavy Products'
            }
        }
    ];

    cols: any[] = [
        { field: 'id', header: 'ID' },
        { field: 'name', header: 'Role Name' },
        { field: 'platform.name', header: 'Platform' },
        { field: 'platform.description', header: 'Platform Description' }
    ];

    getProperty(obj: any, path: string) {
        return path.split('.').reduce((o, p) => o && o[p], obj);
    }

    // Placeholder methods for UI actions
    editRole(role: any) {
        console.log('Edit role:', role);
        // Implement edit functionality later
    }

    deleteRole(role: any) {
        console.log('Delete role:', role);
        // Implement delete functionality later
    }
}
