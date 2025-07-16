// import { Component, OnInit } from '@angular/core';
// import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
// import { MessageService } from 'primeng/api';
// import { SurveyService } from '../../../services/survey/survey.service';
// import { DepartmentService } from '../../../services/department/department.service';
// import { Router } from '@angular/router';
// import { CommonModule } from '@angular/common';
// import { ReactiveFormsModule } from '@angular/forms';
//
// // PrimeNG Components
// import { Card } from 'primeng/card';
// import { DropdownModule } from 'primeng/dropdown';
// import { InputSwitchModule } from 'primeng/inputswitch';
// import { ButtonModule } from 'primeng/button';
// import { InputTextModule } from 'primeng/inputtext';
// import { InputTextarea } from 'primeng/inputtextarea';
// import { InputNumberModule } from 'primeng/inputnumber';
// import { CheckboxModule } from 'primeng/checkbox';
// import { ProgressSpinnerModule } from 'primeng/progressspinner';
// import { MultiSelect } from 'primeng/multiselect';
//
// interface Question {
//     text: string;
//     type: string;
//     hasMarks: boolean;
//     marks: number;
//     isRequired: boolean;
//     choices: Choice[];
//     yesValue: boolean;
//     noValue: boolean;
// }
//
// interface Choice {
//     text: string;
//     isCorrect: boolean;
// }
//
// interface Target {
//     targetType: string;
//     roleName: string;
//     department: number | null;
//     user_id: number | null;
//     site_id: number | null;
// }
//
// @Component({
//     selector: 'app-survey',
//     templateUrl: './survey.component.html',
//     standalone: true,
//     imports: [CommonModule, ReactiveFormsModule, Card, DropdownModule, InputSwitchModule, ButtonModule, InputTextModule, InputTextarea, InputNumberModule, CheckboxModule, ProgressSpinnerModule, MultiSelect],
//     providers: [MessageService]
// })
// export class SurveyComponent implements OnInit {
//     surveyForm!: FormGroup;
//     isLoading = false;
//     isDataLoading = false;
//
//     departments: any[] = [];
//     surveyTypes: any[] = [];
//     sites: any[] = [];
//
//     questionTypes = [
//         { label: 'Text Answer', value: 'text' },
//         { label: 'Yes/No', value: 'yesno' },
//         { label: 'Multiple Choice', value: 'choice' },
//         { label: 'Image Upload', value: 'image' }
//     ];
//
//     targetTypes = [
//         { label: 'Role', value: 'role' },
//         { label: 'Department', value: 'department' },
//         { label: 'User', value: 'user' },
//         { label: 'Site', value: 'site' },
//         { label: 'All Users', value: 'all' }
//     ];
//
//     constructor(
//         private fb: FormBuilder,
//         private messageService: MessageService,
//         private surveyService: SurveyService,
//         private departmentService: DepartmentService,
//         private router: Router
//     ) {
//         this.initForm();
//     }
//
//     ngOnInit(): void {
//         this.loadInitialData();
//         this.addQuestion();
//         this.addTarget();
//     }
//
//     private initForm(): void {
//         this.surveyForm = this.fb.group({
//             title: ['', Validators.required],
//             description: [''],
//             department: [null, Validators.required],
//             survey_type: [null, Validators.required],
//             site_id: [null, Validators.required],
//             is_location_based: [false],
//             is_image_required: [false],
//             is_active: [true],
//             questions: this.fb.array<FormGroup>([]),
//             targets: this.fb.array<FormGroup>([])
//         });
//     }
//
//     private loadInitialData(): void {
//         this.isDataLoading = true;
//
//         this.surveyService.getAllSurveyTypes().subscribe({
//             next: (response: any) => {
//                 this.surveyTypes = response.data || [];
//
//                 this.surveyService.getAllSites().subscribe({
//                     next: (siteRes: any) => {
//                         this.sites = siteRes.data || [];
//                         this.loadDepartments();
//                     },
//                     error: () => {
//                         this.isDataLoading = false;
//                         this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load sites' });
//                     }
//                 });
//             },
//             error: () => {
//                 this.isDataLoading = false;
//                 this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load survey types' });
//             }
//         });
//     }
//
//     private loadDepartments(): void {
//         this.departmentService.getAllDepartments().subscribe({
//             next: (response: any) => {
//                 this.departments = response.data || [];
//                 this.isDataLoading = false;
//             },
//             error: (error: any) => {
//                 this.isDataLoading = false;
//                 this.messageService.add({
//                     severity: 'error',
//                     summary: 'Error',
//                     detail: 'Failed to load departments'
//                 });
//             }
//         });
//     }
//
//     // Questions FormArray methods
//     get questions(): FormArray {
//         return this.surveyForm.get('questions') as FormArray;
//     }
//
//     addQuestion(): void {
//         const questionGroup = this.fb.group({
//             text: ['', Validators.required],
//             type: ['', Validators.required],
//             hasMarks: [false],
//             marks: [0],
//             isRequired: [true],
//             choices: this.fb.array<FormGroup>([]),
//             yesValue: [false],
//             noValue: [false]
//         });
//         this.questions.push(questionGroup);
//     }
//
//     removeQuestion(index: number): void {
//         this.questions.removeAt(index);
//     }
//
//     getQuestionChoices(questionIndex: number): FormArray {
//         return this.questions.at(questionIndex).get('choices') as FormArray;
//     }
//
//     addChoice(questionIndex: number): void {
//         const choiceGroup = this.fb.group({
//             text: ['', Validators.required],
//             isCorrect: [false]
//         });
//         this.getQuestionChoices(questionIndex).push(choiceGroup);
//     }
//
//     removeChoice(questionIndex: number, choiceIndex: number): void {
//         this.getQuestionChoices(questionIndex).removeAt(choiceIndex);
//     }
//
//     getYesNoControl(questionIndex: number, option: 'yes' | 'no'): FormControl {
//         return this.questions.at(questionIndex).get(`${option}Value`) as FormControl;
//     }
//
//     onQuestionTypeChange(questionIndex: number): void {
//         const question = this.questions.at(questionIndex);
//         const choices = question.get('choices') as FormArray;
//
//         while (choices.length !== 0) {
//             choices.removeAt(0);
//         }
//
//         if (question.get('type')?.value === 'yesno') {
//             question.patchValue({
//                 yesValue: false,
//                 noValue: false
//             });
//         }
//
//         if (question.get('type')?.value === 'image') {
//             question.patchValue({
//                 hasMarks: false,
//                 marks: 0
//             });
//         }
//     }
//
//     // Targets FormArray methods
//     get targets(): FormArray {
//         return this.surveyForm.get('targets') as FormArray;
//     }
//
//     addTarget(): void {
//         const targetGroup = this.fb.group({
//             targetType: ['', Validators.required],
//             roleName: [''],
//             department: [null],
//             user_id: [null],
//             site_id: [null]
//         });
//         this.targets.push(targetGroup);
//     }
//
//     removeTarget(index: number): void {
//         this.targets.removeAt(index);
//     }
//
//     onTargetTypeChange(targetIndex: number): void {
//         const target = this.targets.at(targetIndex);
//         target.patchValue({
//             roleName: '',
//             department: null,
//             user_id: null,
//             site_id: null
//         });
//     }
//
//     // Form submission
//     onSubmit(): void {
//         if (this.surveyForm.invalid) {
//             this.markAllAsTouched();
//             this.messageService.add({
//                 severity: 'warn',
//                 summary: 'Validation Error',
//                 detail: 'Please fill all required fields correctly'
//             });
//             return;
//         }
//
//         this.isLoading = true;
//         const formData = this.prepareFormData();
//
//         this.surveyService.createSurvey(formData).subscribe({
//             next: (response: any) => {
//                 this.messageService.add({
//                     severity: 'success',
//                     summary: 'Success',
//                     detail: 'Survey created successfully!'
//                 });
//                 this.router.navigate(['/survey']);
//             },
//             error: (error: any) => {
//                 console.error('Error creating survey:', error);
//                 this.messageService.add({
//                     severity: 'error',
//                     summary: 'Error',
//                     detail: 'Failed to create survey: ' + (error.error?.message || 'Unknown error')
//                 });
//                 this.isLoading = false;
//             }
//         });
//     }
//
//     private prepareFormData(): any {
//         const formValue = this.surveyForm.value;
//
//         const questions = formValue.questions.map((question: Question) => {
//             const q: any = {
//                 text: question.text,
//                 type: question.type,
//                 has_marks: question.hasMarks,
//                 marks: question.marks,
//                 is_required: question.isRequired,
//                 choices: []
//             };
//
//             if (question.type === 'choice' && question.choices) {
//                 q.choices = question.choices.map((choice: Choice) => ({
//                     text: choice.text,
//                     is_correct: choice.isCorrect
//                 }));
//             }
//
//             if (question.type === 'yesno') {
//                 q.choices = [
//                     { text: 'Yes', is_correct: question.yesValue },
//                     { text: 'No', is_correct: question.noValue }
//                 ];
//             }
//
//             return q;
//         });
//
//         const targets = formValue.targets.map((target: Target) => ({
//             target_type: target.targetType,
//             role_name: target.roleName || null,
//             department: target.department || null,
//             user_id: target.user_id || null,
//             site_id: target.site_id || null
//         }));
//
//         return {
//             title: formValue.title,
//             description: formValue.description,
//             department: formValue.department,
//             survey_type: formValue.survey_type,
//             site_id: formValue.site_id,
//             is_location_based: formValue.is_location_based,
//             is_image_required: formValue.is_image_required,
//             is_active: formValue.is_active,
//             questions: questions,
//             targets: targets
//         };
//     }
//
//     private markAllAsTouched(): void {
//         Object.values(this.surveyForm.controls).forEach((control) => {
//             if (control instanceof FormControl) {
//                 control.markAsTouched();
//             } else if (control instanceof FormArray) {
//                 control.controls.forEach((group) => {
//                     if (group instanceof FormGroup) {
//                         Object.values(group.controls).forEach((c) => c.markAsTouched());
//                     }
//                 });
//             }
//         });
//     }
//
//     onCancel(): void {
//         this.messageService.add({
//             severity: 'info',
//             summary: 'Cancelled',
//             detail: 'Survey creation was cancelled'
//         });
//         this.router.navigate(['/surveys']);
//     }
// }




