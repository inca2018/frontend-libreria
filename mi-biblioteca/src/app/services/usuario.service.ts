import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Pageable {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
}

export interface Usuario {
  id: number;
  nombre: string;
  documento: string;
  email: string;
  telefono: string;
  fechaNacimiento: string;
  status: boolean,
  prestamos: any[];
}

export interface UsuarioResponse {
  body: {
    content: Usuario[];
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
export class UsuarioService {
  private apiUrl = 'http://localhost:8080/usuario'; // Cambia esta URL según tu backend

  constructor(private http: HttpClient) {}

 
     
  getUsuarios(page: number = 0, size: number = 10, searchTerm: string = '') {
  let params: any = {
    page,
    size
  };
  
  if (searchTerm) {
    params.search = searchTerm;
  }

  return this.http.get<any>(`${this.apiUrl}`, { params });
}
 

  // Obtener un usuario por ID
  getUsuarioById(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  // Crear un nuevo usuario
  createUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, usuario);
  }

  // Actualizar un usuario existente
  updateUsuario(id: number, usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, usuario);
  }

  // Eliminar un usuario
  deleteUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
