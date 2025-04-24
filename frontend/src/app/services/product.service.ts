import { Injectable } from '@angular/core';
import { Observable, Subject, catchError, tap, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Product, ProductResponse } from '../models/product';
import { DatosCompartidosService } from './datos-compartidos.service';
import { HttpUtilService } from './http-util.service';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  productCarrito: Product[] = [];
  total: number = 0;
  private categories: string[] = [];
  private categoriesSubject: Subject<string[]> = new Subject<string[]>();

  constructor(
    private http: HttpClient,
    private datosCompartidos: DatosCompartidosService,
    private httpUtil: HttpUtilService,
    private errorHandler: ErrorHandlerService
  ) {}

  /**
   * Obtiene un producto por su ID
   */
  getProductById(productId: string, token: string): Observable<Product> {
    const url = `${this.httpUtil.getApiUrl()}/products/find/${productId}`;
    return this.http
      .get<Product>(url, { headers: this.httpUtil.getHeaders(token) })
      .pipe(
        catchError((error) =>
          this.errorHandler.handleHttpError(error, 'Error al obtener producto')
        )
      );
  }

  /**
   * Obtiene todos los productos
   */
  getAllProducts(): Observable<Product[]> {
    const url = `${this.httpUtil.getApiUrl()}/products`;

    return this.http
      .get<Product[]>(url, { headers: this.httpUtil.getHeaders() })
      .pipe(
        tap((products) => {
          // Extraer categorías únicas de los productos
          const categories = products
            .map((product) => product.categories || [])
            .flat();
          this.categories = Array.from(new Set(categories));
          this.categoriesSubject.next(this.categories);
        }),
        catchError((error) =>
          this.errorHandler.handleHttpError(error, 'Error al obtener productos')
        )
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
    const url = `${this.httpUtil.getApiUrl()}/products?category=${category}`;
    return this.http
      .get<Product[]>(url, { headers: this.httpUtil.getHeaders(token) })
      .pipe(
        catchError((error) =>
          this.errorHandler.handleHttpError(
            error,
            'Error al obtener productos por categoría'
          )
        )
      );
  }

  /**
   * Elimina un producto
   */
  deleteProduct(id: string, token: string): Observable<any> {
    const url = `${this.httpUtil.getApiUrl()}/products/${id}`;
    return this.http
      .delete(url, { headers: this.httpUtil.getHeaders(token) })
      .pipe(
        catchError((error) =>
          this.errorHandler.handleHttpError(error, 'Error al eliminar producto')
        )
      );
  }

  /**
   * Crea un nuevo producto
   */
  createProduct(product: Product, token: string): Observable<ProductResponse> {
    const url = `${this.httpUtil.getApiUrl()}/products`;
    return this.http
      .post<ProductResponse>(url, product, {
        headers: this.httpUtil.getHeaders(token),
      })
      .pipe(
        catchError((error) =>
          this.errorHandler.handleHttpError(error, 'Error al crear producto')
        )
      );
  }

  /**
   * Actualiza un producto existente
   */
  updateProduct(product: Product, token: string): Observable<ProductResponse> {
    const url = `${this.httpUtil.getApiUrl()}/products/${product._id}`;
    return this.http
      .put<ProductResponse>(url, product, {
        headers: this.httpUtil.getHeaders(token),
      })
      .pipe(
        catchError((error) =>
          this.errorHandler.handleHttpError(
            error,
            'Error al actualizar producto'
          )
        )
      );
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
