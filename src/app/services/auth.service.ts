import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

interface AuthResponse {
  token: string;
}

interface JwtPayload {
  sub?: string;
  roles?: string;
  exp?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/auth/login';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.apiUrl, {
      username,
      password
    }).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
      })
    );
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  cerrarSesion(): void {
    localStorage.removeItem('token');
  }

  estaAutenticado(): boolean {
    const token = this.obtenerToken();

    if (!token) {
      return false;
    }

    const payload = this.obtenerPayload();

    if (!payload?.exp) {
      return true;
    }

    const ahora = Math.floor(Date.now() / 1000);

    return payload.exp > ahora;
  }

  obtenerUsuario(): string | null {
    const payload = this.obtenerPayload();

    return payload?.sub ?? null;
  }

  obtenerRoles(): string[] {
    const payload = this.obtenerPayload();

    if (!payload?.roles) {
      return [];
    }

    return payload.roles
      .split(' ')
      .filter(rol => rol.trim() !== '');
  }

  tieneRol(rol: string): boolean {
    return this.obtenerRoles().includes(rol);
  }

  private obtenerPayload(): JwtPayload | null {
    const token = this.obtenerToken();

    if (!token) {
      return null;
    }

    try {
      const payloadBase64 = token.split('.')[1];

      const payloadJson = decodeURIComponent(
        atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'))
          .split('')
          .map(caracter =>
            '%' + ('00' + caracter.charCodeAt(0).toString(16)).slice(-2)
          )
          .join('')
      );

      return JSON.parse(payloadJson) as JwtPayload;

    } catch (error) {
      console.error('Error al leer el JWT:', error);
      return null;
    }
  }
}