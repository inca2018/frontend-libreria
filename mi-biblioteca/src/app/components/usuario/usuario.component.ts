import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavbarComponent } from '../../navbar/navbar.component';
import { HttpClientModule } from '@angular/common/http';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Usuario, UsuarioService } from '../../services/usuario.service';
 
@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    NavbarComponent,
    HttpClientModule,
    NgxPaginationModule
  ],
  providers: [UsuarioService]
})
export class UsuarioComponent implements OnInit {
  usuarios: Usuario[] = [];
  usuarioForm!: FormGroup;
  isEdit = false;
  selectedUsuarioId?: number;
  totalPages: number = 0;
  currentPage: number = 1;
  totalItems: number = 0;
  p: number = 1;
  searchTerm: string = ''; // Término de búsqueda

  constructor(private UsuarioService: UsuarioService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loadUsuarios();
    this.initForm();
  }

  // Inicializar formulario
  initForm() {
    this.usuarioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      documento: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]+$')]], // Solo números
      fechaNacimiento: ['', [Validators.required]],
      status: [true] // No es necesario Validators.required para checkbox
    });
    
  }

  // Cargar todos los Usuarios
  loadUsuarios(page: number = this.currentPage, size: number = 10) {
    this.UsuarioService.getUsuarios(page - 1, size, this.searchTerm).subscribe((data) => {
      this.usuarios = data.body.content;
      this.totalItems = data.body.totalElements;
      this.totalPages = data.body.totalPages;
    });
  }

  // Manejar el cambio de página
  onPageChange(page: number) {
    this.currentPage = page;
    this.loadUsuarios(page);
  }

  // Filtrar Usuarios cuando cambie el término de búsqueda
  onSearch() {
    this.currentPage = 1; // Resetear a la primera página cuando se cambia la búsqueda
    this.loadUsuarios();
  }

  // Enviar el formulario (crear o actualizar Usuario)
  submitForm() {
    if (this.usuarioForm.invalid) {
      return;
    }

    if (this.isEdit && this.selectedUsuarioId) {
      const updatedUsuario: Usuario = { ...this.usuarioForm.value, id: this.selectedUsuarioId };
      this.UsuarioService.updateUsuario(this.selectedUsuarioId, updatedUsuario).subscribe(
        () => {
          this.loadUsuarios();
          this.resetForm();
          Swal.fire('Usuario actualizado', 'El Usuario se ha actualizado correctamente.', 'success');
        },
        (error) => this.handleError(error, 'actualizar')
      );
    } else {
      const newUsuario: Usuario = this.usuarioForm.value;
      this.UsuarioService.createUsuario(newUsuario).subscribe(
        () => {
          this.loadUsuarios();
          this.resetForm();
          Swal.fire('Usuario creado', 'El Usuario se ha creado correctamente.', 'success');
        },
        (error) => this.handleError(error, 'crear')
      );
    }
  }

  handleError(error: any, action: string) {
     if (error?.error?.errors) {
       // Validar que "messages" es un array antes de aplicar join
       const errorMessages = Object.entries(error.error.errors)
         .map(([field, messages]) => {
           // Verificar si "messages" es un array
           if (Array.isArray(messages)) {
             return `- ${messages.join(', ')}`;
           } else {
             return `- ${messages}`; // Si no es un array, devolverlo tal cual
           }
         })
         .join('<br>'); // Separar mensajes por salto de línea (HTML)
   
       // Mostrar los errores en un Swal
       Swal.fire({
         title: 'Error',
         html: `<p>Hubo un error al ${action} el usuario:</p><p>${errorMessages}</p>`,
         icon: 'error'
       });
     } else {
       // Si no hay estructura de errores, mostrar un mensaje genérico
       Swal.fire('Error', `Hubo un error al ${action} el usuario.`, 'error');
     }
   }

  // Editar Usuario
  editUsuario(Usuario: Usuario) {
    this.isEdit = true;
    this.selectedUsuarioId = Usuario.id;
    this.usuarioForm.patchValue(Usuario);
  }

  // Eliminar Usuario
  deleteUsuario(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡Este Usuario será eliminado permanentemente!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.UsuarioService.deleteUsuario(id).subscribe(() => {
          Swal.fire('Eliminado', 'El Usuario ha sido eliminado.', 'success');
          this.loadUsuarios();
        });
      }
    });
  }

  // Resetear formulario
  resetForm() {
    this.isEdit = false;
    this.selectedUsuarioId = undefined;
    this.usuarioForm.reset();
    this.usuarioForm.get('status')?.setValue(true);
  }
}
