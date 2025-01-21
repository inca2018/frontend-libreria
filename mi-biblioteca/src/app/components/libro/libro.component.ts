import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavbarComponent } from '../../navbar/navbar.component';
import { HttpClientModule } from '@angular/common/http';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Libro, LibroService } from '../../services/libro.service';
import { Autor, AutorService } from '../../services/autor.service';
@Component({
  selector: 'app-libro',
  templateUrl: './libro.component.html',
  styleUrls: ['./libro.component.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    NavbarComponent,
    HttpClientModule,
    NgxPaginationModule
  ],
  providers: [LibroService,AutorService]
})
export class LibroComponent implements OnInit {
  libros: Libro[] = [];
  autores: any[] = []; 
  libroForm!: FormGroup;
  isEdit = false;
  selectedlibroId?: number;
  totalPages: number = 0;
  currentPage: number = 1;
  totalItems: number = 0;
  p: number = 1;
  searchTerm: string = '';

  pageSize: number = 20; // Número de elementos por página
  pageNumber: number = 0; // Página actual


  constructor(private libroService: LibroService,private autorService : AutorService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loadLibros();
    this.loadAutores();
    this.initForm();
  }

  // Inicializar formulario
  initForm() {
    this.libroForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(2)]],
      autor: ['', [Validators.required]],
      isbn: ['', [Validators.required]], 
      fechaPublicacion: ['', [Validators.required]],
      //estado: ['', [Validators.required]], 
      status: [true] 
    });
    
  }

  loadAutores() {
    this.autorService.getAutores().subscribe((data) => {
      this.autores = data.body.content;  // Asumimos que el servicio devuelve un arreglo de autores
    });
  }
  
  loadLibros(page: number = this.currentPage, size: number = 10) {
    this.libroService.getLibros(page - 1, size, this.searchTerm).subscribe((data) => {
      this.libros = data.body.content;
      this.totalItems = data.body.totalElements; // Asegúrate de que esto está devolviendo el total correcto
      this.totalPages = data.body.totalPages;   // Asegúrate de que esto es correcto también
      this.p = page; // Actualizar la página actual
    });
  }
  
  

  onPageChange(page: number): void {
    this.pageNumber = page;
    this.loadLibros();
  }

  onSearch(): void {
    this.pageNumber = 0; 
    this.loadLibros();
  }

  submitForm() {
    if (this.libroForm.invalid) {
      return;
    }

    const libroData = { ...this.libroForm.value };
    libroData.autor = { id: libroData.autor };


    if (this.isEdit && this.selectedlibroId) {
      const updatedLibro: Libro = { ...libroData, id: this.selectedlibroId };
      this.libroService.updateLibro(this.selectedlibroId, updatedLibro).subscribe(
        () => {
          this.loadLibros();
          this.resetForm();
          Swal.fire('libro actualizado', 'El libro se ha actualizado correctamente.', 'success');
        },
        (error) => this.handleError(error, 'actualizar')
      );
    } else {
      const newLibro: Libro = libroData;
      this.libroForm.get('status')
      this.libroService.createLibro(newLibro).subscribe(
        () => {
          this.loadLibros();
          this.resetForm();
          Swal.fire('libro creado', 'El libro se ha creado correctamente.', 'success');
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
        html: `<p>Hubo un error al ${action} el libro:</p><p>${errorMessages}</p>`,
        icon: 'error'
      });
    } else {
      // Si no hay estructura de errores, mostrar un mensaje genérico
      Swal.fire('Error', `Hubo un error al ${action} el libro.`, 'error');
    }
  }

  // Editar libro
  editLibro(libro: Libro) {
    this.isEdit = true;
    this.selectedlibroId = libro.id;
    this.libroForm.patchValue(libro);

   
    this.libroForm.patchValue({
      ...libro, 
      autor: libro.autor.id
    });
  }

  // Eliminar libro
  deleteLibro(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡Este libro será eliminado permanentemente!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.libroService.deleteLibro(id).subscribe(
          () => {
            Swal.fire('Eliminado', 'El libro ha sido eliminado.', 'success');
            this.loadLibros(); // Recargar la lista de libros
          },
          (error) => this.handleError(error, 'eliminar') // Manejar errores
        );
      }
    });
  }
  

  getEstadoFormateado(estado: string): string {
    return estado === 'NO_DISPONIBLE' ? 'NO DISPONIBLE' : estado;
  }
  // Resetear formulario
  resetForm() {
    this.isEdit = false;
    this.selectedlibroId = undefined;
    this.libroForm.reset();
    this.libroForm.get('status')?.setValue(true);
  }
}
