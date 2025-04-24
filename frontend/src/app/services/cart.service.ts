import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { Cart } from '../models/cart';
import { ServiceResponse } from '../models/types';
import { HttpUtilService } from './http-util.service';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private endpoint: string = 'carts';

  constructor(
    private http: HttpClient,
    private httpUtil: HttpUtilService,
    private errorHandler: ErrorHandlerService
  ) {}

  /**
   * Crea un nuevo carrito
   * @param cart Datos del carrito a crear
   * @returns Observable con la respuesta del servidor
   */
  public createCart(cart: Cart): Observable<ServiceResponse> {
    return this.http
      .post<ServiceResponse>(
        `${this.httpUtil.getApiUrl()}/${this.endpoint}`,
        cart,
        {
          headers: this.httpUtil.getHeaders(),
        }
      )
      .pipe(
        catchError((error) =>
          this.errorHandler.handleHttpError(error, 'Error al crear carrito')
        )
      );
  }

  /**
   * Elimina un carrito por su ID
   * @param id ID del carrito a eliminar
   * @param token Token de autenticación
   * @returns Observable con la respuesta del servidor
   */
  public deleteCart(id: string, token: string): Observable<ServiceResponse> {
    return this.http
      .delete<ServiceResponse>(
        `${this.httpUtil.getApiUrl()}/${this.endpoint}/${id}`,
        {
          headers: this.httpUtil.getHeaders(token),
        }
      )
      .pipe(
        catchError((error) =>
          this.errorHandler.handleHttpError(error, 'Error al eliminar carrito')
        )
      );
  }

  /**
   * Actualiza un carrito existente
   * @param cart Datos del carrito a actualizar
   * @param token Token de autenticación
   * @returns Observable con la respuesta del servidor
   */
  public editCart(cart: Cart, token: string): Observable<ServiceResponse> {
    return this.http
      .put<ServiceResponse>(
        `${this.httpUtil.getApiUrl()}/${this.endpoint}/${cart._id}`,
        cart,
        { headers: this.httpUtil.getHeaders(token) }
      )
      .pipe(
        catchError((error) =>
          this.errorHandler.handleHttpError(
            error,
            'Error al actualizar carrito'
          )
        )
      );
  }

  /**
   * Obtiene todos los carritos
   * @param token Token de autenticación
   * @returns Observable con la lista de carritos
   */
  public getAllCarts(token: string): Observable<Cart[]> {
    return this.http
      .get<Cart[]>(`${this.httpUtil.getApiUrl()}/${this.endpoint}`, {
        headers: this.httpUtil.getHeaders(token),
      })
      .pipe(
        catchError((error) =>
          this.errorHandler.handleHttpError(error, 'Error al obtener carritos')
        )
      );
  }

  /**
   * Obtiene los carritos con filtro "new"
   * @param token Token de autenticación
   * @returns Observable con la lista filtrada de carritos
   */
  public getAllCartsFilter(token: string): Observable<Cart[]> {
    return this.http
      .get<Cart[]>(`${this.httpUtil.getApiUrl()}/${this.endpoint}?new=true`, {
        headers: this.httpUtil.getHeaders(token),
      })
      .pipe(
        catchError((error) =>
          this.errorHandler.handleHttpError(
            error,
            'Error al obtener carritos filtrados'
          )
        )
      );
  }

  /**
   * Obtiene el carrito de un usuario específico
   * @param userId ID del usuario
   * @param token Token de autenticación
   * @returns Observable con el carrito del usuario
   */
  public getUserCart(userId: string, token: string): Observable<Cart> {
    return this.http
      .get<Cart>(
        `${this.httpUtil.getApiUrl()}/${this.endpoint}/find/${userId}`,
        {
          headers: this.httpUtil.getHeaders(token),
        }
      )
      .pipe(
        catchError((error) =>
          this.errorHandler.handleHttpError(
            error,
            'Error al obtener carrito de usuario'
          )
        )
      );
  }

  /**
   * Realiza la compra de un carrito
   * @param cart Carrito a comprar
   * @param token Token de autenticación
   * @returns Observable con la respuesta del servidor
   */
  public buyCart(cart: Cart, token: string): Observable<any> {
    if (!token) {
      return throwError(
        () => new Error('No se proporcionó token de autenticación')
      );
    }

    return this.http
      .post<any>(`${this.httpUtil.getApiUrl()}/mp`, cart, {
        headers: this.httpUtil.getHeaders(token),
      })
      .pipe(
        catchError((error) =>
          this.errorHandler.handleHttpError(
            error,
            'Error al procesar la compra'
          )
        )
      );
  }

  /**
   * Obtiene un carrito por su ID
   * @param cartId ID del carrito
   * @param token Token de autenticación
   * @returns Observable con el carrito solicitado
   */
  public getCart(cartId: string, token: string): Observable<Cart> {
    return this.http
      .get<Cart>(`${this.httpUtil.getApiUrl()}/${this.endpoint}/${cartId}`, {
        headers: this.httpUtil.getHeaders(token),
      })
      .pipe(
        catchError((error) =>
          this.errorHandler.handleHttpError(error, 'Error al obtener carrito')
        )
      );
  }
}
