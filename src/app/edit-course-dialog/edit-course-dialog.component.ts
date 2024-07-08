import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { CourseCategoryComboboxComponent } from '../course-category-combobox/course-category-combobox.component';
import { LoadingIndicatorComponent } from '../loading/loading.component';
import { MessagesService } from '../messages/messages.service';
import { CourseCategory } from '../models/course-category.model';
import { Course } from '../models/course.model';
import { CoursesService } from '../services/courses.service';
import { EditCourseDialogData } from './edit-course-dialog.data.model';

@Component({
  selector: 'edit-course-dialog',
  standalone: true,
  imports: [
    LoadingIndicatorComponent,
    ReactiveFormsModule,
    CourseCategoryComboboxComponent,
  ],
  templateUrl: './edit-course-dialog.component.html',
  styleUrl: './edit-course-dialog.component.scss',
})
export class EditCourseDialogComponent {
  dialogRef = inject(MatDialogRef);

  data: EditCourseDialogData = inject(MAT_DIALOG_DATA);

  fb = inject(FormBuilder);
  form = this.fb.group({
    title: [''],
    longDescription: [''],
    iconUrl: [''],
  });

  courseService = inject(CoursesService);
  messagesService = inject(MessagesService);

  category = signal<CourseCategory>('BEGINNER');

  constructor() {
    this.form.patchValue({
      title: this.data?.course?.title,
      longDescription: this.data?.course?.longDescription,
      iconUrl: this.data?.course?.iconUrl,
    });

    this.category.set(this.data?.course?.category ?? 'BEGINNER');

    effect(() => {
      console.log(`Course category bi-directional binding: ${this.category()}`);
    });
  }

  onClose() {
    this.dialogRef.close();
  }

  onSave() {
    const courseProps = this.form.value as Partial<Course>;
    courseProps.category = this.category();

    if (this.data.mode === 'update') {
      this.updateCourse(this.data.course!.id, courseProps);
    }

    if (this.data.mode === 'create') {
      this.createCourse(courseProps);
    }
  }

  async updateCourse(courseId: string, changes: Partial<Course>) {
    try {
      const updatedCourse = this.courseService.updateCourse(courseId, changes);
      this.dialogRef.close(updatedCourse);
    } catch (err) {
      console.error(err);

      this.messagesService.showMessage('Failed to save the course.', 'error');
    }
  }

  async createCourse(course: Partial<Course>) {
    try {
      const newCourse = await this.courseService.createCourse(course);
      this.dialogRef.close(newCourse);
    } catch (err) {
      console.error(err);
      this.messagesService.showMessage('Failed to create the course.', 'error');
    }
  }
}

export async function openEditCourseDialog(
  dialog: MatDialog,
  data: EditCourseDialogData
) {
  const config = new MatDialogConfig();
  config.disableClose = true;
  config.autoFocus = true;
  config.width = '400px';
  config.data = data;

  const close$ = dialog.open(EditCourseDialogComponent, config).afterClosed();

  return firstValueFrom(close$);
}
