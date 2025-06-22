import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Card } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitch } from 'primeng/inputswitch';
import { NgForOf, NgIf } from '@angular/common';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Checkbox } from 'primeng/checkbox';

@Component({
    selector: 'app-survey',
    templateUrl: './survey.component.html',
    imports: [ReactiveFormsModule, Card, DropdownModule, InputSwitch, NgForOf, Button, InputText, NgIf, InputNumber, Checkbox],
    providers: [MessageService]
})
export class SurveyComponent {
    surveyForm: FormGroup;

    // Mock data
    departments = [
        { id: 1, name: 'Software' },
        { id: 2, name: 'Marketing' },
        { id: 3, name: 'Operations' }
    ];

    surveyTypes = [
        { id: 1, name: 'Inspection' },
        { id: 2, name: 'Audit' },
        { id: 3, name: 'Feedback' }
    ];

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
        private messageService: MessageService
    ) {
        this.surveyForm = this.fb.group({
            title: ['', Validators.required],
            description: [''],
            department: ['', Validators.required],
            surveyType: ['', Validators.required],
            isLocationBased: [false],
            isImageRequired: [false],
            isActive: [true],
            questions: this.fb.array([]),
            targets: this.fb.array([])
        });
    }

    ngOnInit(): void {
        this.addQuestion();
        this.addTarget();
    }

    get questions(): FormArray {
        return this.surveyForm.get('questions') as FormArray;
    }

    get targets(): FormArray {
        return this.surveyForm.get('targets') as FormArray;
    }

    addQuestion(): void {
        const questionGroup = this.fb.group({
            text: ['', Validators.required],
            type: ['', Validators.required],
            hasMarks: [false],
            marks: [0],
            isRequired: [true],
            choices: this.fb.array([]),
            yesValue: [false], // For yes/no questions
            noValue: [false] // For yes/no questions
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

        // Reset choices array
        while (choices.length !== 0) {
            choices.removeAt(0);
        }

        // For yes/no questions, add default options
        if (question.get('type')?.value === 'yesno') {
            question.patchValue({
                yesValue: false,
                noValue: false
            });
        }

        // For image questions, disable marks
        if (question.get('type')?.value === 'image') {
            question.patchValue({
                hasMarks: false,
                marks: 0
            });
        }
    }

    addTarget(): void {
        const targetGroup = this.fb.group({
            targetType: ['', Validators.required],
            roleName: [''],
            department: [''],
            user_id: [''],
            site_id: ['']
        });
        this.targets.push(targetGroup);
    }

    removeTarget(index: number): void {
        this.targets.removeAt(index);
    }

    onTargetTypeChange(targetIndex: number): void {
        const target = this.targets.at(targetIndex);
        // Reset all fields when target type changes
        target.patchValue({
            roleName: '',
            department: '',
            user_id: '',
            site_id: ''
        });
    }

    onSubmit(): void {
        if (this.surveyForm.invalid) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validation Error',
                detail: 'Please fill all required fields correctly'
            });
            return;
        }

        // Prepare the data for submission
        const formValue = {
            ...this.surveyForm.value,
            questions: this.surveyForm.value.questions.map((question: any) => {
                if (question.type === 'yesno') {
                    return {
                        ...question,
                        choices: [
                            { text: 'Yes', isCorrect: question.yesValue },
                            { text: 'No', isCorrect: question.noValue }
                        ]
                    };
                }
                return question;
            })
        };

        console.log('Survey Data:', formValue);
        this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Survey created successfully!'
        });

        // In a real app, you would call your API service here
        // this.surveyService.createSurvey(formValue).subscribe(...)
    }

    onCancel(): void {
        this.messageService.add({
            severity: 'info',
            summary: 'Cancelled',
            detail: 'Survey creation was cancelled'
        });
        // In a real app, you might navigate away
        // this.router.navigate(['/surveys']);
    }
}
