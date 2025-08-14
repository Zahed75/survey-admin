import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SurveyService } from '../../../services/survey/survey.service';
import { DepartmentService } from '../../../services/department/department.service';
import { AuthService } from '../../../services/auth/auth.service';
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

import { survey_app } from '../../../enviornments/enviornment';

interface SiteOption {
    id: number;
    site_code: string;
    name?: string;
}

interface QuestionPayload {
    text: string;
    type: string;
    has_marks: boolean;
    marks: number;
    is_required: boolean;
    remarks?: string;
    category: string;
    choices: { text: string; is_correct?: boolean; marks?: number }[];
    multiple_score?: boolean;
    min_value?: number;
    max_value?: number;
}

@Component({
    selector: 'app-survey-edit',
    templateUrl: './survey-edit.component.html',
    standalone: true,
    imports: [
        ReactiveFormsModule, DropdownModule, Card, InputText, Textarea, MultiSelect,
        InputSwitch, Button, NgForOf, Checkbox, InputNumber, NgIf, ProgressSpinner, Toast
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
    sites: SiteOption[] = []; // options shown in MultiSelect (by codes)

    questionTypes = [
        { label: 'Text Answer', value: 'text' },
        { label: 'Yes/No', value: 'yesno' },
        { label: 'Multiple Choice', value: 'choice' },
        { label: 'Image Upload', value: 'image' },
        { label: 'Location', value: 'location' },
        { label: 'Remarks (Text Only)', value: 'remarks' },
        { label: 'Linear Scale (Custom)', value: 'linear' },
        { label: 'Multiple Scoring', value: 'multiple_scoring' }
    ];

    constructor(
        private fb: FormBuilder,
        private messageService: MessageService,
        private surveyService: SurveyService,
        private departmentService: DepartmentService,
        private auth: AuthService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.initForm();
    }

    ngOnInit(): void {
        this.surveyId = +(this.route.snapshot.paramMap.get('id') || 0);
        this.loadInitialData();
    }

    private initForm(): void {
        this.surveyForm = this.fb.group({
            title: ['', Validators.required],
            description: [''],
            department: [null, Validators.required],
            survey_type: [null, Validators.required],
            // Bind by codes (string[])
            site_codes: [[], Validators.required],
            is_location_based: [false],
            is_image_required: [false],
            is_active: [true],
            categories: this.fb.array([]),
            targets: this.fb.array([])
        });
    }

    // Helpers
    private cleanCode(v: string): string {
        return String(v || '').trim().toUpperCase();
    }

    private async fetchSitesDirect(): Promise<any[]> {
        const res = await fetch('https://api.shwapno.app/api/sites');
        if (!res.ok) throw new Error(`Sites HTTP ${res.status}`);
        const data = await res.json();
        return data?.data || data || [];
    }

    private loadInitialData(): void {
        this.isDataLoading = true;

        this.departmentService.getAllDepartments().subscribe({
            next: (deptRes) => {
                this.departments = deptRes?.data || [];

                this.surveyService.getAllSurveyTypes().subscribe({
                    next: (stypeRes) => {
                        this.surveyTypes = stypeRes?.data || [];

                        this.fetchSitesDirect()
                            .then((sites) => {
                                // normalize: id = number, site_code = UPPER CASE + TRIM
                                this.sites = (sites || []).map((s: any) => ({
                                    id: Number(s.id),
                                    site_code: this.cleanCode(s.site_code),
                                    name: s.name
                                }));
                                this.loadSurvey();
                            })
                            .catch((err: any) => {
                                this.isDataLoading = false;
                                this.messageService.add({
                                    severity: 'error',
                                    summary: 'Error',
                                    detail: 'Failed to load sites: ' + (err?.message || 'Unknown')
                                });
                            });
                    },
                    error: () => {
                        this.isDataLoading = false;
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load survey types' });
                    }
                });
            },
            error: () => {
                this.isDataLoading = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load departments' });
            }
        });
    }

    /** Return an array of normalized site CODES for the form control. */
    /** Return an array of normalized site CODES for the form control. */
    private normalizeSurveySiteCodes(survey: any): string[] {
        const idToCode = new Map<number, string>(this.sites.map(s => [s.id, s.site_code]));

        // Prefer the site_code field (might be codes OR mistakenly numeric ids)
        if (survey.site_code) {
            const rawTokens: string[] = String(survey.site_code)
                .split(',')
                .map((t: string) => t.trim())
                .filter((t: string) => t.length > 0);

            const allNumeric: boolean = rawTokens.every((t: string) => /^\d+$/.test(t));
            if (allNumeric) {
                // DB stored IDs in site_code; map id -> code
                const mapped: string[] = rawTokens
                    .map((t: string) => idToCode.get(Number(t)))
                    .filter((c: string | undefined): c is string => typeof c === 'string' && c.length > 0)
                    .map((c: string) => this.cleanCode(c));
                return Array.from(new Set(mapped));
            }

            // Treat as codes
            const cleaned: string[] = rawTokens.map((t: string) => this.cleanCode(t));
            return Array.from(new Set(cleaned));
        }

        // Legacy fallbacks
        if (Array.isArray(survey.site_ids) && survey.site_ids.length) {
            const codes: string[] = survey.site_ids
                .map((x: any) => idToCode.get(Number(x?.id ?? x)))
                .filter((c: string | undefined): c is string => typeof c === 'string' && c.length > 0)
                .map((c: string) => this.cleanCode(c));
            return Array.from(new Set(codes));
        }

        if (Array.isArray(survey.sites) && survey.sites.length) {
            const codes: string[] = survey.sites
                .map((s: any) => idToCode.get(Number(s?.id ?? s?.site_id)))
                .filter((c: string | undefined): c is string => typeof c === 'string' && c.length > 0)
                .map((c: string) => this.cleanCode(c));
            return Array.from(new Set(codes));
        }

        if (survey.site_id) {
            const c = idToCode.get(Number(survey.site_id));
            return c ? [this.cleanCode(c)] : [];
        }

        return [];
    }

    /** Make sure every preselected code exists as an option, even if missing from sites API. */
    private ensureOptionsContain(codes: string[]): void {
        const existing = new Set(this.sites.map(s => s.site_code));
        const missing = codes.filter(c => !existing.has(c));
        if (missing.length) {
            // Create ephemeral options with negative ids
            missing.forEach((code: string, idx: number) => {
                this.sites.push({ id: -1000 - idx, site_code: code });
            });
        }
    }

    private loadSurvey(): void {
        this.surveyService.getSurveyById(this.surveyId).subscribe({
            next: (res) => {
                const survey = res?.data || res;

                this.surveyForm.patchValue({
                    title: survey.title,
                    description: survey.description,
                    department: survey.department?.id ?? survey.department,
                    survey_type: survey.survey_type?.id ?? survey.survey_type,
                    is_location_based: !!survey.is_location_based,
                    is_image_required: !!survey.is_image_required,
                    is_active: !!survey.is_active
                });

                // Preselect by CODES
                const selectedCodes: string[] = this.normalizeSurveySiteCodes(survey);
                this.ensureOptionsContain(selectedCodes);

                // Set twice to help PrimeNG reflect initial selection reliably
                this.surveyForm.get('site_codes')!.setValue(selectedCodes, { emitEvent: false });
                setTimeout(() => {
                    this.surveyForm.get('site_codes')!.setValue(selectedCodes, { emitEvent: false });
                }, 0);

                // Categories & questions
                const hasCategories = Array.isArray(survey.categories) && survey.categories.length > 0;
                if (hasCategories) {
                    survey.categories.forEach((cat: any) => {
                        const catGroup = this.fb.group({
                            name: [cat.name || 'General', Validators.required],
                            questions: this.fb.array([])
                        });
                        this.categories.push(catGroup);
                        (cat.questions || []).forEach((q: any) =>
                            this.addQuestionToCategory(this.categories.length - 1, q)
                        );
                    });
                } else if (Array.isArray(survey.questions) && survey.questions.length > 0) {
                    const defCat = this.fb.group({ name: ['General', Validators.required], questions: this.fb.array([]) });
                    this.categories.push(defCat);
                    survey.questions.forEach((q: any) => this.addQuestionToCategory(0, q));
                } else {
                    this.addCategory();
                }

                this.isDataLoading = false;
            },
            error: (err) => {
                this.isDataLoading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load survey: ' + (err?.error?.message || 'Unknown error')
                });
                this.router.navigate(['/survey-list']);
            }
        });
    }

    private addQuestionToCategory(catIdx: number, q: any): void {
        const type = q.type;
        const base = this.fb.group({
            text: [q.text, Validators.required],
            type: [type, Validators.required],
            hasMarks: [!!q.has_marks],
            marks: [q.marks ?? 0],
            isRequired: [q.is_required !== false],
            remarks: [q.remarks ?? ''],
            choices: this.fb.array([]),
            yesValue: [false],
            noValue: [false],
            min_value: [q.min_value ?? 0],
            max_value: [q.max_value ?? 10]
        });

        if (type === 'choice') {
            (q.choices || []).forEach((c: any) => {
                this.getChoicesArray(base).push(
                    this.fb.group({ text: [c.text, Validators.required], isCorrect: [!!c.is_correct], marks: [c.marks ?? 0] })
                );
            });
        } else if (type === 'yesno') {
            const yes = (q.choices || []).find((c: any) => String(c.text).toLowerCase() === 'yes');
            const no  = (q.choices || []).find((c: any) => String(c.text).toLowerCase() === 'no');
            base.patchValue({ yesValue: !!(yes && yes.is_correct), noValue: !!(no && no.is_correct) });
        } else if (type === 'multiple_scoring') {
            (q.choices || []).forEach((c: any) => {
                this.getChoicesArray(base).push(this.fb.group({ text: [c.text, Validators.required], marks: [c.marks ?? 0] }));
            });
        }

        this.getQuestions(catIdx).push(base);
    }

    // ---------- Form helpers ----------
    get categories(): FormArray { return this.surveyForm.get('categories') as FormArray; }
    getQuestions(catIdx: number): FormArray { return this.categories.at(catIdx).get('questions') as FormArray; }
    getQuestionChoices(catIdx: number, qIdx: number): FormArray { return this.getQuestions(catIdx).at(qIdx).get('choices') as FormArray; }
    getYesNoControl(catIdx: number, qIdx: number, which: 'yes' | 'no'): FormControl {
        return this.getQuestions(catIdx).at(qIdx).get(`${which}Value`) as FormControl;
    }
    private getChoicesArray(qGroup: FormGroup): FormArray { return qGroup.get('choices') as FormArray; }

    // ---------- Category ----------
    addCategory(): void {
        this.categories.push(this.fb.group({ name: ['', Validators.required], questions: this.fb.array([]) }));
    }
    removeCategory(idx: number): void { this.categories.removeAt(idx); }

    // ---------- Questions ----------
    addQuestion(catIdx: number): void {
        this.getQuestions(catIdx).push(
            this.fb.group({
                text: ['', Validators.required],
                type: ['', Validators.required],
                hasMarks: [false],
                marks: [0],
                isRequired: [true],
                remarks: [''],
                choices: this.fb.array([]),
                yesValue: [false],
                noValue: [false],
                min_value: [0],
                max_value: [10]
            })
        );
    }
    removeQuestion(catIdx: number, qIdx: number): void { this.getQuestions(catIdx).removeAt(qIdx); }
    onQuestionTypeChange(catIdx: number, qIdx: number): void {
        const q = this.getQuestions(catIdx).at(qIdx) as FormGroup;
        const choices = q.get('choices') as FormArray;
        while (choices.length) choices.removeAt(0);
        if (q.get('type')?.value === 'multiple_scoring') this.addChoice(catIdx, qIdx);
        if (q.get('type')?.value === 'yesno') q.patchValue({ yesValue: false, noValue: false });
    }
    onLinearMaxValueChange(catIdx: number, qIdx: number): void {
        const q = this.getQuestions(catIdx).at(qIdx) as FormGroup;
        const maxValue = Number(q.get('max_value')?.value);
        if (!Number.isNaN(maxValue) && maxValue >= 0) q.patchValue({ marks: maxValue });
    }

    // ---------- Choices ----------
    addChoice(catIdx: number, qIdx: number): void {
        const q = this.getQuestions(catIdx).at(qIdx) as FormGroup;
        const isMultipleScoring = q.get('type')?.value === 'multiple_scoring';
        this.getQuestionChoices(catIdx, qIdx).push(
            this.fb.group(
                isMultipleScoring
                    ? { text: ['', Validators.required], marks: [0] }
                    : { text: ['', Validators.required], isCorrect: [false], marks: [0] }
            )
        );
    }
    removeChoice(catIdx: number, qIdx: number, cIdx: number): void {
        this.getQuestionChoices(catIdx, qIdx).removeAt(cIdx);
    }

    // ---------- Submit (send ONLY site_code) ----------
    async onSubmit(): Promise<void> {
        if (this.surveyForm.invalid) {
            this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Please fill all required fields' });
            return;
        }

        this.isLoading = true;
        const payload = this.prepareFormData(); // includes site_code only

        try {
            const url = `${survey_app.apiBaseUrl.replace(/\/+$/, '')}/survey/api/surveys/update/${this.surveyId}/`;
            const token = this.auth.getToken();

            const res = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify(payload)
            });

            const body = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(body?.message || `HTTP ${res.status}`);

            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Survey updated successfully!', life: 2500 });
            this.isLoading = false;
            setTimeout(() => this.router.navigate(['/survey-list']), 2500);
        } catch (e: any) {
            this.isLoading = false;
            this.messageService.add({ severity: 'error', summary: 'Update failed', detail: e?.message || 'Unknown error' });
        }
    }

    /** Build payload using site CODES only */
    private prepareFormData(): any {
        const v = this.surveyForm.value;
        const questions: QuestionPayload[] = [];

        (v.categories || []).forEach((cat: any) => {
            (cat.questions || []).forEach((q: any) => {
                const qp: QuestionPayload = {
                    text: q.text,
                    type: q.type,
                    has_marks: q.hasMarks,
                    marks: q.marks,
                    is_required: q.isRequired,
                    remarks: q.remarks || '',
                    category: cat.name,
                    choices: [],
                    multiple_score: q.type === 'multiple_scoring'
                };

                if (q.type === 'choice') {
                    qp.choices = (q.choices || []).map((c: any) => ({
                        text: c.text,
                        is_correct: !!c.isCorrect,
                        marks: q.hasMarks ? Number(c.marks ?? 0) : undefined
                    }));
                } else if (q.type === 'yesno') {
                    qp.choices = [
                        { text: 'Yes', is_correct: q.yesValue === true, marks: q.hasMarks ? 0 : undefined },
                        { text: 'No',  is_correct: q.noValue === true,  marks: q.hasMarks ? 0 : undefined }
                    ];
                } else if (q.type === 'multiple_scoring') {
                    qp.choices = (q.choices || []).map((c: any) => ({ text: c.text, marks: Number(c.marks ?? 0) }));
                } else if (q.type === 'linear') {
                    qp.min_value = Number(q.min_value ?? 0);
                    qp.max_value = Number(q.max_value ?? 0);
                }

                questions.push(qp);
            });
        });

        // Site CODES only (uppercased, unique, comma-separated)
        const codesRaw: string[] = Array.isArray(v.site_codes) ? v.site_codes : [];
        const codes = codesRaw.map((c: string) => this.cleanCode(c)).filter((c: string) => c.length > 0);
        const site_code = Array.from(new Set(codes)).join(',');

        return {
            title: v.title,
            description: v.description,
            department: v.department?.id ?? v.department,
            survey_type: v.survey_type?.id ?? v.survey_type,
            site_code, // <-- ONLY codes sent to backend
            is_location_based: v.is_location_based,
            is_image_required: v.is_image_required,
            is_active: v.is_active,
            questions,
            targets: v.targets || []
        };
    }

    onCancel(): void {
        this.router.navigate(['/survey-list']);
    }
}
