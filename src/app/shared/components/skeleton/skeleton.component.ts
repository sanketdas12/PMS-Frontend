import { Component, Input } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [NgFor, NgIf],
  template: `
    <div *ngIf="type === 'metrics'" class="skel-grid">
      <div class="skel-card" *ngFor="let i of items">
        <div class="skel-label"></div>
        <div class="skel-value"></div>
        <div class="skel-sub"></div>
      </div>
    </div>
    <div *ngIf="type === 'table'" class="skel-table">
      <div class="skel-row header">
        <div class="skel-cell" *ngFor="let i of items"></div>
      </div>
      <div class="skel-row" *ngFor="let r of rows">
        <div class="skel-cell" *ngFor="let i of items"></div>
      </div>
    </div>
    <div *ngIf="type === 'form'" class="skel-form">
      <div class="skel-field" *ngFor="let i of items">
        <div class="skel-field-label"></div>
        <div class="skel-field-input"></div>
      </div>
    </div>
    <div *ngIf="type === 'list'" class="skel-list">
      <div class="skel-list-item" *ngFor="let i of items">
        <div class="skel-avatar"></div>
        <div class="skel-list-text">
          <div class="skel-list-title"></div>
          <div class="skel-list-sub"></div>
        </div>
      </div>
    </div>
    <div *ngIf="type === 'banner'" class="skel-banner">
      <div class="skel-avatar"></div>
      <div class="skel-banner-text">
        <div class="skel-banner-title"></div>
        <div class="skel-banner-sub"></div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .skel-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }
    .skel-card {
      background: #fff;
      border: 1px solid #dde4ee;
      border-radius: 14px;
      padding: 20px 22px;
    }
    .skel-label {
      height: 11px; width: 55%;
      background: linear-gradient(90deg, #f0f4f8 25%, #e2e8f0 50%, #f0f4f8 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 6px;
      margin-bottom: 12px;
    }
    .skel-value {
      height: 28px; width: 40%;
      background: linear-gradient(90deg, #f0f4f8 25%, #e2e8f0 50%, #f0f4f8 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 6px;
      margin-bottom: 8px;
    }
    .skel-sub {
      height: 10px; width: 65%;
      background: linear-gradient(90deg, #f0f4f8 25%, #e2e8f0 50%, #f0f4f8 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 6px;
    }
    .skel-table {
      background: #fff;
      border: 1px solid #dde4ee;
      border-radius: 14px;
      overflow: hidden;
    }
    .skel-row {
      display: flex;
      gap: 12px;
      padding: 14px 20px;
      border-bottom: 1px solid #f0f4f8;
    }
    .skel-row.header { background: #f8fafc; }
    .skel-cell {
      flex: 1;
      height: 12px;
      background: linear-gradient(90deg, #f0f4f8 25%, #e2e8f0 50%, #f0f4f8 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 6px;
    }
    .skel-row.header .skel-cell { height: 10px; }
    .skel-form {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }
    .skel-field { display: flex; flex-direction: column; gap: 8px; }
    .skel-field-label {
      height: 11px; width: 35%;
      background: linear-gradient(90deg, #f0f4f8 25%, #e2e8f0 50%, #f0f4f8 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 6px;
    }
    .skel-field-input {
      height: 38px; width: 100%;
      background: linear-gradient(90deg, #f0f4f8 25%, #e2e8f0 50%, #f0f4f8 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 8px;
    }
    .skel-list { display: flex; flex-direction: column; gap: 12px; }
    .skel-list-item {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #fff;
      border: 1px solid #dde4ee;
      border-radius: 12px;
      padding: 14px 16px;
    }
    .skel-avatar {
      width: 40px; height: 40px;
      border-radius: 50%;
      background: linear-gradient(90deg, #f0f4f8 25%, #e2e8f0 50%, #f0f4f8 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      flex-shrink: 0;
    }
    .skel-list-text { flex: 1; display: flex; flex-direction: column; gap: 8px; }
    .skel-list-title {
      height: 13px; width: 45%;
      background: linear-gradient(90deg, #f0f4f8 25%, #e2e8f0 50%, #f0f4f8 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 6px;
    }
    .skel-list-sub {
      height: 11px; width: 65%;
      background: linear-gradient(90deg, #f0f4f8 25%, #e2e8f0 50%, #f0f4f8 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 6px;
    }
    .skel-banner {
      display: flex;
      align-items: center;
      gap: 16px;
      background: linear-gradient(135deg, #e8edf5 0%, #dde4ee 100%);
      border-radius: 12px;
      padding: 20px 24px;
    }
    .skel-banner-text { flex: 1; display: flex; flex-direction: column; gap: 10px; }
    .skel-banner-title {
      height: 18px; width: 40%;
      background: linear-gradient(90deg, #dde4ee 25%, #cdd5e0 50%, #dde4ee 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 6px;
    }
    .skel-banner-sub {
      height: 12px; width: 55%;
      background: linear-gradient(90deg, #dde4ee 25%, #cdd5e0 50%, #dde4ee 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 6px;
    }
    @media (max-width: 900px) {
      .skel-grid { grid-template-columns: repeat(2, 1fr); }
      .skel-form { grid-template-columns: 1fr; }
    }
    @media (max-width: 540px) {
      .skel-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class SkeletonComponent {
  @Input() type: 'metrics' | 'table' | 'form' | 'list' | 'banner' = 'metrics';
  @Input() count: number = 4;
  @Input() rowCount: number = 5;
  @Input() cols: number = 4;

  get items(): number[] { return Array(this.count).fill(0); }
  get rows(): number[]  { return Array(this.rowCount).fill(0); }
}
