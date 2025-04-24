import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HttpUtilService {
  private apiUrl: string = environment.apiUrl || 'http://localhost:5000/api';

  constructor() {}

  /**
   * Obtiene la URL base para las APIs
   */
  getApiUrl(): string {
    return this.apiUrl;
  }

  /**
   * Crea headers HTTP con autenticación opcional
   * @param token Token de autenticación (opcional)
   * @returns Headers HTTP configurados
   */
  getHeaders(token?: string): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  /**
   * Crea headers HTTP específicos para autenticación
   * @param token Token de autenticación (opcional)
   * @returns Headers HTTP configurados
   */
  getAuthHeaders(token?: string): HttpHeaders {
    return this.getHeaders(token);
  }
}
