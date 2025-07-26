import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgForOf } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { Card } from 'primeng/card';

@Component({
    selector: 'app-survey-edit',
    imports: [ReactiveFormsModule, NgForOf, DropdownModule, Card],
    templateUrl: './survey-edit.component.html'
})
export class SurveyEditComponent implements OnInit {
    form: FormGroup;

    targetTypes = [
        { label: 'All', value: 'all' },
        { label: 'Role', value: 'role' },
        { label: 'Department', value: 'department' },
        { label: 'Site', value: 'site' },
        { label: 'User', value: 'user' }
    ];

    roles = [{ name: 'Admin' }, { name: 'Manager' }];
    departments = [{ name: 'Sales' }, { name: 'HR' }];
    sites = [{ name: 'D011' }, { name: 'D013' }];
    users = [{ username: 'zahed' }, { username: 'rabbi' }];

    constructor(private fb: FormBuilder) {
        this.form = this.fb.group({
            title: [''],
            questions: this.fb.array([]),
            targets: this.fb.array([])
        });
    }

    ngOnInit() {
        this.addQuestion();
        this.addTarget();
    }

    get questions(): FormArray {
        return this.form.get('questions') as FormArray;
    }

    get targets(): FormArray {
        return this.form.get('targets') as FormArray;
    }

    getChoices(q: any): FormArray {
        return q.get('choices') as FormArray;
    }

    addQuestion() {
        const question = this.fb.group({
            text: [''],
            choices: this.fb.array([])
        });
        this.questions.push(question);
        this.addChoice(this.questions.length - 1);
    }

    removeQuestion(i: number) {
        this.questions.removeAt(i);
    }

    addChoice(i: number) {
        const choices = this.getChoices(this.questions.at(i));
        choices.push(this.fb.group({ text: [''] }));
    }

    removeChoice(i: number, j: number) {
        const choices = this.getChoices(this.questions.at(i));
        choices.removeAt(j);
    }

    addTarget() {
        const target = this.fb.group({
            target_type: [''],
            role: [''],
            department: [''],
            site: [''],
            user: ['']
        });
        this.targets.push(target);
    }

    removeTarget(i: number) {
        this.targets.removeAt(i);
    }

    submit() {
        console.log(this.form.value);
    }

    cancel() {
        this.form.reset();
    }
}