import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { SurveyService } from '../../../services/survey/survey.service';
import { DepartmentService } from '../../../services/department/department.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// PrimeNG Components
import { Card } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MultiSelectModule } from 'primeng/multiselect';

interface Question {
    text: string;
    type: string;
    hasMarks: boolean;
    marks: number;
    isRequired: boolean;
    choices: Choice[];
    yesValue: boolean;
    noValue: boolean;
}

interface Choice {
    text: string;
    isCorrect: boolean;
}

interface Target {
    targetType: string;
    roleName: string;
    department: number | null;
    user_id: number | null;
    site_id: number | null;
}

@Component({
    selector: 'app-survey',
    templateUrl: './survey.component.html',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        Card,
        DropdownModule,
        InputSwitchModule,
        ButtonModule,
        InputTextModule,
        InputTextarea,
        InputNumberModule,
        CheckboxModule,
        ProgressSpinnerModule,
        MultiSelectModule
    ],
    providers: [MessageService]
})
export class SurveyComponent implements OnInit {
    surveyForm!: FormGroup;
    isLoading = false;
    isDataLoading = false;

    departments: any[] = [];
    surveyTypes: any[] = [];
    sites: any[] = [];

    questionTypes = [
        { label: 'Text Answer', value: 'text' },
        { label: 'Yes/No', value: 'yesno' },
        { label: 'Multiple Choice', value: 'choice' },
        { label: 'Image Upload', value: 'image' }
    ];

