import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputTextModule } from 'primeng/inputtext';
import { InputSwitchModule } from 'primeng/inputswitch';
import { MultiSelectModule } from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { Textarea } from 'primeng/textarea';
import { SurveyService } from '../../../services/survey/survey.service';
import { DepartmentService } from '../../../services/department/department.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
    selector: 'app-survey',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, DropdownModule, CardModule, ProgressSpinnerModule, InputTextModule, InputSwitchModule, MultiSelectModule, ButtonModule, CheckboxModule, InputNumberModule, Textarea],
    templateUrl: './survey.component.html',
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
        { label: 'Location', value: 'location' },
        { label: 'Remarks (Text Only)', value: 'remarks' },
        { label: 'Linear Scale (Custom)', value: 'linear' }
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
            site_ids: [[], Validators.required],
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
            remarks: [''],
            choices: this.fb.array([]),
            multipleScore: [false],
            yesValue: [false],
            noValue: [false],
            min_value: [0],
            max_value: [10]
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
        const question = this.getQuestions(catIdx).at(qIdx);
        const choice = this.fb.group({
            text: ['', Validators.required],
            isCorrect: [false],
            marks: [0]
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

    onLinearMaxValueChange(catIdx: number, qIdx: number): void {
        const question = this.getQuestions(catIdx).at(qIdx);
        const maxValue = question.get('max_value')?.value;
        if (!isNaN(maxValue) && maxValue >= 0) {
            question.patchValue({ marks: maxValue });
        }
    }

    onCancel(): void {
        this.router.navigate(['/surveys']);
    }

    onSubmit(): void {
        if (this.surveyForm.invalid) return;
        this.isLoading = true;
        const payload = this.prepareFormData();
        this.surveyService.createSurvey(payload).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Survey created successfully!'
                });
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
        const questions: any[] = [];

        formValue.categories.forEach((cat: any) => {
            cat.questions.forEach((q: any) => {
                const question: any = {
                    text: q.text,
                    type: q.type,
                    has_marks: q.hasMarks,
                    marks: q.marks,
                    is_required: q.isRequired,
                    remarks: q.remarks || '',
                    category: cat.name,
                    choices: [],
                    multiple_score: q.multipleScore || false
                };

                if (q.type === 'choice') {
                    question.choices = q.choices.map((c: any) => ({
                        text: c.text,
                        is_correct: c.isCorrect,
                        marks: q.hasMarks ? c.marks : undefined
                    }));
                } else if (q.type === 'yesno') {
                    question.choices = [
                        { text: 'Yes', is_correct: q.yesValue === true, marks: q.hasMarks ? 0 : undefined },
                        { text: 'No', is_correct: q.noValue === true, marks: q.hasMarks ? 0 : undefined }
                    ];
                } else if (q.type === 'linear') {
                    question.min_value = q.min_value;
                    question.max_value = q.max_value;
                }

                questions.push(question);
            });
        });

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
            targets: formValue.targets
        };
    }
}
