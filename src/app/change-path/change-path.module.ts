import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangePathComponent } from './change-path.component';
import { RouterModule } from '@angular/router';
import { MatInputModule } from '@angular/material';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [ChangePathComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    RouterModule.forChild([{ path: '', component: ChangePathComponent }])
  ]
})
export class ChangePathModule {}
