import { Component, OnInit } from '@angular/core';
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
import { DepartmentService } from '../../../services/department/department.service';

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
export class DepartmentComponent implements OnInit {
    departments: any[] = [];
    cols: any[] = [
        { field: 'id', header: 'ID', width: '100px' },
        { field: 'name', header: 'Department Name' },
        { field: 'description', header: 'Description' }
    ];

    selectedDepartment: any;
    displayDialog: boolean = false;
    newDepartment: boolean = false;
    department: any = {};
    loading: boolean = false;

    constructor(
        private messageService: MessageService,
        private departmentService: DepartmentService
    ) {}

    ngOnInit() {
        this.loadDepartments();
    }

    loadDepartments() {
        this.loading = true;
        this.departmentService.getAllDepartments().subscribe({
            next: (response) => {
                this.departments = response.data || [];
                this.loading = false;
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.error?.message || 'Failed to load departments'
                });
                this.loading = false;
            }
        });
    }

    showDialogToAdd() {
        this.newDepartment = true;
        this.department = {};
        this.displayDialog = true;
    }

    save() {
        if (!this.department.name || !this.department.description) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Name and description are required'
            });
            return;
        }

        if (this.newDepartment) {
            this.createDepartment();
        } else {
            this.updateDepartment();
        }
    }

    createDepartment() {
        this.departmentService.createDepartment({
            name: this.department.name,
            description: this.department.description
        }).subscribe({
            next: (response) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: response.message || 'Department created successfully'
                });
                this.loadDepartments();
                this.displayDialog = false;
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.error?.message || 'Failed to create department'
                });
            }
        });
    }

    updateDepartment() {
        this.departmentService.updateDepartment(this.department.id, {
            name: this.department.name,
            description: this.department.description
        }).subscribe({
            next: (response) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: response.message || 'Department updated successfully'
                });
                this.loadDepartments();
                this.displayDialog = false;
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.error?.message || 'Failed to update department'
                });
            }
        });
    }

    delete() {
        if (!this.department.id) return;

        this.departmentService.deleteDepartment(this.department.id).subscribe({
            next: (response) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: response.message || 'Department deleted successfully'
                });
                this.loadDepartments();
                this.displayDialog = false;
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.error?.message || 'Failed to delete department'
                });
            }
        });
    }

    onRowSelect(event: any) {
        this.newDepartment = false;
        this.department = {...event.data};
        this.displayDialog = true;
    }
}
