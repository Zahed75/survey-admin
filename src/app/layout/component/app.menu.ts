import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'Home',
                items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }]
            },

            {
                label: 'Sites Utility',
                icon: 'pi pi-fw pi-briefcase',
                routerLink: ['/pages'],
                items: [
                    {
                        label: 'Sites & Permission',
                        icon: 'pi pi-fw pi-users',
                        items: [

                            {
                                label: 'Role',
                                icon: 'pi pi-fw pi-users',
                                routerLink: ['/role']
                            },
                            {
                                label: 'Department',
                                icon: 'pi pi-fw pi-building',
                                routerLink: ['/department']  // Ensure this is correct
                            },

                            {
                                label: 'Survey-Target',
                                icon: 'pi pi-fw pi-window-maximize',
                                routerLink: ['/survey-target'],
                            }
                        ]
                    }
                ]
            },
            {
                label: 'Survey Management',
                icon: 'pi pi-fw pi-list',

                items: [
                    {
                        label: 'Create Survey',
                        icon: 'pi pi-fw pi-plus',
                        routerLink: ['/survey']
                    },


                ]
            }
        ];
    }
}
