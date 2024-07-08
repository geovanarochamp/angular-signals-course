import { Component, computed, effect, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { CoursesCardListComponent } from '../courses-card-list/courses-card-list.component';
import { openEditCourseDialog } from '../edit-course-dialog/edit-course-dialog.component';
import { MessagesService } from '../messages/messages.service';
import { Course, sortCoursesBySeqNo } from '../models/course.model';
import { CoursesService } from '../services/courses.service';

@Component({
  selector: 'home',
  standalone: true,
  imports: [MatTabGroup, MatTab, CoursesCardListComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  #courses = signal<Course[]>([]);
  coursesService = inject(CoursesService);
  dialog = inject(MatDialog);

  beginnerCourses = computed(() => {
    const courses = this.#courses();
    return courses.filter((course) => course.category === 'BEGINNER');
  });

  advancedCourses = computed(() => {
    const courses = this.#courses();
    return courses.filter((course) => course.category === 'ADVANCED');
  });

  messagesService = inject(MessagesService);

  constructor() {
    effect(() => {
      console.log(`Beginner courses: `, this.beginnerCourses());
      console.log(`Advanced courses: `, this.advancedCourses());
    });
    this.loadCourses().then(() =>
      console.log(`All courses loaded:`, this.#courses())
    );
  }

  async loadCourses() {
    try {
      const courses = await this.coursesService.loadAllCourses();
      this.#courses.set(courses.sort(sortCoursesBySeqNo));
    } catch (err) {
      this.messagesService.showMessage('Error loading courses', 'error');
      console.error(err);
    }
  }

  onCourseUpdated(updatedCourse: Course) {
    const courses = this.#courses();
    const newCourses = courses.map((course) =>
      course.id === updatedCourse.id ? updatedCourse : course
    );
    this.#courses.set(newCourses);
  }

  async onCourseDeleted(courseId: string) {
    try {
      await this.coursesService.deleteCourse(courseId);
      const courses = this.#courses();
      const newCourses = courses.filter((course) => course.id !== courseId);
      this.#courses.set(newCourses);
    } catch (err) {
      console.error(err);
      this.messagesService.showMessage('Error deleting course!', 'error');
    }
  }

  async onAddCourse() {
    const newCourse = await openEditCourseDialog(this.dialog, {
      mode: 'create',
      title: 'Create new course',
    });

    if (!newCourse) {
      return;
    }

    const newCourses = [...this.#courses(), newCourse];
    this.#courses.set(newCourses);
  }
}
