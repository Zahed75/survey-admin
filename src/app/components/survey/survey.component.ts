


import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { SurveyService } from '../../../services/survey/survey.service';
import { DepartmentService } from '../../../services/department/department.service';
import { Router } from '@angular/router';
import { Card } from 'primeng/card';
import { ProgressSpinner } from 'primeng/progressspinner';
import { DropdownModule } from 'primeng/dropdown';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { MultiSelect } from 'primeng/multiselect';
import { InputSwitch } from 'primeng/inputswitch';
import { Button } from 'primeng/button';
import { NgForOf, NgIf } from '@angular/common';
import { Checkbox } from 'primeng/checkbox';
import { InputNumber } from 'primeng/inputnumber';

interface QuestionPayload {
    text: string;
    type: string;
    has_marks: boolean;
    marks: number;
    is_required: boolean;
    category: string;
    choices: { text: string; is_correct: boolean }[];
}

@Component({
    selector: 'app-survey',
    templateUrl: './survey.component.html',
    imports: [Card, ProgressSpinner, DropdownModule, InputText, Textarea, MultiSelect, InputSwitch, Button, NgForOf, Checkbox, InputNumber, NgIf, ReactiveFormsModule],
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
        { label: 'Image Upload', value: 'image' },
        { label: 'Location', value: 'location' }
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
        this.addCategory();
    }

    private initForm(): void {
        this.surveyForm = this.fb.group({
            title: ['', Validators.required],
            description: [''],
            department: [null, Validators.required],
            survey_type: [null, Validators.required],
            site_ids: [[], Validators.required], // will be converted to site_codes in payload
            is_location_based: [false],
            is_image_required: [false],
            is_active: [true],
            categories: this.fb.array([]),
            targets: this.fb.array([])
        });
    }

    private loadInitialData(): void {
        this.isDataLoading = true;
        this.surveyService.getAllSurveyTypes().subscribe({
            next: (res) => {
                this.surveyTypes = res.data || [];
                this.surveyService.getAllSites().subscribe({
                    next: (siteRes) => {
                        this.sites = siteRes.data || [];
                        this.departmentService.getAllDepartments().subscribe({
                            next: (deptRes) => {
                                this.departments = deptRes.data || [];
                                this.isDataLoading = false;
                            },
                            error: () => (this.isDataLoading = false)
                        });
                    },
                    error: () => (this.isDataLoading = false)
                });
            },
            error: () => (this.isDataLoading = false)
        });
    }

    get categories(): FormArray {
        return this.surveyForm.get('categories') as FormArray;
    }

    addCategory(): void {
        const cat = this.fb.group({
            name: ['', Validators.required],
            questions: this.fb.array([])
        });
        this.categories.push(cat);
    }

    removeCategory(index: number): void {
        this.categories.removeAt(index);
    }

    getQuestions(catIdx: number): FormArray {
        return this.categories.at(catIdx).get('questions') as FormArray;
    }

    addQuestion(catIdx: number): void {
        const question = this.fb.group({
            text: ['', Validators.required],
            type: ['', Validators.required],
            hasMarks: [false],
            marks: [0],
            isRequired: [true],
            choices: this.fb.array([]),
            yesValue: [false],
            noValue: [false]
        });
        this.getQuestions(catIdx).push(question);
    }

    removeQuestion(catIdx: number, qIdx: number): void {
        this.getQuestions(catIdx).removeAt(qIdx);
    }

    getQuestionChoices(catIdx: number, qIdx: number): FormArray {
        return this.getQuestions(catIdx).at(qIdx).get('choices') as FormArray;
    }

    addChoice(catIdx: number, qIdx: number): void {
        const choice = this.fb.group({
            text: ['', Validators.required],
            isCorrect: [false]
        });
        this.getQuestionChoices(catIdx, qIdx).push(choice);
    }

    removeChoice(catIdx: number, qIdx: number, cIdx: number): void {
        this.getQuestionChoices(catIdx, qIdx).removeAt(cIdx);
    }

    getYesNoControl(catIdx: number, qIdx: number, type: 'yes' | 'no'): FormControl {
        return this.getQuestions(catIdx).at(qIdx).get(`${type}Value`) as FormControl;
    }

    onQuestionTypeChange(catIdx: number, qIdx: number): void {
        const question = this.getQuestions(catIdx).at(qIdx);
        const choices = question.get('choices') as FormArray;
        while (choices.length !== 0) choices.removeAt(0);
        if (question.get('type')?.value === 'yesno') {
            question.patchValue({ yesValue: false, noValue: false });
        }
    }

    onCancel(): void {
        this.router.navigate(['/surveys']);
    }

    onSubmit(): void {
        if (this.surveyForm.invalid) return;
        this.isLoading = true;

        const payload = this.prepareFormData();
        console.log('🚀 Submitting Survey Payload:', payload); // Debug log

        this.surveyService.createSurvey(payload).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Survey created successfully!' });
                this.router.navigate(['/survey-list']);
            },
            error: (err) => {
                this.isLoading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to create survey: ' + (err.error?.message || JSON.stringify(err.error) || 'Unknown')
                });
            }
        });
    }

    private prepareFormData(): any {
        const formValue = this.surveyForm.value;
        const questions: QuestionPayload[] = [];

        formValue.categories.forEach((cat: any) => {
            cat.questions.forEach((q: any) => {
                const question: QuestionPayload = {
                    text: q.text,
                    type: q.type,
                    has_marks: q.hasMarks,
                    marks: q.marks,
                    is_required: q.isRequired,
                    category: cat.name,
                    choices: []
                };

                if (q.type === 'choice') {
                    question.choices = q.choices.map((c: any) => ({
                        text: c.text,
                        is_correct: c.isCorrect
                    }));
                } else if (q.type === 'yesno') {
                    question.choices = [
                        { text: 'Yes', is_correct: q.yesValue },
                        { text: 'No', is_correct: q.noValue }
                    ];
                }

                questions.push(question);
            });
        });

        return {
            title: formValue.title,
            description: formValue.description,
            department: formValue.department,
            survey_type: formValue.survey_type,
            site_ids: formValue.site_ids, // ✅ fixed
            is_location_based: formValue.is_location_based,
            is_image_required: formValue.is_image_required,
            is_active: formValue.is_active,
            questions: questions,
            targets: formValue.targets
        };
    }

}
