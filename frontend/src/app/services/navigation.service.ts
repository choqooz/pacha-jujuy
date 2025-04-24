import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  constructor(private router: Router) {}

  /**
   * Navega a la página de inicio
   */
  goToHome(): Promise<boolean> {
    return this.router.navigate(['home']);
  }

  /**
   * Navega a la página de inicio de sesión
   */
  goToLogin(): Promise<boolean> {
    return this.router.navigate(['login']);
  }

  /**
   * Navega a la página de registro
   */
  goToRegister(): Promise<boolean> {
    return this.router.navigate(['register']);
  }

  /**
   * Navega a la página de administración de productos
   */
  goToProductManagement(): Promise<boolean> {
    return this.router.navigate(['tproducts']);
  }

  /**
   * Navega a la página de edición de un producto
   * @param productId ID del producto a editar (0 para nuevo producto)
   */
  goToProductForm(productId: string): Promise<boolean> {
    return this.router.navigate(['fproducts', productId]);
  }

  /**
   * Navega a la página de detalles de producto
   * @param productId ID del producto a visualizar
   */
  goToProductDetails(productId: string): Promise<boolean> {
    return this.router.navigate(['infoprod', productId]);
  }

  /**
   * Navega a la página de todos los productos
   * @param category Categoría opcional para filtrar productos
   */
  goToProductsPage(category?: string): Promise<boolean> {
    const queryParams = category ? { category } : {};
    return this.router.navigate(['productos'], { queryParams });
  }

  /**
   * Navega a la página del carrito
   */
  goToCart(): Promise<boolean> {
    return this.router.navigate(['carrito']);
  }

  /**
   * Navega a la página de compra con un ID de carrito específico
   * @param cartId ID del carrito para el proceso de compra
   */
  goToCheckout(cartId: string): Promise<boolean> {
    return this.router.navigate(['compra', cartId]);
  }

  /**
   * Navega a la página de órdenes
   */
  goToOrders(): Promise<boolean> {
    return this.router.navigate(['orders']);
  }

  /**
   * Navega a la página de usuarios
   */
  goToUsers(): Promise<boolean> {
    return this.router.navigate(['users']);
  }

  /**
   * Navega a la página de estadísticas
   */
  goToStats(): Promise<boolean> {
    return this.router.navigate(['estadistica']);
  }

  /**
   * Método genérico para navegar a cualquier ruta con parámetros opcionales
   * @param commands Lista de comandos para construir la ruta
   * @param extras Extras de navegación opcionales
   */
  navigateTo(commands: any[], extras?: any): Promise<boolean> {
    return this.router.navigate(commands, extras);
  }
}
