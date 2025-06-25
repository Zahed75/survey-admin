import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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
    imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, PasswordModule, DividerModule, CheckboxModule, ToastModule, RouterLink],
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

    constructor(
        private messageService: MessageService,
        private router: Router
    ) {}

    onSubmit() {
        // Basic validation
        if (!this.credentials.phone_number || !this.credentials.password) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Please enter both phone number and password'
            });
            return;
        }

        // Simulate successful login
        this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Logged in successfully!'
        });

        // Redirect to dashboard
        this.router.navigate(['/']);
    }
}
