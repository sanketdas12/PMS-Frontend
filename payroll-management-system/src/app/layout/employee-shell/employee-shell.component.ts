import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EmployeeNavbarComponent } from '../employee-navbar/employee-navbar.component';

@Component({
  selector: 'app-employee-shell',
  standalone: true,
  imports: [RouterOutlet, EmployeeNavbarComponent],
  template: `
    <div class="shell-root">
      <app-employee-navbar></app-employee-navbar>
      <main class="shell-main"><router-outlet></router-outlet></main>
    </div>`,
  styles: [`:host{display:block;height:100vh;overflow:hidden}
    .shell-root{display:flex;flex-direction:column;height:100vh}
    .shell-main{flex:1;overflow-y:auto;background:var(--bg)}`]
})
export class EmployeeShellComponent {}