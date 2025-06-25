import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
    selector: 'app-sign-up',
    standalone: true,
    imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, PasswordModule, DividerModule, ToastModule, RouterLink],
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
        staff_id: null as number | null,
        designation: ''
    };
    isLoading = false;
    termsAccepted = false;

    constructor(
        private messageService: MessageService,
        private authService: AuthService,
        private router: Router
    ) {}

    onSubmit() {
        // Validate form
        if (!this.termsAccepted) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Please accept the terms and conditions'
            });
            return;
        }

        if (!this.user.phone_number || !this.user.password) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Phone number and password are required'
            });
            return;
        }

        this.isLoading = true;

        // Call registration API
        this.authService
            .register({
                name: this.user.name,
                phone_number: this.user.phone_number,
                password: this.user.password,
                email: this.user.email,
                staff_id: this.user.staff_id || 0,
                designation: this.user.designation
            })
            .subscribe({
                next: (response) => {
                    this.isLoading = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: response.message || 'Registration successful! Check your phone for OTP.'
                    });

                    // Redirect to OTP verification with phone number
                    this.router.navigate(['/otp-verify'], {
                        queryParams: { phone_number: this.user.phone_number }
                    });
                },
                error: (error) => {
                    this.isLoading = false;
                    const errorMessage = error.error?.message || 'Registration failed. Please try again.';
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: errorMessage
                    });
                }
            });
    }
}
