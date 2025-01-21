import { Component, OnInit } from '@angular/core';
import { AutorService, Autor } from '../../services/autor.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavbarComponent } from '../../navbar/navbar.component';
import { HttpClientModule } from '@angular/common/http';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-autor',
  templateUrl: './autor.component.html',
  styleUrls: ['./autor.component.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    NavbarComponent,
    HttpClientModule,
    NgxPaginationModule
  ],
  providers: [AutorService]
})
export class AutorComponent implements OnInit {
  autores: Autor[] = [];
  autorForm!: FormGroup;
  isEdit = false;
  selectedAutorId?: number;
  totalPages: number = 0;
  currentPage: number = 1;
  totalItems: number = 0;
  p: number = 1;
  searchTerm: string = ''; // Término de búsqueda

  constructor(private autorService: AutorService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loadAutores();
    this.initForm();
  }

  // Inicializar formulario
  initForm() {
    this.autorForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      nacionalidad: ['', [Validators.required, Validators.minLength(1)]],
      fechaNacimiento: ['', [Validators.required]],
      status: [true, Validators.required],
    });
  }

  // Cargar todos los autores
  loadAutores(page: number = this.currentPage, size: number = 10) {
    this.autorService.getAutores(page - 1, size, this.searchTerm).subscribe((data) => {
      this.autores = data.body.content;
      this.totalItems = data.body.totalElements;
      this.totalPages = data.body.totalPages;
    });
  }

  // Manejar el cambio de página
  onPageChange(page: number) {
    this.currentPage = page;
    this.loadAutores(page);
  }

  // Filtrar autores cuando cambie el término de búsqueda
  onSearch() {
    this.currentPage = 1; // Resetear a la primera página cuando se cambia la búsqueda
    this.loadAutores();
  }

  // Enviar el formulario (crear o actualizar autor)
  submitForm() {
    if (this.autorForm.invalid) {
      return;
    }

    if (this.isEdit && this.selectedAutorId) {
      const updatedAutor: Autor = { ...this.autorForm.value, id: this.selectedAutorId };
      this.autorService.updateAutor(this.selectedAutorId, updatedAutor).subscribe(
        () => {
          this.loadAutores();
          this.resetForm();
          Swal.fire('Autor actualizado', 'El autor se ha actualizado correctamente.', 'success');
        },
        (error) => this.handleError(error, 'actualizar')
      );
    } else {
      const newAutor: Autor = this.autorForm.value;
      this.autorService.createAutor(newAutor).subscribe(
        () => {
          this.loadAutores();
          this.resetForm();
          Swal.fire('Autor creado', 'El autor se ha creado correctamente.', 'success');
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
        html: `<p>Hubo un error al ${action} el autor:</p><p>${errorMessages}</p>`,
        icon: 'error'
      });
    } else {
      // Si no hay estructura de errores, mostrar un mensaje genérico
      Swal.fire('Error', `Hubo un error al ${action} el autor.`, 'error');
    }
  }
  
  

  // Editar autor
  editAutor(autor: Autor) {
    this.isEdit = true;
    this.selectedAutorId = autor.id;
    this.autorForm.patchValue(autor);
  }

  // Eliminar autor
  deleteAutor(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡Este autor será eliminado permanentemente!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.autorService.deleteAutor(id).subscribe(() => {
          Swal.fire('Eliminado', 'El autor ha sido eliminado.', 'success');
          this.loadAutores();
          this.onSearch();
        });
      }
    });
  }

  // Resetear formulario
  resetForm() {
    this.isEdit = false;
    this.selectedAutorId = undefined;
    this.autorForm.reset();
    this.autorForm.get('status')?.setValue(true);
  }
}
