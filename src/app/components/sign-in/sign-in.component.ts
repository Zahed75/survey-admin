import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'app-sign-in',
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
        CheckboxModule,
        ToastModule
    ],
    templateUrl: './sign-in.component.html',
    styleUrls: ['./sign-in.component.scss'],
    providers: [MessageService]
})
export class SignInComponent {
    credentials = {
        phone_number: '',
        password: ''
    };
    rememberMe = false;

    constructor(private messageService: MessageService) {}

    onSubmit() {
        // Implement your login logic here
        console.log('Login submitted:', this.credentials);
        this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Logged in successfully!'
        });

        // Reset form after submission if needed
        // this.credentials = { phone_number: '', password: '' };
    }
}
