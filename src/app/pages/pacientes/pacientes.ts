import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { PacienteService } from '../../services/paciente.service';
import { AuthService } from '../../services/auth.service';
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

  nuevoPaciente: Paciente = {
    nombre: '',
    apellido: '',
    edad: 0,
    telefono: ''
  };

  editando = false;
  pacienteEditandoId: number | null = null;

  constructor(
    private pacienteService: PacienteService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.esAdmin = this.authService.tieneRol('ROLE_ADMIN');
    this.cargarPacientes();
  }

  cargarPacientes(): void {
    this.pacienteService.obtenerPacientes().subscribe({
      next: (datos) => {
        this.pacientes = datos;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al obtener pacientes:', error);
      }
    });
  }

  guardarPaciente(): void {

    if (!this.esAdmin) {
      alert('No tienes permiso para registrar pacientes.');
      return;
    }

    if (
      !this.nuevoPaciente.nombre.trim() ||
      !this.nuevoPaciente.apellido.trim() ||
      !this.nuevoPaciente.telefono.trim() ||
      this.nuevoPaciente.edad <= 0
    ) {
      alert('Por favor completa todos los campos correctamente.');
      return;
    }

    if (this.editando && this.pacienteEditandoId !== null) {

      this.pacienteService
        .actualizarPaciente(this.pacienteEditandoId, this.nuevoPaciente)
        .subscribe({
          next: () => {
            this.cancelarEdicion();
            this.cargarPacientes();
          },
          error: (error) => {
            console.error('Error al actualizar paciente:', error);
          }
        });

    } else {

      this.pacienteService.crearPaciente(this.nuevoPaciente).subscribe({
        next: () => {
          this.limpiarFormulario();
          this.cargarPacientes();
        },
        error: (error) => {
          console.error('Error al crear paciente:', error);
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
      edad: paciente.edad,
      telefono: paciente.telefono
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

    this.pacienteService.eliminarPaciente(id).subscribe({
      next: () => {
        this.cargarPacientes();
      },
      error: (error) => {
        console.error('Error al eliminar paciente:', error);
      }
    });
  }

  limpiarFormulario(): void {
    this.nuevoPaciente = {
      nombre: '',
      apellido: '',
      edad: 0,
      telefono: ''
    };
  }

  cerrarSesion(): void {
    this.authService.cerrarSesion();
    this.router.navigate(['/']);
  }
}