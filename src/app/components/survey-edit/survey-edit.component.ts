import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SurveyService } from '../../../services/survey/survey.service';
import { MessageService } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { Card } from 'primeng/card';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { MultiSelect } from 'primeng/multiselect';
import { InputSwitch } from 'primeng/inputswitch';
import { Button } from 'primeng/button';
import { NgForOf, NgIf } from '@angular/common';
import { Checkbox } from 'primeng/checkbox';
import { InputNumber } from 'primeng/inputnumber';
import { ProgressSpinner } from 'primeng/progressspinner';

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
    selector: 'app-survey-edit',
    templateUrl: './survey-edit.component.html',
    imports: [
        ReactiveFormsModule,
        DropdownModule,
        Card,
        InputText,
        Textarea,
        MultiSelect,
        InputSwitch,
        Button,
        NgForOf,
        Checkbox,
        InputNumber,
        NgIf,
        ProgressSpinner
    ],
    providers: [MessageService]
})
export class SurveyEditComponent implements OnInit {
    surveyForm!: FormGroup;
    isLoading = false;
    isDataLoading = false;
    surveyId!: number;

    departments: any[] = [];
    surveyTypes: any[] = [];
    sites: any[] = [];
    users: any[] = [];

    questionTypes = [
        { label: 'Text Answer', value: 'text' },
        { label: 'Yes/No', value: 'yesno' },
        { label: 'Multiple Choice', value: 'choice' },
        { label: 'Image Upload', value: 'image' },
        { label: 'Location', value: 'location' }
    ];

    targetTypes = [
        { label: 'Role', value: 'role' },
        { label: 'Department', value: 'department' },
        { label: 'Site', value: 'site' },
        { label: 'User', value: 'user' }
    ];

    constructor(
        private fb: FormBuilder,
        private messageService: MessageService,
        private surveyService: SurveyService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.initForm();
    }

    ngOnInit(): void {
        this.surveyId = +this.route.snapshot.paramMap.get('id')!;
        this.loadInitialData();
        this.loadSurvey();
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
                        this.isDataLoading = false;
                    },
                    error: () => (this.isDataLoading = false)
                });
            },
            error: () => (this.isDataLoading = false)
        });
    }

    private loadSurvey(): void {
        this.isDataLoading = true;
        this.surveyService.getSurveyById(this.surveyId).subscribe({
            next: (res) => {
                const survey = res.data;
                this.surveyForm.patchValue({
                    title: survey.title,
                    description: survey.description,
                    department: survey.department,
                    survey_type: survey.survey_type,
                    site_ids: survey.site_ids,
                    is_location_based: survey.is_location_based,
                    is_image_required: survey.is_image_required,
                    is_active: survey.is_active
                });

                // Clear existing arrays
                while (this.categories.length) this.categories.removeAt(0);
                while (this.targets.length) this.targets.removeAt(0);

                // Load categories and questions
                if (survey.categories) {
                    survey.categories.forEach((cat: any) => {
                        const categoryGroup = this.fb.group({
                            name: [cat.name, Validators.required],
                            questions: this.fb.array([])
                        });
                        this.categories.push(categoryGroup);

                        if (cat.questions) {
                            cat.questions.forEach((q: any) => {
                                const questionGroup = this.fb.group({
                                    text: [q.text, Validators.required],
                                    type: [q.type, Validators.required],
                                    hasMarks: [q.has_marks || false],
                                    marks: [q.marks || 0],
                                    isRequired: [q.is_required || true],
                                    choices: this.fb.array([]),
                                    yesValue: [false],
                                    noValue: [false]
                                });

                                if (q.type === 'choice' && q.choices) {
                                    q.choices.forEach((c: any) => {
                                        const choiceGroup = this.fb.group({
                                            text: [c.text, Validators.required],
                                            isCorrect: [c.is_correct || false]
                                        });
                                        this.getQuestionChoices(this.categories.length - 1, this.getQuestions(this.categories.length - 1).length).push(choiceGroup);
                                    });
                                } else if (q.type === 'yesno' && q.choices) {
                                    const yesChoice = q.choices.find((c: any) => c.text.toLowerCase() === 'yes');
                                    const noChoice = q.choices.find((c: any) => c.text.toLowerCase() === 'no');
                                    questionGroup.patchValue({
                                        yesValue: yesChoice ? yesChoice.is_correct : false,
                                        noValue: noChoice ? noChoice.is_correct : false
                                    });
                                }

                                this.getQuestions(this.categories.length - 1).push(questionGroup);
                            });
                        }
                    });
                }

                // Load targets
                if (survey.targets) {
                    survey.targets.forEach((t: any) => {
                        const targetGroup = this.fb.group({
                            target_type: [t.target_type],
                            role_name: [t.role_name || ''],
                            department: [t.department || null],
                            site_id: [t.site_id || null],
                            user_id: [t.user_id || null]
                        });
                        this.targets.push(targetGroup);
                    });
                }

                this.isDataLoading = false;
            },
            error: () => {
                this.isDataLoading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load survey'
                });
                this.router.navigate(['/survey']);
            }
        });
    }

    // Form array getters
    get categories(): FormArray {
        return this.surveyForm.get('categories') as FormArray;
    }

    get targets(): FormArray {
        return this.surveyForm.get('targets') as FormArray;
    }

    getQuestions(catIdx: number): FormArray {
        return this.categories.at(catIdx).get('questions') as FormArray;
    }

    getQuestionChoices(catIdx: number, qIdx: number): FormArray {
        return this.getQuestions(catIdx).at(qIdx).get('choices') as FormArray;
    }

    getYesNoControl(catIdx: number, qIdx: number, type: 'yes' | 'no'): FormControl {
        return this.getQuestions(catIdx).at(qIdx).get(`${type}Value`) as FormControl;
    }

    // Category methods
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

    // Question methods
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

    onQuestionTypeChange(catIdx: number, qIdx: number): void {
        const question = this.getQuestions(catIdx).at(qIdx);
        const choices = question.get('choices') as FormArray;
        while (choices.length !== 0) choices.removeAt(0);
        if (question.get('type')?.value === 'yesno') {
            question.patchValue({ yesValue: false, noValue: false });
        }
    }

    // Choice methods
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

    // Target methods
    addTarget(): void {
        const target = this.fb.group({
            target_type: [''],
            role_name: [''],
            department: [null],
            site_id: [null],
            user_id: [null]
        });
        this.targets.push(target);
    }

    removeTarget(index: number): void {
        this.targets.removeAt(index);
    }

    // Form submission
    onSubmit(): void {
        if (this.surveyForm.invalid) return;
        this.isLoading = true;
        const payload = this.prepareFormData();

        this.surveyService.updateSurvey(this.surveyId, payload).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Survey updated successfully!'
                });
                this.router.navigate(['/survey']);
            },
            error: (err) => {
                this.isLoading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to update survey: ' + (err.error?.message || 'Unknown')
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
            site_ids: formValue.site_ids,
            is_location_based: formValue.is_location_based,
            is_image_required: formValue.is_image_required,
            is_active: formValue.is_active,
            questions: questions,
            targets: formValue.targets
        };
    }

    onCancel(): void {
        this.router.navigate(['/survey']);
    }
}
