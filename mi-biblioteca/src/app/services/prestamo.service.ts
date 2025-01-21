import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Autor } from './autor.service';
import { Libro } from './libro.service';
import { Usuario } from './usuario.service';

export interface Pageable {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
}

export interface Prestamo {
  id: number;
  fechaPrestamo: string;
  fechaDevolucion: string;
  status: boolean,
  libro: Libro; 
  usuario : Usuario;
  estado: EstadoPrestamo;
}

export enum EstadoPrestamo {
  DISPONIBLE = 'ACTIVO',
  NO_DISPONIBLE = 'FINALIZADO'
}

export interface PrestamoResponse {
  body: {
    content: Prestamo[];
    pageable: Pageable;
    totalPages: number;
    totalElements: number;
  };
  statusCode: string;
  statusCodeValue: number;
}


@Injectable({
  providedIn: 'root',
})
export class PrestamoService {
  private apiUrl = 'http://localhost:8080/prestamo'; 

  constructor(private http: HttpClient) {}

    // Obtener todos los autores
    getPrestamos(page: number = 0, size: number = 10, searchTerm: string = '') {
      let params: any = {
        page,
        size
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }
    
      return this.http.get<any>(`${this.apiUrl}`, { params });
    }
 
  createPrestamo(Prestamo: Prestamo): Observable<Prestamo> {
    return this.http.post<Prestamo>(this.apiUrl, Prestamo);
  }

  deletePrestamo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  finalizarPrestamo(id: number): Observable<Prestamo> {
    return this.http.put<Prestamo>(`${this.apiUrl}/${id}/finalizar`, {});
  }


}
