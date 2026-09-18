import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Paciente } from '../models/paciente.model';

export interface PageMetadata {
  totalRecords: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PacientePageResponse {
  data: Paciente[];
  metadata: PageMetadata;
}

@Injectable({
  providedIn: 'root'
})
export class PacienteService {

  private apiUrl = 'http://localhost:8081/api/pacientes';

  constructor(private http: HttpClient) {}

  obtenerPacientes(
    page: number = 0,
    size: number = 50,
    nombre: string = '',
    apellido: string = '',
    dpi: string = '',
    activo: boolean | null = null
  ): Observable<PacientePageResponse> {

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (nombre.trim()) {
      params = params.set('nombre', nombre.trim());
    }

    if (apellido.trim()) {
      params = params.set('apellido', apellido.trim());
    }

    if (dpi.trim()) {
      params = params.set('dpi', dpi.trim());
    }

    if (activo !== null) {
      params = params.set('activo', activo.toString());
    }

    return this.http.get<PacientePageResponse>(
      this.apiUrl,
      { params }
    );
  }

  crearPaciente(paciente: Paciente): Observable<Paciente> {
    return this.http.post<Paciente>(
      this.apiUrl,
      paciente
    );
  }

  actualizarPaciente(
    id: number,
    paciente: Paciente
  ): Observable<Paciente> {

    return this.http.put<Paciente>(
      `${this.apiUrl}/${id}`,
      paciente
    );
  }

  eliminarPaciente(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}