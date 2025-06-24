import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { ToolbarModule } from 'primeng/toolbar';

@Component({
    selector: 'app-department',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ToastModule,
        TableModule,
        ButtonModule,
        DialogModule,
        InputTextModule,
        InputTextarea,
        ToolbarModule
    ],
    templateUrl: './department.component.html',
    styleUrls: ['./department.component.scss'],
    providers: [MessageService]
})
export class DepartmentComponent {
    departments: any[] = [
        {
            "id": 1,
            "name": "Software",
            "description": "Software Team"
        },
        {
            "id": 2,
            "name": "Software",
            "description": "Khai Dai Team"
        },
        {
            "id": 3,
            "name": "CG",
            "description": "Test"
        },
        {
            "id": 5,
            "name": "Outlet",
            "description": "Test"
        }
    ];

    cols: any[] = [
        { field: 'id', header: 'ID', width: '100px' },
        { field: 'name', header: 'Department Name' },
        { field: 'description', header: 'Description' }
    ];

    selectedDepartment: any;
    displayDialog: boolean = false;
    newDepartment: boolean = false;
    department: any = {};

    constructor(private messageService: MessageService) {}

    showDialogToAdd() {
        this.newDepartment = true;
        this.department = {};
        this.displayDialog = true;
    }

    save() {
        if (this.newDepartment) {
            // Add new department
            this.department.id = this.getNewId();
            this.departments.push(this.department);
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Department added successfully'
            });
        } else {
            // Update existing department
            this.departments[this.findSelectedDeptIndex()] = this.department;
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Department updated successfully'
            });
        }

        this.department = null;
        this.displayDialog = false;
    }

    delete() {
        this.departments.splice(this.findSelectedDeptIndex(), 1);
        this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Department deleted successfully'
        });
        this.department = null;
        this.displayDialog = false;
    }

    onRowSelect(event: any) {
        this.newDepartment = false;
        this.department = {...event.data};
        this.displayDialog = true;
    }

    private findSelectedDeptIndex(): number {
        return this.departments.findIndex(dept => dept.id === this.selectedDepartment.id);
    }

    private getNewId(): number {
        return Math.max(...this.departments.map(dept => dept.id)) + 1;
    }
}
