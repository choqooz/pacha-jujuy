import { Injectable } from '@angular/core';
import { Observable, Subject, catchError, tap, throwError } from 'rxjs';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Product, ProductResponse } from '../models/product';
import { environment } from 'src/environments/environment';
import { DatosCompartidosService } from './datos-compartidos.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  productCarrito: Product[] = [];
  total: number = 0;
  private apiUrl: string = environment.apiUrl || 'http://localhost:5000';
  private categories: string[] = [];
  private categoriesSubject: Subject<string[]> = new Subject<string[]>();

  constructor(
    private http: HttpClient,
    private datosCompartidos: DatosCompartidosService
  ) {}

  /**
   * Crea headers HTTP con autenticación opcional
   */
  private getHeaders(token?: string): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  /**
   * Manejo centralizado de errores HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('API Error:', error);
    return throwError(() => error);
  }

  /**
   * Obtiene un producto por su ID
   */
  getProductById(productId: string, token: string): Observable<Product> {
    const url = `${this.apiUrl}/products/find/${productId}`;
    return this.http
      .get<Product>(url, { headers: this.getHeaders(token) })
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtiene todos los productos
   */
  getAllProducts(): Observable<Product[]> {
    const url = `${this.apiUrl}/products`;

    return this.http.get<Product[]>(url, { headers: this.getHeaders() }).pipe(
      tap((products) => {
        // Extraer categorías únicas de los productos
        const categories = products
          .map((product) => product.categories || [])
          .flat();
        this.categories = Array.from(new Set(categories));
        this.categoriesSubject.next(this.categories);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Obtiene las categorías disponibles
   */
  getCategories(): Observable<string[]> {
    return this.categoriesSubject.asObservable();
  }

  /**
   * Establece las categorías manualmente
   */
  setCategories(categories: string[]): void {
    this.categories = categories;
    this.categoriesSubject.next(this.categories);
  }

  /**
   * Obtiene productos por categoría
   */
  getAllProductsByCategory(
    token: string,
    category: string
  ): Observable<Product[]> {
    const url = `${this.apiUrl}/products?category=${category}`;
    return this.http
      .get<Product[]>(url, { headers: this.getHeaders(token) })
      .pipe(catchError(this.handleError));
  }

  /**
   * Elimina un producto
   */
  deleteProduct(id: string, token: string): Observable<any> {
    const url = `${this.apiUrl}/products/${id}`;
    return this.http
      .delete(url, { headers: this.getHeaders(token) })
      .pipe(catchError(this.handleError));
  }

  /**
   * Crea un nuevo producto
   */
  createProduct(product: Product, token: string): Observable<ProductResponse> {
    const url = `${this.apiUrl}/products`;
    return this.http
      .post<ProductResponse>(url, product, { headers: this.getHeaders(token) })
      .pipe(catchError(this.handleError));
  }

  /**
   * Actualiza un producto existente
   */
  updateProduct(product: Product, token: string): Observable<ProductResponse> {
    const url = `${this.apiUrl}/products/${product._id}`;
    return this.http
      .put<ProductResponse>(url, product, { headers: this.getHeaders(token) })
      .pipe(catchError(this.handleError));
  }

  /**
   * Agrega un producto al carrito
   */
  agregarCarrito(producto: Product): void {
    const existingProduct = this.productCarrito.find(
      (p) => p._id === producto._id
    );

    if (existingProduct) {
      // Si existe, incrementar la cantidad
      existingProduct.quantity++;
    } else {
      // Si no existe, añadirlo con cantidad 1
      const productoConCantidad = { ...producto, quantity: 1 };
      this.productCarrito.push(productoConCantidad);
    }

    // Actualizar el localStorage
    localStorage.setItem('carrito', JSON.stringify(this.productCarrito));
    this.datosCompartidos.setProductCarrito([...this.productCarrito]);

    this.actualizarTotal();
  }

  /**
   * Actualiza el total del carrito
   */
  actualizarTotal(): void {
    this.total = this.productCarrito.reduce(
      (total, producto) => total + producto.price * producto.quantity,
      0
    );
  }

  /**
   * Obtiene los productos en el carrito
   */
  getProductCarrito(): Product[] {
    return [...this.productCarrito];
  }

  /**
   * Obtiene el total del carrito
   */
  getTotalCarrito(): number {
    return this.total;
  }

  /**
   * Elimina un producto del carrito
   */
  removeFromCart(productId: string): void {
    this.productCarrito = this.productCarrito.filter(
      (p) => p._id !== productId
    );
    this.actualizarTotal();
  }

  /**
   * Vacía el carrito de compras
   */
  clearCart(): void {
    this.productCarrito = [];
    this.total = 0;
  }
}
