import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavbarComponent } from '../../navbar/navbar.component';
import { HttpClientModule } from '@angular/common/http';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Prestamo, PrestamoService } from '../../services/prestamo.service';
import { Libro, LibroService } from '../../services/libro.service';
import { Usuario, UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-prestamo',
  templateUrl: './prestamo.component.html',
  styleUrls: ['./prestamo.component.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    NavbarComponent,
    HttpClientModule,
    NgxPaginationModule
  ],
  providers: [PrestamoService,LibroService,UsuarioService]
})
export class PrestamoComponent implements OnInit {
  prestamos: Prestamo[] = [];
  usuarios: any[] = []; 
  libros: any[] = []; 
  prestamoForm!: FormGroup;
  isEdit = false;
  selectedPrestamoId?: number;
  totalPages: number = 0;
  currentPage: number = 1;
  totalItems: number = 0;
  p: number = 1;
  searchTerm: string = ''; // Término de búsqueda

  constructor(private PrestamoService: PrestamoService,private libroService : LibroService,private usuarioService : UsuarioService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loadPrestamos();
    this.loadUsuarios();
    this.loadLibros();
    this.initForm();
  }

  // Inicializar formulario
  initForm() {
    this.prestamoForm = this.fb.group({
      libro: [null, [Validators.required]], // Agregar validación de libro
      usuario: [null, [Validators.required]], // Agregar validación de usuario
      fechaPrestamo: ['', [Validators.required]],
      fechaDevolucion: ['', [Validators.required]],
      //estado: ['', [Validators.required]],
    });
  }
  

  loadUsuarios() {
    this.usuarioService.getUsuarios().subscribe((data) => {
      this.usuarios = data.body.content;  // Asumimos que el servicio devuelve un arreglo de autores
    });
  }
  loadLibros() {
    this.libroService.getLibrosActivos().subscribe((data) => {
      this.libros = data.body.content;  // Asumimos que el servicio devuelve un arreglo de autores
    });
  }
  // Cargar todos los Prestamos
  loadPrestamos(page: number = this.currentPage, size: number = 10) {
    this.PrestamoService.getPrestamos(page - 1, size, this.searchTerm).subscribe((data) => {
      this.prestamos = data.body.content;
      this.totalItems = data.body.totalElements;
      this.totalPages = data.body.totalPages;
    });
  }

  // Manejar el cambio de página
  onPageChange(page: number) {
    this.currentPage = page;
    this.loadPrestamos(page);
  }

  // Filtrar Prestamos cuando cambie el término de búsqueda
  onSearch() {
    this.currentPage = 1; // Resetear a la primera página cuando se cambia la búsqueda
    this.loadPrestamos();
  }

  // Enviar el formulario (crear o actualizar Prestamo)
  submitForm() {
    if (this.prestamoForm.invalid) {
      return;
    }

    const PrestamoData = { ...this.prestamoForm.value };
    PrestamoData.libro = { id: PrestamoData.libro };
    PrestamoData.usuario = { id: PrestamoData.usuario };
 
    const newPrestamo: Prestamo = PrestamoData;
    this.prestamoForm.get('status')
    this.PrestamoService.createPrestamo(newPrestamo).subscribe(
      () => {
        this.loadPrestamos();
        this.loadLibros(); 
        this.resetForm();
        Swal.fire('Prestamo creado', 'El Prestamo se ha creado correctamente.', 'success');
      },
      (error) => this.handleError(error, 'crear')
    );
  
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
        html: `<p>Hubo un error al ${action} el Prestamo:</p><p>${errorMessages}</p>`,
        icon: 'error'
      });
    } else {
      // Si no hay estructura de errores, mostrar un mensaje genérico
      Swal.fire('Error', `Hubo un error al ${action} el Prestamo.`, 'error');
    }
  }

  // Editar Prestamo
  editPrestamo(Prestamo: Prestamo) {
    this.isEdit = true;
    this.selectedPrestamoId = Prestamo.id;
    this.prestamoForm.patchValue(Prestamo);

   
    this.prestamoForm.patchValue({
      ...Prestamo, 
      usuario: Prestamo.usuario.id
    });

    this.prestamoForm.patchValue({
      ...Prestamo, 
      libro: Prestamo.libro.id
    });
  }

  // Eliminar Prestamo
  deletePrestamo(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡Este Prestamo será eliminado permanentemente!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.PrestamoService.deletePrestamo(id).subscribe(() => {
          Swal.fire('Eliminado', 'El Prestamo ha sido eliminado.', 'success');
          this.loadPrestamos();
          this.loadLibros(); 
        });
      }
    });
  }

  finalizarPrestamo(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡Este Prestamo será finalizado!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, finalizar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.PrestamoService.finalizarPrestamo(id).subscribe(() => {
          Swal.fire('Eliminado', 'El Prestamo ha sido finalizado.', 'success');
          this.loadPrestamos();
          this.loadLibros(); 
        });
      }
    });
  }


  // Resetear formulario
  resetForm() {
    this.isEdit = false;
    this.selectedPrestamoId = undefined;
    this.prestamoForm.reset();
    this.prestamoForm.get('status')?.setValue(true);
  }
}
