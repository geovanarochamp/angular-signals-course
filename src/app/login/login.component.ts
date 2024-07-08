import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MessagesService } from '../messages/messages.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  fb = inject(FormBuilder);
  form = this.fb.group({
    email: [''],
    password: [''],
  });

  messagesService = inject(MessagesService);
  authService = inject(AuthService);
  router = inject(Router);

  async onLogin() {
    console.log('Logging in...');
    try {
      const { email, password } = this.form.value;
      if (!email || !password) {
        this.messagesService.showMessage(
          'Enter an email and password to login.',
          'error'
        );
        return;
      }
      await this.authService.login(email, password);
      await this.router.navigate(['/home']);
    } catch (err) {
      console.log(err);
      this.messagesService.showMessage(
        'Login failed, please try again.',
        'error'
      );
    }
  }
}
