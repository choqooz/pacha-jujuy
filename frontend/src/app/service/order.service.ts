import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { Order } from '../models/order';
import { environment } from 'src/environments/environment';
import { OrderResponse, OrdersResponse, StatsResponse } from '../models/types';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Crea los headers de autenticación para las peticiones
   */
  private getAuthHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      token: `Bearer ${token}`,
    });
  }

  /**
   * Maneja errores de las peticiones HTTP
   */
  private handleError(error: any): Observable<never> {
    console.error('API error:', error);
    return throwError(() => error);
  }

  /**
   * Crea una nueva orden
   * @param order - Datos de la orden
   * @param token - Token de autenticación
   */
  createOrder(order: Order, token: string): Observable<OrderResponse> {
    const url = `${this.apiUrl}/orders`;

    return this.http
      .post<OrderResponse>(url, order, {
        headers: this.getAuthHeaders(token),
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtiene todas las órdenes
   * @param token - Token de autenticación
   */
  getAllOrders(token: string): Observable<OrdersResponse> {
    const url = `${this.apiUrl}/orders`;

    return this.http
      .get<OrdersResponse>(url, {
        headers: this.getAuthHeaders(token),
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtiene órdenes filtradas como nuevas
   * @param token - Token de autenticación
   */
  getAllOrdersFilter(token: string): Observable<OrdersResponse> {
    const url = `${this.apiUrl}/orders?new=true`;

    return this.http
      .get<OrdersResponse>(url, {
        headers: this.getAuthHeaders(token),
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Actualiza una orden existente
   * @param order - Datos actualizados de la orden
   * @param token - Token de autenticación
   */
  updateOrder(order: Order, token: string): Observable<OrderResponse> {
    const url = `${this.apiUrl}/orders/${order._id}`;

    return this.http
      .put<OrderResponse>(url, order, {
        headers: this.getAuthHeaders(token),
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Elimina una orden
   * @param id - ID de la orden a eliminar
   * @param token - Token de autenticación
   */
  deleteOrder(id: string, token: string): Observable<any> {
    const url = `${this.apiUrl}/orders/${id}`;

    return this.http
      .delete<any>(url, {
        headers: this.getAuthHeaders(token),
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtiene órdenes por ID de usuario
   * @param userId - ID del usuario
   * @param token - Token de autenticación
   */
  getOrderByUserId(userId: string, token: string): Observable<OrdersResponse> {
    const url = `${this.apiUrl}/orders/find/${userId}`;

    return this.http
      .get<OrdersResponse>(url, {
        headers: this.getAuthHeaders(token),
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtiene lista de usuarios
   * @param token - Token de autenticación
   */
  getUsers(token: string): Observable<any> {
    const url = `${this.apiUrl}/users`;

    return this.http
      .get<any>(url, {
        headers: this.getAuthHeaders(token),
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtiene estadísticas de ingresos
   * @param token - Token de autenticación
   */
  getAllStats(token: string): Observable<any[]> {
    const url = `${this.apiUrl}/orders/income`;

    return this.http
      .get<any[]>(url, {
        headers: this.getAuthHeaders(token),
      })
      .pipe(catchError(this.handleError));
  }
}
