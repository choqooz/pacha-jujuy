import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Cart } from '../models/cart';
import { ServiceResponse } from '../models/types';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private urlbase: string = environment.apiUrl || 'http://localhost:5000/api/';
  private endpoint: string = 'carts';

  constructor(private http: HttpClient) {}

  /**
   * Crea los headers HTTP con o sin autenticación
   * @param token Token de autenticación (opcional)
   * @returns HttpHeaders configurados
   */
  private getHeaders(token?: string): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-type': 'application/json',
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  /**
   * Maneja errores de las peticiones HTTP
   * @param error Error a manejar
   * @returns Observable con el error
   */
  private handleError(error: any): Observable<never> {
    console.error('API error:', error);
    return throwError(() => error);
  }

  /**
   * Crea un nuevo carrito
   * @param cart Datos del carrito a crear
   * @returns Observable con la respuesta del servidor
   */
  public createCart(cart: Cart): Observable<ServiceResponse> {
    return this.http
      .post<ServiceResponse>(`${this.urlbase}/${this.endpoint}`, cart, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Elimina un carrito por su ID
   * @param id ID del carrito a eliminar
   * @param token Token de autenticación
   * @returns Observable con la respuesta del servidor
   */
  public deleteCart(id: string, token: string): Observable<ServiceResponse> {
    return this.http
      .delete<ServiceResponse>(`${this.urlbase}/${this.endpoint}/${id}`, {
        headers: this.getHeaders(token),
      })
      .pipe(catchError(this.handleError.bind(this)));
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
        `${this.urlbase}/${this.endpoint}/${cart._id}`,
        cart,
        { headers: this.getHeaders(token) }
      )
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Obtiene todos los carritos
   * @param token Token de autenticación
   * @returns Observable con la lista de carritos
   */
  public getAllCarts(token: string): Observable<Cart[]> {
    return this.http
      .get<Cart[]>(`${this.urlbase}/${this.endpoint}`, {
        headers: this.getHeaders(token),
      })
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Obtiene los carritos con filtro "new"
   * @param token Token de autenticación
   * @returns Observable con la lista filtrada de carritos
   */
  public getAllCartsFilter(token: string): Observable<Cart[]> {
    return this.http
      .get<Cart[]>(`${this.urlbase}/${this.endpoint}?new=true`, {
        headers: this.getHeaders(token),
      })
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Obtiene el carrito de un usuario específico
   * @param userId ID del usuario
   * @param token Token de autenticación
   * @returns Observable con el carrito del usuario
   */
  public getUserCart(userId: string, token: string): Observable<Cart> {
    return this.http
      .get<Cart>(`${this.urlbase}/${this.endpoint}/find/${userId}`, {
        headers: this.getHeaders(token),
      })
      .pipe(catchError(this.handleError.bind(this)));
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
      .post<any>(`${this.urlbase}/mp`, cart, {
        headers: this.getHeaders(token),
      })
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Obtiene un carrito por su ID
   * @param cartId ID del carrito
   * @param token Token de autenticación
   * @returns Observable con el carrito solicitado
   */
  public getCart(cartId: string, token: string): Observable<Cart> {
    return this.http
      .get<Cart>(`${this.urlbase}/${this.endpoint}/${cartId}`, {
        headers: this.getHeaders(token),
      })
      .pipe(catchError(this.handleError.bind(this)));
  }
}
