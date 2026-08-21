import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  username = '';
  password = '';
  mensajeError = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  iniciarSesion(): void {
    this.mensajeError = '';

    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.router.navigate(['/pacientes']);
      },
      error: () => {
        this.mensajeError = 'Usuario o contraseña incorrectos';
      }
    });
  }
}