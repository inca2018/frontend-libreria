import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Autor } from './autor.service';

export interface Pageable {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
}

export interface Libro {
  id: number;
  titulo: string;
  isbn: string;
  status: boolean,
  estado: EstadoLibro; 
  fechaPublicacion : string;
  autor: Autor;
}

export enum EstadoLibro {
  DISPONIBLE = 'DISPONIBLE',
  NO_DISPONIBLE = 'NO_DISPONIBLE'
}

export interface LibroResponse {
  body: {
    content: Libro[];
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
export class LibroService {
  private apiUrl = 'http://localhost:8080/libro'; // Cambia esta URL según tu backend

  constructor(private http: HttpClient) {}

    // Obtener todos los autores
    getLibros(page: number = 0, size: number = 10, searchTerm: string = '') {
      let params: any = {
        page,
        size
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }
    
      return this.http.get<any>(`${this.apiUrl}`, { params });
    }

    getLibrosActivos(page: number = 0, size: number = 10, searchTerm: string = '') {
      let params: any = {
        page,
        size
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }
    
      return this.http.get<any>(`${this.apiUrl}/activos`, { params });
    }

 

  getLibroById(id: number): Observable<Libro> {
    return this.http.get<Libro>(`${this.apiUrl}/${id}`);
  }

  createLibro(libro: Libro): Observable<Libro> {
    return this.http.post<Libro>(this.apiUrl, libro);
  }

  updateLibro(id: number, libro: Libro): Observable<Libro> {
    return this.http.put<Libro>(`${this.apiUrl}/${id}`, libro);
  }

  deleteLibro(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

    // Obtener autores de un libro
    getAutoresDelLibro(libroId: number): Observable<Autor[]> {
      return this.http.get<Autor[]>(`${this.apiUrl}/${libroId}/autores`);
    }
  
    // Agregar un autor al libro
    agregarAutorALibro(libroId: number, autorId: number): Observable<void> {
      return this.http.post<void>(`${this.apiUrl}/${libroId}/agregar-autor/${autorId}`, {});
    }
}
