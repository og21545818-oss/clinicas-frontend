
import {
  Component,
  ChangeDetectorRef,
  NgZone,
  OnInit,
  OnDestroy
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          'expired-callback': () => void;
          'error-callback': () => void;
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit, OnDestroy {

  username = '';
  password = '';
  mensajeError = '';
  cargando = false;

  turnstileToken = '';
  private widgetId?: string;

  // Sustituir por la Site Key pública de Cloudflare
  private siteKey = '0x4AAAAAAFtqWbuuZJhmJuAa';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    const script = document.createElement('script');
    script.src =
      'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;

    script.onload = () => {
      this.mostrarCaptcha();
    };

    if (window.turnstile) {
      this.mostrarCaptcha();
    } else {
      document.head.appendChild(script);
    }
  }

  private mostrarCaptcha(): void {
    if (!window.turnstile || this.widgetId) {
      return;
    }

    this.widgetId = window.turnstile.render('#turnstile-container', {
      sitekey: this.siteKey,

      callback: (token: string) => {
        this.zone.run(() => {
          this.turnstileToken = token;
          this.mensajeError = '';
          this.cdr.detectChanges();
        });
      },

      'expired-callback': () => {
        this.zone.run(() => {
          this.turnstileToken = '';
          this.cdr.detectChanges();
        });
      },

      'error-callback': () => {
        this.zone.run(() => {
          this.turnstileToken = '';
          this.mensajeError = 'No se pudo verificar el CAPTCHA.';
          this.cdr.detectChanges();
        });
      }
    });
  }

  iniciarSesion(): void {
    if (this.cargando) {
      return;
    }

    this.mensajeError = '';

    if (!this.username.trim() || !this.password) {
      this.mensajeError = 'Ingresa tu usuario y contraseña.';
      return;
    }

    if (!this.turnstileToken) {
      this.mensajeError = 'Completa la verificación CAPTCHA.';
      return;
    }

    this.cargando = true;

    this.authService.login(
      this.username,
      this.password,
      this.turnstileToken
    ).subscribe({
      next: () => {
        this.cargando = false;
        this.cdr.detectChanges();
        this.router.navigate(['/pacientes']);
      },

      error: (error: HttpErrorResponse) => {
        this.cargando = false;

        if (error.status === 429) {
          this.mensajeError =
            'Demasiados intentos. Tu cuenta puede estar bloqueada temporalmente.';
        } else if (error.status === 403) {
          this.mensajeError =
            'Verificación CAPTCHA inválida o incompleta.';
        } else if (error.status === 401) {
          this.mensajeError =
            'Usuario o contraseña incorrectos.';
        } else if (error.status === 0) {
          this.mensajeError =
            'No se pudo conectar con el servidor.';
        } else {
          this.mensajeError =
            'Ocurrió un error al iniciar sesión.';
        }

        this.turnstileToken = '';

        if (this.widgetId && window.turnstile) {
          window.turnstile.reset(this.widgetId);
        }

        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.widgetId && window.turnstile) {
      window.turnstile.remove(this.widgetId);
    }
  }
}
