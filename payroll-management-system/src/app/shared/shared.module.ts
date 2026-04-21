import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SkeletonComponent } from './components/skeleton/skeleton.component';

@NgModule({
  imports: [CommonModule, RouterModule, SkeletonComponent],
  exports: [CommonModule, RouterModule, SkeletonComponent]
})
export class SharedModule {}