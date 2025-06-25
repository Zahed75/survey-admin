import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
    selector: 'app-sign-in',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
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
    isLoading = false;

    constructor(
        private messageService: MessageService,
        private router: Router,
        private authService: AuthService
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

        this.isLoading = true;

        // Call the authentication service
        this.authService.login(this.credentials).subscribe({
            next: (response) => {
                this.isLoading = false;

                // Show success message
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Logged in successfully!'
                });

                // Redirect to dashboard or stored URL
                const redirectUrl = this.authService.redirectUrl || '/';
                this.router.navigate([redirectUrl]);
            },
            error: (error) => {
                this.isLoading = false;

                // Show error message
                let errorMessage = 'Login failed. Please try again.';
                if (error.error?.message) {
                    errorMessage = error.error.message;
                } else if (error.status === 401) {
                    errorMessage = 'Invalid phone number or password';
                }

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: errorMessage
                });
            }
        });
    }
}
