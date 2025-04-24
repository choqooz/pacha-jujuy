import { Injectable } from '@angular/core';
import { Product } from '../models/product';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DatosCompartidosService {
  private productCarrito: Array<Product> = [];

  // BehaviorSubject para cambios reactivos
  private cartItemsSubject = new BehaviorSubject<Product[]>([]);

  // Observable público al que los componentes pueden suscribirse
  public cartItems$: Observable<Product[]> =
    this.cartItemsSubject.asObservable();

  constructor() {
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
    localStorage.setItem('cartProducts', JSON.stringify(products));
    // Notificar a los observadores
    this.cartItemsSubject.next([...products]);
  }

  addProductToCart(product: Product): void {
    const existingProductIndex = this.productCarrito.findIndex(
      (p) => p._id === product._id
    );

    if (existingProductIndex >= 0) {
      this.productCarrito[existingProductIndex].quantity +=
        product.quantity || 1;
    } else {
      this.productCarrito.push({ ...product });
    }

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

  getTotalItems(): number {
    return this.productCarrito.reduce(
      (total, item) => total + (item.quantity || 1),
      0
    );
  }
}