    targetTypes = [
        { label: 'Role', value: 'role' },
        { label: 'Department', value: 'department' },
        { label: 'User', value: 'user' },
        { label: 'Site', value: 'site' },
        { label: 'All Users', value: 'all' }
    ];

    constructor(
        private fb: FormBuilder,
        private messageService: MessageService,
        private surveyService: SurveyService,
        private departmentService: DepartmentService,
        private router: Router
    ) {
        this.initForm();
    }

    ngOnInit(): void {
        this.loadInitialData();
        this.addQuestion();
        this.addTarget();
    }

    private initForm(): void {
        this.surveyForm = this.fb.group({
            title: ['', Validators.required],
            description: [''],
            department: [null, Validators.required],
            survey_type: [null, Validators.required],
            site_ids: [[], Validators.required],
            is_location_based: [false],
            is_image_required: [false],
            is_active: [true],
            questions: this.fb.array<FormGroup>([]),
            targets: this.fb.array<FormGroup>([])
        });
    }

    private loadInitialData(): void {
        this.isDataLoading = true;

        this.surveyService.getAllSurveyTypes().subscribe({
            next: (response: any) => {
                this.surveyTypes = response.data || [];

                this.surveyService.getAllSites().subscribe({
                    next: (siteRes: any) => {
                        this.sites = siteRes.data || [];
                        this.loadDepartments();
                    },
                    error: () => {
                        this.isDataLoading = false;
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load sites' });
                    }
                });
            },
            error: () => {
                this.isDataLoading = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load survey types' });
            }
        });
    }

