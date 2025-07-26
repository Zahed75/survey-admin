import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SurveyService } from '../../../services/survey/survey.service';
import { MessageService } from 'primeng/api';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { ButtonDirective } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { Checkbox } from 'primeng/checkbox';
import { InputNumber } from 'primeng/inputnumber';
import { NgForOf, NgIf } from '@angular/common';
import { Card } from 'primeng/card';

@Component({
    selector: 'app-survey-edit',
    templateUrl: './survey-edit.component.html',
    styleUrls: ['./survey-edit.component.scss'],
    imports: [ReactiveFormsModule, InputText, Textarea, ButtonDirective, DropdownModule, Checkbox, InputNumber, NgForOf, NgIf, Card],
    providers: [MessageService]
})
export class SurveyEditComponent implements OnInit {
    surveyForm!: FormGroup;
    surveyId!: number;
    loading = false;

    questionTypes = [
        { label: 'Text Answer', value: 'text' },
        { label: 'Yes/No', value: 'yesno' },
        { label: 'Multiple Choice', value: 'choice' },
        { label: 'Image Upload', value: 'image' },
        { label: 'Location', value: 'location' }
    ];

    constructor(
        private route: ActivatedRoute,
        private fb: FormBuilder,
        private surveyService: SurveyService,
        private messageService: MessageService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.surveyId = +this.route.snapshot.paramMap.get('id')!;
        this.initForm();
        this.loadSurvey();
    }

    initForm() {
        this.surveyForm = this.fb.group({
            title: ['', Validators.required],
            description: [''],
            questions: this.fb.array([]),
            targets: this.fb.array([])
        });
    }

    get questions(): FormArray {
        return this.surveyForm.get('questions') as FormArray;
    }

    get targets(): FormArray {
        return this.surveyForm.get('targets') as FormArray;
    }

    loadSurvey() {
        this.loading = true;
        this.surveyService.getSurveyById(this.surveyId).subscribe({
            next: (res) => {
                const s = res.data;
                this.surveyForm.patchValue({
                    title: s.title,
                    description: s.description
                });
                s.questions.forEach((q: any) => {
                    const qGroup = this.fb.group({
                        text: [q.text, Validators.required],
                        type: [q.type, Validators.required],
                        has_marks: [q.has_marks],
                        marks: [q.marks],
                        is_required: [q.is_required],
                        choices: this.fb.array([])
                    });

                    if (q.type === 'choice' || q.type === 'yesno') {
                        const cArray = qGroup.get('choices') as FormArray;
                        q.choices.forEach((c: any) => {
                            cArray.push(
                                this.fb.group({
                                    text: [c.text],
                                    is_correct: [c.is_correct]
                                })
                            );
                        });
                    }

                    this.questions.push(qGroup);
                });

                s.targets.forEach((t: any) => {
                    this.targets.push(
                        this.fb.group({
                            target_type: [t.target_type],
                            role_name: [t.role_name],
                            department: [t.department],
                            site_id: [t.site_id],
                            user_id: [t.user_id]
                        })
                    );
                });

                this.loading = false;
            }
        });
    }

    addChoice(qIdx: number) {
        const choiceArray = this.questions.at(qIdx).get('choices') as FormArray;
        choiceArray.push(this.fb.group({ text: [''], is_correct: [false] }));
    }

    removeChoice(qIdx: number, cIdx: number) {
        (this.questions.at(qIdx).get('choices') as FormArray).removeAt(cIdx);
    }

    addQuestion() {
        this.questions.push(
            this.fb.group({
                text: [''],
                type: [''],
                has_marks: [false],
                marks: [0],
                is_required: [false],
                choices: this.fb.array([])
            })
        );
    }

    removeQuestion(qIdx: number) {
        this.questions.removeAt(qIdx);
    }

    addTarget() {
        this.targets.push(
            this.fb.group({
                target_type: [''],
                role_name: [''],
                department: [null],
                site_id: [null],
                user_id: [null]
            })
        );
    }

    removeTarget(tIdx: number) {
        this.targets.removeAt(tIdx);
    }

    onSubmit() {
        if (this.surveyForm.invalid) return;
        this.surveyService.updateSurvey(this.surveyId, this.surveyForm.value).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Survey updated successfully!' });
                this.router.navigate(['/survey-list']);
            }
        });
    }

    cancel() {
        this.router.navigate(['/survey-list']);
    }
}
