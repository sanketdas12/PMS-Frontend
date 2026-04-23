import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HrNavbarComponent } from '../hr-navbar/hr-navbar.component';
import { HrSidebarComponent } from '../hr-sidebar/hr-sidebar.component';

@Component({
  selector: 'app-hr-shell',
  standalone: true,
  imports: [RouterOutlet, HrNavbarComponent, HrSidebarComponent],
  template: `
    <div class="shell-root">
      <app-hr-navbar></app-hr-navbar>
      <div class="shell-body">
        <app-hr-sidebar></app-hr-sidebar>
        <main class="shell-main"><router-outlet></router-outlet></main>
      </div>
    </div>`,
  styles: [`:host{display:block;height:100vh;overflow:hidden}
    .shell-root{display:flex;flex-direction:column;height:100vh}
    .shell-body{display:flex;flex:1;overflow:hidden}
    .shell-main{flex:1;overflow-y:auto;background:var(--bg)}`]
})
export class HrShellComponent {}