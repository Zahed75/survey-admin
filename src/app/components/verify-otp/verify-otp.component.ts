import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
    selector: 'app-verify-otp',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        InputTextModule,
        ButtonModule,
        ToastModule
    ],
    templateUrl: './verify-otp.component.html',
    styleUrls: ['./verify-otp.component.scss'],
    providers: [MessageService]
})
export class VerifyOtpComponent {
    otpData = {
        phone_number: '',
        otp: null as number | null
    };
    isLoading = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService,
        private messageService: MessageService
    ) {
        this.otpData.phone_number = this.route.snapshot.queryParams['phone_number'] || '';
    }

    onSubmit() {
        if (!this.otpData.phone_number || !this.otpData.otp) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Please enter OTP'
            });
            return;
        }

        this.isLoading = true;

        this.authService.verifyOTP({
            phone_number: this.otpData.phone_number,
            otp: this.otpData.otp!
        }).subscribe({
            next: (response) => {
                this.isLoading = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'OTP verified successfully!'
                });
                this.router.navigate(['/sign-in']);
            },
            error: (error) => {
                this.isLoading = false;
                const errorMessage = error.error?.message || 'OTP verification failed';
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: errorMessage
                });
            }
        });
    }
}
