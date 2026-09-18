import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ModuloAcceso {
  id: number;
  nombre: string;
  ruta: string;
  icono: string;
  moduloPadreId: number | null;
  hijos: ModuloAcceso[];
}

@Injectable({
  providedIn: 'root'
})
export class AccesoService {

  private apiUrl = 'http://localhost:8080/api/accesos';

  constructor(private http: HttpClient) {}

  obtenerAccesos(): Observable<ModuloAcceso[]> {
    return this.http.get<ModuloAcceso[]>(this.apiUrl);
  }
}