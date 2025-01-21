import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interface para la paginación
export interface Pageable {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
}

// Interface para Autor
export interface Autor {
  id: number;
  nombre: string;
  nacionalidad: string;
  fechaNacimiento: string;
  libros: number[];  // Usamos un arreglo de IDs de libros, como en el DTO
  status: boolean;
}

// Respuesta de la API que incluye la paginación y los autores
export interface AutorResponse {
  body: {
    content: Autor[];
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
export class AutorService {
  private apiUrl = 'http://localhost:8080/autor'; // URL del backend

  constructor(private http: HttpClient) {}

  // Obtener todos los autores
  getAutores(page: number = 0, size: number = 10, searchTerm: string = '') {
    let params: any = {
      page,
      size
    };
    
    if (searchTerm) {
      params.search = searchTerm;
    }
  
    return this.http.get<any>(`${this.apiUrl}`, { params });
  }

  // Obtener un autor por ID
  getAutorById(id: number): Observable<Autor> {
    return this.http.get<Autor>(`${this.apiUrl}/${id}`);
  }

  // Crear un nuevo autor
  createAutor(autor: Autor): Observable<Autor> {
    return this.http.post<Autor>(this.apiUrl, autor);
  }

  // Actualizar un autor existente
  updateAutor(id: number, autor: Autor): Observable<Autor> {
    return this.http.put<Autor>(`${this.apiUrl}/${id}`, autor);
  }

  // Eliminar un autor
  deleteAutor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
