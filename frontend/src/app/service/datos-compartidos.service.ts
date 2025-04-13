import { Injectable } from '@angular/core';
import { Product } from '../models/product';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DatosCompartidosService {
  // Mantener la propiedad privada para compatibilidad
  private productCarrito: Array<Product> = [];

  // Añadir BehaviorSubject para cambios reactivos
  private cartItemsSubject = new BehaviorSubject<Product[]>([]);

  // Observable público al que los componentes pueden suscribirse
  public cartItems$: Observable<Product[]> =
    this.cartItemsSubject.asObservable();

  constructor() {
    // Initialize from localStorage if available
    const savedCart = localStorage.getItem('cartProducts');
    if (savedCart) {
      try {
        this.productCarrito = JSON.parse(savedCart);
        // Emitir el valor inicial al BehaviorSubject
        this.cartItemsSubject.next(this.productCarrito);
      } catch (e) {
        console.error('Error parsing saved cart', e);
        localStorage.removeItem('cartProducts');
      }
    }
  }

  getProductCarrito(): Array<Product> {
    return this.productCarrito;
  }

  setProductCarrito(products: Array<Product>): void {
    this.productCarrito = products;
    // Save to localStorage for persistence
    localStorage.setItem('cartProducts', JSON.stringify(products));
    // Notificar a los observadores
    this.cartItemsSubject.next([...products]);
  }

  addProductToCart(product: Product): void {
    // Check if product already exists in cart
    const existingProductIndex = this.productCarrito.findIndex(
      (p) => p._id === product._id
    );

    if (existingProductIndex >= 0) {
      // Update quantity if product exists
      this.productCarrito[existingProductIndex].quantity +=
        product.quantity || 1;
    } else {
      // Add new product if it doesn't exist
      this.productCarrito.push({ ...product });
    }

    // Update localStorage
    localStorage.setItem('cartProducts', JSON.stringify(this.productCarrito));

    // Notificar a los observadores sobre el cambio
    this.cartItemsSubject.next([...this.productCarrito]);
  }

  clearProductCart(): void {
    this.productCarrito = [];
    localStorage.removeItem('cartProducts');
    // Notificar a los observadores que el carrito está vacío
    this.cartItemsSubject.next([]);
  }

  // Método opcional para obtener la cantidad total de productos
  getTotalItems(): number {
    return this.productCarrito.reduce(
      (total, item) => total + (item.quantity || 1),
      0
    );
  }
}
