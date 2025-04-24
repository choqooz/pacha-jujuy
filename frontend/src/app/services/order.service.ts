import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { Order } from '../models/order';
import { OrderResponse, OrdersResponse, StatsResponse } from '../models/types';
import { HttpUtilService } from './http-util.service';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  constructor(
    private http: HttpClient,
    private httpUtil: HttpUtilService,
    private errorHandler: ErrorHandlerService
  ) {}

  /**
   * Crea una nueva orden
   * @param order - Datos de la orden
   * @param token - Token de autenticación
   */
  createOrder(order: Order, token: string): Observable<OrderResponse> {
    const url = `${this.httpUtil.getApiUrl()}/orders`;

    return this.http
      .post<OrderResponse>(url, order, {
        headers: this.httpUtil.getHeaders(token),
      })
      .pipe(
        catchError((error) =>
          this.errorHandler.handleHttpError(error, 'Error al crear orden')
        )
      );
  }

  /**
   * Obtiene todas las órdenes
   * @param token - Token de autenticación
   */
  getAllOrders(token: string): Observable<OrdersResponse> {
    const url = `${this.httpUtil.getApiUrl()}/orders`;

    return this.http
      .get<OrdersResponse>(url, {
        headers: this.httpUtil.getHeaders(token),
      })
      .pipe(
        catchError((error) =>
          this.errorHandler.handleHttpError(error, 'Error al obtener órdenes')
        )
      );
  }

  /**
   * Obtiene órdenes filtradas como nuevas
   * @param token - Token de autenticación
   */
  getAllOrdersFilter(token: string): Observable<OrdersResponse> {
    const url = `${this.httpUtil.getApiUrl()}/orders?new=true`;

    return this.http
      .get<OrdersResponse>(url, {
        headers: this.httpUtil.getHeaders(token),
      })
      .pipe(
        catchError((error) =>
          this.errorHandler.handleHttpError(
            error,
            'Error al obtener órdenes filtradas'
          )
        )
      );
  }

  /**
   * Actualiza una orden existente
   * @param order - Datos actualizados de la orden
   * @param token - Token de autenticación
   */
  updateOrder(order: Order, token: string): Observable<OrderResponse> {
    const url = `${this.httpUtil.getApiUrl()}/orders/${order._id}`;

    return this.http
      .put<OrderResponse>(url, order, {
        headers: this.httpUtil.getHeaders(token),
      })
      .pipe(
        catchError((error) =>
          this.errorHandler.handleHttpError(error, 'Error al actualizar orden')
        )
      );
  }

  /**
   * Elimina una orden
   * @param id - ID de la orden a eliminar
   * @param token - Token de autenticación
   */
  deleteOrder(id: string, token: string): Observable<any> {
    const url = `${this.httpUtil.getApiUrl()}/orders/${id}`;

    return this.http
      .delete<any>(url, {
        headers: this.httpUtil.getHeaders(token),
      })
      .pipe(
        catchError((error) =>
          this.errorHandler.handleHttpError(error, 'Error al eliminar orden')
        )
      );
  }

  /**
   * Obtiene órdenes por ID de usuario
   * @param userId - ID del usuario
   * @param token - Token de autenticación
   */
  getOrderByUserId(userId: string, token: string): Observable<OrdersResponse> {
    const url = `${this.httpUtil.getApiUrl()}/orders/find/${userId}`;

    return this.http
      .get<OrdersResponse>(url, {
        headers: this.httpUtil.getHeaders(token),
      })
      .pipe(
        catchError((error) =>
          this.errorHandler.handleHttpError(
            error,
            'Error al obtener órdenes de usuario'
          )
        )
      );
  }

  /**
   * Obtiene lista de usuarios
   * @param token - Token de autenticación
   */
  getUsers(token: string): Observable<any> {
    const url = `${this.httpUtil.getApiUrl()}/users`;

    return this.http
      .get<any>(url, {
        headers: this.httpUtil.getHeaders(token),
      })
      .pipe(
        catchError((error) =>
          this.errorHandler.handleHttpError(error, 'Error al obtener usuarios')
        )
      );
  }

  /**
   * Obtiene estadísticas de ingresos
   * @param token - Token de autenticación
   */
  getAllStats(token: string): Observable<any[]> {
    const url = `${this.httpUtil.getApiUrl()}/orders/income`;

    return this.http
      .get<any[]>(url, {
        headers: this.httpUtil.getHeaders(token),
      })
      .pipe(
        catchError((error) =>
          this.errorHandler.handleHttpError(
            error,
            'Error al obtener estadísticas'
          )
        )
      );
  }
}