    private loadDepartments(): void {
        this.departmentService.getAllDepartments().subscribe({
            next: (response: any) => {
                this.departments = response.data || [];
                this.isDataLoading = false;
            },
            error: (error: any) => {
                this.isDataLoading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load departments'
                });
            }
        });
    }

    // Questions FormArray methods
    get questions(): FormArray {
        return this.surveyForm.get('questions') as FormArray;
    }

    addQuestion(): void {
        const questionGroup = this.fb.group({
            text: ['', Validators.required],
            type: ['', Validators.required],
            hasMarks: [false],
            marks: [0],
            isRequired: [true],
            choices: this.fb.array<FormGroup>([]),
            yesValue: [false],
            noValue: [false]
        });
        this.questions.push(questionGroup);
    }

    removeQuestion(index: number): void {
        this.questions.removeAt(index);
    }

    getQuestionChoices(questionIndex: number): FormArray {
        return this.questions.at(questionIndex).get('choices') as FormArray;
    }

    addChoice(questionIndex: number): void {
        const choiceGroup = this.fb.group({
            text: ['', Validators.required],
            isCorrect: [false]
        });
        this.getQuestionChoices(questionIndex).push(choiceGroup);
    }

    removeChoice(questionIndex: number, choiceIndex: number): void {
        this.getQuestionChoices(questionIndex).removeAt(choiceIndex);
    }

    getYesNoControl(questionIndex: number, option: 'yes' | 'no'): FormControl {
        return this.questions.at(questionIndex).get(`${option}Value`) as FormControl;
    }

    onQuestionTypeChange(questionIndex: number): void {
        const question = this.questions.at(questionIndex);
        const choices = question.get('choices') as FormArray;

        while (choices.length !== 0) {
            choices.removeAt(0);
        }

        if (question.get('type')?.value === 'yesno') {
            question.patchValue({
                yesValue: false,
                noValue: false
            });
        }

        if (question.get('type')?.value === 'image') {
            question.patchValue({
                hasMarks: false,
                marks: 0
            });
        }
    }

    // Targets FormArray methods
    get targets(): FormArray {
        return this.surveyForm.get('targets') as FormArray;
    }

    addTarget(): void {
        const targetGroup = this.fb.group({
            targetType: ['', Validators.required],
            roleName: [''],
            department: [null],
            user_id: [null],
            site_id: [null]
        });
        this.targets.push(targetGroup);
    }

    removeTarget(index: number): void {
        this.targets.removeAt(index);
    }

    onTargetTypeChange(targetIndex: number): void {
        const target = this.targets.at(targetIndex);
        target.patchValue({
            roleName: '',
            department: null,
            user_id: null,
            site_id: null
        });
    }

    // Form submission
    onSubmit(): void {
        if (this.surveyForm.invalid) {
            this.markAllAsTouched();
            this.messageService.add({
                severity: 'warn',
                summary: 'Validation Error',
                detail: 'Please fill all required fields correctly'
            });
            return;
        }

        this.isLoading = true;
        const formData = this.prepareFormData();

        this.surveyService.createSurvey(formData).subscribe({
            next: (response: any) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Survey created successfully!'
                });
                this.router.navigate(['/survey']);
            },
            error: (error: any) => {
                console.error('Error creating survey:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to create survey: ' + (error.error?.message || 'Unknown error')
                });
                this.isLoading = false;
            }
        });
    }

    private prepareFormData(): any {
        const formValue = this.surveyForm.value;

        const questions = formValue.questions.map((question: Question) => {
            const q: any = {
                text: question.text,
                type: question.type,
                has_marks: question.hasMarks,
                marks: question.marks,
                is_required: question.isRequired,
                choices: []
            };

            if (question.type === 'choice' && question.choices) {
                q.choices = question.choices.map((choice: Choice) => ({
                    text: choice.text,
                    is_correct: choice.isCorrect
                }));
            }

            if (question.type === 'yesno') {
                q.choices = [
                    { text: 'Yes', is_correct: question.yesValue },
                    { text: 'No', is_correct: question.noValue }
                ];
            }

            return q;
        });

        const targets = formValue.targets.map((target: Target) => ({
            target_type: target.targetType,
            role_name: target.roleName || null,
            department: target.department || null,
            user_id: target.user_id || null,
            site_id: target.site_id || null
        }));

        return {
            title: formValue.title,
            description: formValue.description,
            department: formValue.department,
            survey_type: formValue.survey_type,
            site_ids: formValue.site_ids,
            is_location_based: formValue.is_location_based,
            is_image_required: formValue.is_image_required,
            is_active: formValue.is_active,
            questions: questions,
            targets: targets
        };
    }

    private markAllAsTouched(): void {
        Object.values(this.surveyForm.controls).forEach(control => {
            if (control instanceof FormControl) {
                control.markAsTouched();
            } else if (control instanceof FormArray) {
                control.controls.forEach(group => {
                    if (group instanceof FormGroup) {
                        Object.values(group.controls).forEach(c => c.markAsTouched());
                    }
                });
            }
        });
    }

    onCancel(): void {
        this.messageService.add({
            severity: 'info',
            summary: 'Cancelled',
            detail: 'Survey creation was cancelled'
        });
        this.router.navigate(['/surveys']);
    }
}
