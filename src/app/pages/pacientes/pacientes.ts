import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { PacienteService } from '../../services/paciente.service';
import { AuthService } from '../../services/auth.service';
import {
  AccesoService,
  ModuloAcceso
} from '../../services/acceso.service';
import { Paciente } from '../../models/paciente.model';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pacientes.html',
  styleUrl: './pacientes.css'
})
export class Pacientes implements OnInit {

  pacientes: Paciente[] = [];

  esAdmin = false;

  // Accesos dinámicos
  accesos: ModuloAcceso[] = [];

  // Menú lateral
  menuAbierto = false;

  // Paginación
  paginaActual = 0;
  tamanoPagina = 50;
  totalRegistros = 0;
  totalPaginas = 0;
  tieneAnterior = false;
  tieneSiguiente = false;

  // Opciones permitidas por el backend
  opcionesTamanoPagina = [50, 100, 200];

  // Filtros
  filtroNombre = '';
  filtroApellido = '';
  filtroDpi = '';
  filtroActivo: boolean | null = null;

  // Nuevo / editar paciente
  nuevoPaciente: Paciente = {
    nombre: '',
    apellido: '',
    dpi: '',
    edad: 0,
    telefono: '',
    activo: true
  };

  editando = false;
  pacienteEditandoId: number | null = null;

  constructor(
    private pacienteService: PacienteService,
    private authService: AuthService,
    private accesoService: AccesoService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.esAdmin = this.authService.tieneRol('ROLE_ADMIN');

    this.cargarAccesos();
    this.cargarPacientes();
  }

  // =========================
  // ACCESOS Y MENÚ
  // =========================

  cargarAccesos(): void {
    this.accesoService.obtenerAccesos().subscribe({
      next: (respuesta) => {
        this.accesos = respuesta;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al obtener accesos:', error);
      }
    });
  }

  alternarMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }

  irRuta(ruta: string): void {
    this.router.navigate([ruta]);
    this.menuAbierto = false;
  }

  // =========================
  // PACIENTES
  // =========================

  cargarPacientes(): void {
    this.pacienteService
      .obtenerPacientes(
        this.paginaActual,
        this.tamanoPagina,
        this.filtroNombre,
        this.filtroApellido,
        this.filtroDpi,
        this.filtroActivo
      )
      .subscribe({
        next: (respuesta) => {

          this.pacientes = respuesta.data;

          this.totalRegistros = respuesta.metadata.totalRecords;
          this.paginaActual = respuesta.metadata.page;
          this.tamanoPagina = respuesta.metadata.pageSize;
          this.totalPaginas = respuesta.metadata.totalPages;
          this.tieneAnterior = respuesta.metadata.hasPreviousPage;
          this.tieneSiguiente = respuesta.metadata.hasNextPage;

          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error al obtener pacientes:', error);
        }
      });
  }

  buscarPacientes(): void {
    this.paginaActual = 0;
    this.cargarPacientes();
  }

  limpiarFiltros(): void {
    this.filtroNombre = '';
    this.filtroApellido = '';
    this.filtroDpi = '';
    this.filtroActivo = null;
    this.paginaActual = 0;

    this.cargarPacientes();
  }

  cambiarTamanoPagina(): void {
    this.paginaActual = 0;
    this.cargarPacientes();
  }

  paginaAnterior(): void {
    if (this.tieneAnterior) {
      this.paginaActual--;
      this.cargarPacientes();
    }
  }

  paginaSiguiente(): void {
    if (this.tieneSiguiente) {
      this.paginaActual++;
      this.cargarPacientes();
    }
  }

  // =========================
  // CREAR / EDITAR
  // =========================

  guardarPaciente(): void {

    if (!this.esAdmin) {
      alert('No tienes permiso para registrar pacientes.');
      return;
    }

    if (
      !this.nuevoPaciente.nombre.trim() ||
      !this.nuevoPaciente.apellido.trim() ||
      !this.nuevoPaciente.dpi?.trim() ||
      !this.nuevoPaciente.telefono.trim() ||
      this.nuevoPaciente.edad <= 0
    ) {
      alert('Por favor completa todos los campos correctamente.');
      return;
    }

    if (this.editando && this.pacienteEditandoId !== null) {

      this.pacienteService
        .actualizarPaciente(
          this.pacienteEditandoId,
          this.nuevoPaciente
        )
        .subscribe({
          next: () => {
            this.cancelarEdicion();
            this.cargarPacientes();
          },
          error: (error) => {
            console.error(
              'Error al actualizar paciente:',
              error
            );
          }
        });

    } else {

      this.pacienteService
        .crearPaciente(this.nuevoPaciente)
        .subscribe({
          next: () => {

            this.limpiarFormulario();

            // El backend ordena por ID descendente
            this.paginaActual = 0;

            this.cargarPacientes();
          },
          error: (error) => {
            console.error(
              'Error al crear paciente:',
              error
            );
          }
        });
    }
  }

  editarPaciente(paciente: Paciente): void {

    if (!this.esAdmin) {
      alert('No tienes permiso para editar pacientes.');
      return;
    }

    this.editando = true;
    this.pacienteEditandoId = paciente.id!;

    this.nuevoPaciente = {
      nombre: paciente.nombre,
      apellido: paciente.apellido,
      dpi: paciente.dpi ?? '',
      edad: paciente.edad,
      telefono: paciente.telefono,
      activo: paciente.activo ?? true
    };
  }

  cancelarEdicion(): void {
    this.editando = false;
    this.pacienteEditandoId = null;
    this.limpiarFormulario();
  }

  eliminarPaciente(id: number): void {

    if (!this.esAdmin) {
      alert('No tienes permiso para eliminar pacientes.');
      return;
    }

    if (!confirm('¿Estás seguro de eliminar este paciente?')) {
      return;
    }

    this.pacienteService
      .eliminarPaciente(id)
      .subscribe({
        next: () => {
          this.cargarPacientes();
        },
        error: (error) => {
          console.error(
            'Error al eliminar paciente:',
            error
          );
        }
      });
  }

  limpiarFormulario(): void {
    this.nuevoPaciente = {
      nombre: '',
      apellido: '',
      dpi: '',
      edad: 0,
      telefono: '',
      activo: true
    };
  }

  // =========================
  // NAVEGACIÓN
  // =========================

  irAdministracion(): void {
    if (this.esAdmin) {
      this.router.navigate(['/admin']);
      this.menuAbierto = false;
    }
  }

  cerrarSesion(): void {
    this.authService.cerrarSesion();
    this.router.navigate(['/']);
  }
}