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
    countdown = 60; // Countdown for resend OTP
    countdownInterval: any;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService,
        private messageService: MessageService
    ) {
        this.otpData.phone_number = this.route.snapshot.queryParams['phone_number'] || '';
        this.startCountdown();
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

                // Redirect to sign-in after successful verification
                setTimeout(() => {
                    this.router.navigate(['/sign-in']);
                }, 1500);
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

    // resendOTP() {
    //     if (this.countdown > 0) return;
    //
    //     this.isLoading = true;
    //     this.authService.resendOTP(this.otpData.phone_number).subscribe({
    //         next: (response) => {
    //             this.isLoading = false;
    //             this.messageService.add({
    //                 severity: 'success',
    //                 summary: 'Success',
    //                 detail: response.message || 'OTP resent successfully!'
    //             });
    //             this.startCountdown();
    //         },
    //         error: (error) => {
    //             this.isLoading = false;
    //             const errorMessage = error.error?.message || 'Failed to resend OTP';
    //             this.messageService.add({
    //                 severity: 'error',
    //                 summary: 'Error',
    //                 detail: errorMessage
    //             });
    //         }
    //     });
    // }

    startCountdown() {
        this.countdown = 60;
        this.countdownInterval = setInterval(() => {
            this.countdown--;
            if (this.countdown <= 0) {
                clearInterval(this.countdownInterval);
            }
        }, 1000);
    }

    ngOnDestroy() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
    }
}
