import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'app-sign-up',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        InputTextModule,
        ButtonModule,
        PasswordModule,
        DividerModule,
        ToastModule
    ],
    templateUrl: './sign-up.component.html',
    styleUrls: ['./sign-up.component.scss'],
    providers: [MessageService]
})
export class SignUpComponent {
    user = {
        name: '',
        phone_number: '',
        password: '',
        email: '',
        staff_id: null,
        designation: ''
    };

    constructor(private messageService: MessageService) {}

    onSubmit() {
        // Implement your signup logic here
        console.log('Form submitted:', this.user);
        this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Account created successfully!'
        });

        // Reset form after submission
        this.user = {
            name: '',
            phone_number: '',
            password: '',
            email: '',
            staff_id: null,
            designation: ''
        };
    }
}
