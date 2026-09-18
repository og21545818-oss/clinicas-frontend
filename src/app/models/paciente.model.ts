export interface Paciente {
  id?: number;
  nombre: string;
  apellido: string;
  dpi?: string;
  edad: number;
  telefono: string;
  activo?: boolean;
}