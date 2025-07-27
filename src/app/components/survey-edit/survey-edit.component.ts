import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SurveyService } from '../../../services/survey/survey.service';
import { DepartmentService } from '../../../services/department/department.service';
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
import { Toast } from 'primeng/toast';

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
    imports: [ReactiveFormsModule, DropdownModule, Card, InputText, Textarea, MultiSelect, InputSwitch, Button, NgForOf, Checkbox, InputNumber, NgIf, ProgressSpinner, Toast],
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
        private departmentService: DepartmentService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.initForm();
    }

    ngOnInit(): void {
        this.surveyId = +this.route.snapshot.paramMap.get('id')!;
        this.loadInitialData();
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

        // Load departments first
        this.departmentService.getAllDepartments().subscribe({
            next: (deptRes) => {
                this.departments = deptRes.data || [];

                // Then load survey types
                this.surveyService.getAllSurveyTypes().subscribe({
                    next: (surveyTypeRes) => {
                        this.surveyTypes = surveyTypeRes.data || [];

                        // Then load sites
                        this.surveyService.getAllSites().subscribe({
                            next: (siteRes) => {
                                this.sites = siteRes.data || [];

                                // Finally load the survey data
                                this.loadSurvey();
                            },
                            error: (siteErr) => {
                                console.error('Failed to load sites:', siteErr);
                                this.isDataLoading = false;
                            }
                        });
                    },
                    error: (surveyTypeErr) => {
                        console.error('Failed to load survey types:', surveyTypeErr);
                        this.isDataLoading = false;
                    }
                });
            },
            error: (deptErr) => {
                console.error('Failed to load departments:', deptErr);
                this.isDataLoading = false;
            }
        });
    }

    private loadSurvey(): void {
        this.surveyService.getSurveyById(this.surveyId).subscribe({
            next: (res) => {
                const survey = res.data;

                // Split the site_code (comma-separated string) into an array of site codes
                const selectedSiteCodes = survey.site_code ? survey.site_code.split(',') : [];

                // Now map site_codes into an array of objects for binding with multi-select
                const selectedSites = this.sites.filter((site) => selectedSiteCodes.includes(site.site_code));

                // Patch basic form values
                this.surveyForm.patchValue({
                    title: survey.title,
                    description: survey.description,
                    department: survey.department?.id || survey.department,
                    survey_type: survey.survey_type?.id || survey.survey_type,
                    site_ids: selectedSites.map((site) => site.id), // Use the 'id' for selected sites
                    is_location_based: survey.is_location_based,
                    is_image_required: survey.is_image_required,
                    is_active: survey.is_active
                });

                // Load questions into a default category
                if (survey.questions && survey.questions.length > 0) {
                    const defaultCategory = this.fb.group({
                        name: ['General', Validators.required],
                        questions: this.fb.array([])
                    });
                    this.categories.push(defaultCategory);

                    survey.questions.forEach((q: any) => {
                        this.addQuestionToCategory(0, q);
                    });
                }

                // Load targets
                if (survey.targets) {
                    survey.targets.forEach((t: any) => {
                        const targetGroup = this.fb.group({
                            target_type: t.target_type,
                            role_name: t.role_name || '',
                            department: t.department?.id || t.department || null,
                            site_id: t.site_id?.id || t.site_id || null,
                            user_id: t.user_id?.id || t.user_id || null
                        });
                        this.targets.push(targetGroup);
                    });
                }

                this.isDataLoading = false;
            },
            error: (err) => {
                this.isDataLoading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load survey: ' + (err.error?.message || 'Unknown error')
                });
                this.router.navigate(['/survey']);
            }
        });
    }

    private addQuestionToCategory(catIdx: number, questionData: any): void {
        const questionGroup = this.fb.group({
            text: [questionData.text, Validators.required],
            type: [questionData.type, Validators.required],
            hasMarks: [questionData.has_marks || false],
            marks: [questionData.marks || 0],
            isRequired: [questionData.is_required !== false],
            choices: this.fb.array([]),
            yesValue: [false],
            noValue: [false]
        });

        // Add choices for multiple choice questions
        if (questionData.type === 'choice' && questionData.choices) {
            questionData.choices.forEach((choice: any) => {
                const choiceGroup = this.fb.group({
                    text: [choice.text, Validators.required],
                    isCorrect: [choice.is_correct || false]
                });
                (questionGroup.get('choices') as FormArray).push(choiceGroup);
            });
        }
        // Set values for yes/no questions
        else if (questionData.type === 'yesno' && questionData.choices) {
            const yesChoice = questionData.choices.find((c: any) => c.text.toLowerCase() === 'yes');
            const noChoice = questionData.choices.find((c: any) => c.text.toLowerCase() === 'no');
            questionGroup.patchValue({
                yesValue: yesChoice ? yesChoice.is_correct : false,
                noValue: noChoice ? noChoice.is_correct : false
            });
        }

        this.getQuestions(catIdx).push(questionGroup);
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
        if (this.surveyForm.invalid) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validation',
                detail: 'Please fill all required fields'
            });
            return;
        }

        this.isLoading = true;
        const payload = this.prepareFormData();

        this.surveyService.updateSurvey(this.surveyId, payload).subscribe({
            next: () => {
                this.isLoading = false;

                // Add success toast notification
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Survey updated successfully!',
                    life: 3000 // Auto-hide after 3 seconds
                });

                // Delay navigation to ensure the toast is shown before redirecting
                setTimeout(() => {
                    this.router.navigate(['/survey']);
                }, 3000); // Adjust time to match the toast display time
            },
            error: (err) => {
                this.isLoading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to update survey: ' + (err.error?.message || 'Unknown error')
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

        // Fix targets format to send only IDs
        const fixedTargets = formValue.targets.map((target: any) => {
            return {
                target_type: target.target_type,
                role_name: target.role_name,
                department: target.department?.id || target.department,
                site_id: target.site_id?.id || target.site_id,
                user_id: target.user_id?.id || target.user_id
            };
        });

        return {
            title: formValue.title,
            description: formValue.description,
            department: formValue.department?.id || formValue.department,
            survey_type: formValue.survey_type?.id || formValue.survey_type,
            site_ids: formValue.site_ids?.map((site: any) => site.id || site) || [],
            is_location_based: formValue.is_location_based,
            is_image_required: formValue.is_image_required,
            is_active: formValue.is_active,
            questions: questions,
            targets: fixedTargets
        };
    }

    onCancel(): void {
        this.router.navigate(['/survey']);
    }
}
