import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Correct PrimeNG imports
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextarea } from 'primeng/inputtextarea'; // Component, not module

@Component({
    selector: 'app-survey',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        InputTextModule,
        DropdownModule,
        CheckboxModule,
        ButtonModule,
        CardModule,
        InputTextarea // Imported as a component
    ],
    templateUrl: './survey.component.html',
    styleUrls: ['./survey.component.scss']
})
export class SurveyComponent {
    surveyForm: FormGroup;

    sites = [{ label: 'Site A', value: 1 }, { label: 'Site B', value: 2 }];
    departments = [{ label: 'Sales', value: 1 }, { label: 'Support', value: 2 }];
    surveyTypes = [{ label: 'Monthly', value: 1 }, { label: 'Adhoc', value: 2 }];
    questionTypes = [
        { label: 'Yes/No', value: 'yesno' },
        { label: 'Image', value: 'image' },
        { label: 'Choice', value: 'choice' },
        { label: 'Text', value: 'text' }
    ];

    constructor(private fb: FormBuilder) {
        this.surveyForm = this.fb.group({
            title: ['', Validators.required],
            description: [''],
            site_id: [null, Validators.required],
            department: [null, Validators.required],
            survey_type: [null, Validators.required],
            is_location_based: [false],
            is_image_required: [false],
            is_active: [true],
            created_by_user_id: [1],

            questions: this.fb.array([]),
            targets: this.fb.array([])
        });
    }

    get questions(): FormArray {
        return this.surveyForm.get('questions') as FormArray;
    }

    addQuestion() {
        this.questions.push(
            this.fb.group({
                text: ['', Validators.required],
                type: ['', Validators.required],
                has_marks: [false],
                marks: [null],
                is_required: [false],
                choices: this.fb.array([])
            })
        );
    }

    removeQuestion(index: number) {
        this.questions.removeAt(index);
    }

    getChoices(qIndex: number): FormArray {
        return this.questions.at(qIndex).get('choices') as FormArray;
    }

    addChoice(qIndex: number) {
        this.getChoices(qIndex).push(
            this.fb.group({
                text: ['', Validators.required],
                is_correct: [false]
            })
        );
    }

    removeChoice(qIndex: number, cIndex: number) {
        this.getChoices(qIndex).removeAt(cIndex);
    }

    submitSurvey() {
        if (this.surveyForm.valid) {
            console.log(this.surveyForm.value);
            // Here you'd send this.surveyForm.value to your backend API
        }
    }
}
