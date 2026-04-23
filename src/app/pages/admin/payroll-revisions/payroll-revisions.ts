import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-payroll-revisions',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './payroll-revisions.html',
  styleUrl: './payroll-revisions.css',
})
export class PayrollRevisionsComponent {}
