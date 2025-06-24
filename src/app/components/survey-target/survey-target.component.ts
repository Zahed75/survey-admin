import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';
import { CardModule } from 'primeng/card';

@Component({
    selector: 'app-survey-target',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ToastModule,
        TableModule,
        ButtonModule,
        DialogModule,
        DropdownModule,
        InputTextModule,
        ToolbarModule,
        CardModule
    ],
    templateUrl: './survey-target.component.html',
    styleUrls: ['./survey-target.component.scss'],
    providers: [MessageService]
})
export class SurveyTargetComponent {
    targets: any[] = [
        { survey: 1, target_type: 'role', role_name: 'Admin' },
        { survey: 2, target_type: 'role', role_name: 'OutletManager' },
        { survey: 3, target_type: 'department', department_name: 'Operations' }
    ];

    targetTypes = [
        { label: 'Role', value: 'role' },
        { label: 'Department', value: 'department' }
    ];

    roles = [
        { name: 'Admin' },
        { name: 'OutletManager' },
        { name: 'Supervisor' }
    ];

    departments = [
        { name: 'Operations' },
        { name: 'Sales' },
        { name: 'Marketing' }
    ];

    displayDialog: boolean = false;
    newTarget: boolean = false;
    target: any = {};
    selectedTargets: any[] = [];

    constructor(private messageService: MessageService) {}

    showDialogToAdd() {
        this.newTarget = true;
        this.target = { target_type: 'role' };
        this.displayDialog = true;
    }

    save() {
        if (this.newTarget) {
            // Generate a fake ID for demo purposes
            this.target.survey = this.targets.length + 1;
            this.targets.push(this.target);
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Target added successfully'
            });
        } else {
            // Update existing target
            const index = this.targets.findIndex(t => t.survey === this.target.survey);
            if (index !== -1) {
                this.targets[index] = this.target;
            }
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Target updated successfully'
            });
        }

        this.target = {};
        this.displayDialog = false;
    }

    deleteSelectedTargets() {
        this.targets = this.targets.filter(val => !this.selectedTargets.includes(val));
        this.selectedTargets = [];
        this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Targets deleted successfully'
        });
    }

    editTarget(target: any) {
        this.newTarget = false;
        this.target = { ...target };
        this.displayDialog = true;
    }

    deleteTarget(target: any) {
        this.targets = this.targets.filter(val => val.survey !== target.survey);
        this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Target deleted successfully'
        });
    }

    onTargetTypeChange() {
        // Clear the name when type changes
        this.target.role_name = undefined;
        this.target.department_name = undefined;
    }
}
