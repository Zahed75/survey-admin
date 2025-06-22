import { Component } from '@angular/core';
import { Toast } from 'primeng/toast';
import { Toolbar } from 'primeng/toolbar';
import { PrimeTemplate } from 'primeng/api';
import { InputText } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { Dialog } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { Textarea } from 'primeng/textarea';
import { ButtonDirective } from 'primeng/button';
import { NgForOf, NgIf } from '@angular/common';

@Component({
    selector: 'app-department',
    templateUrl: './department.component.html',
    imports: [Toast, Toolbar, PrimeTemplate, InputText, TableModule, Dialog, FormsModule, Textarea, ButtonDirective, NgIf, NgForOf],
    styleUrls: ['./department.component.scss']
})
export class DepartmentComponent {
    departments: any[] = [
        {
            id: 1,
            name: 'Software',
            description: 'Software Team'
        },
        {
            id: 2,
            name: 'Software',
            description: 'Khai Dai Team'
        },
        {
            id: 3,
            name: 'CG',
            description: 'Test'
        },
        {
            id: 5,
            name: 'Outlet',
            description: 'Test'
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
        } else {
            // Update existing department
            this.departments[this.findSelectedDeptIndex()] = this.department;
        }

        this.department = null;
        this.displayDialog = false;
    }

    delete() {
        this.departments.splice(this.findSelectedDeptIndex(), 1);
        this.department = null;
        this.displayDialog = false;
    }

    onRowSelect(event: any) {
        this.newDepartment = false;
        this.department = { ...event.data };
        this.displayDialog = true;
    }

    private findSelectedDeptIndex(): number {
        return this.departments.findIndex((dept) => dept.id === this.selectedDepartment.id);
    }

    private getNewId(): number {
        return Math.max(...this.departments.map((dept) => dept.id)) + 1;
    }
}
