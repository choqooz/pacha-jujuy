import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil, finalize } from 'rxjs';

import { Cart } from 'src/app/models/cart';
import { Product } from 'src/app/models/product';

import { UserService } from 'src/app/service/user.service';
import { ProductService } from 'src/app/service/product.service';
import { CartService } from 'src/app/service/cart.service';
import { DatosCompartidosService } from 'src/app/service/datos-compartidos.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  // Productos y carrito
  productCarrito: Array<Product> = [];
  total: number = 0;

  // Usuario
  isLoggedIn: boolean = false;
  isAdmin: boolean = false;
  username: string = '';
  modoAdmin: boolean = false;

  // Búsqueda y categorías
  productos: Array<Product> = [];
  productosFiltrados: Array<Product> = [];
  categories: string[] = [];
  searchTermino: string = '';

  // Estado de carga
  isLoading: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private productService: ProductService,
    private cartService: CartService,
    private router: Router,
    private datosCompartidos: DatosCompartidosService,
    private toastService: ToastrService
  ) {}

  ngOnInit(): void {
    this.inicializarDatos();
    this.suscribirseACambiosDeEstado();
    this.cargarProductosYCategorias();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private inicializarDatos(): void {
    // Inicializar carrito
    this.productCarrito = this.datosCompartidos.getProductCarrito();
    this.total = this.productService.getTotalCarrito();

    // Inicializar estado de autenticación
    this.isLoggedIn = this.userService.isLoggedIn();
    this.isAdmin = this.checkIsAdmin();
    this.username = this.userService.getUsername() || '';
  }

  private checkIsAdmin(): boolean {
    const isAdminStr = sessionStorage.getItem('isAdmin');
    return isAdminStr === 'true';
  }

  private suscribirseACambiosDeEstado(): void {
    this.userService.login$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isLoggedIn: boolean) => {
        this.isLoggedIn = isLoggedIn;
        if (isLoggedIn) {
          this.username = this.userService.getUsername() || '';
          this.isAdmin = this.checkIsAdmin(); // Usar el nuevo método
        } else {
          this.isAdmin = false;
          this.modoAdmin = false;
        }
      });

    if ('admin$' in this.userService) {
      (this.userService as any).admin$
        .pipe(takeUntil(this.destroy$))
        .subscribe((isAdmin: boolean) => {
          this.isAdmin = isAdmin;
        });
    }
    // Suscribirse a cambios en el carrito
    this.datosCompartidos.cartItems$
      .pipe(takeUntil(this.destroy$))
      .subscribe((cart) => {
        this.productCarrito = cart;
        this.actualizarCarrito();
      });
  }

  obtenerProductCarrito(): void {
    this.productCarrito = this.datosCompartidos.getProductCarrito();
    this.total = this.productService.getTotalCarrito();
  }

  private cargarProductosYCategorias(): void {
    this.isLoading = true;

    this.productService
      .getAllProducts()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (productos) => {
          this.productos = productos;
          this.cargarCategorias();
        },
        error: (err) => {
          this.toastService.error(
            'No se pudieron cargar los productos',
            'Error'
          );
        },
      });
  }

  private cargarCategorias(): void {
    this.productService
      .getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => (this.categories = categories),
        error: (err) => console.error('Error al cargar categorías', err),
      });
  }

  navigateToCategory(event: any): void {
    const category = event.target.value;
    this.router.navigate(['/productos'], {
      queryParams: { category },
    });
  }

  infoProd(producto: Product): void {
    this.router.navigate(['infoprod', producto._id]);
  }

  removeFromCart(producto: Product): void {
    const existingProduct = this.productCarrito.find(
      (p) => p._id === producto._id
    );

    if (!existingProduct) return;

    if (existingProduct.quantity > 1) {
      existingProduct.quantity--;
    } else {
      const index = this.productCarrito.findIndex(
        (p) => p._id === producto._id
      );
      if (index >= 0) {
        this.productCarrito.splice(index, 1);
      }
    }

    this.datosCompartidos.setProductCarrito([...this.productCarrito]);

    if (existingProduct.quantity <= 1) {
      this.productService.removeFromCart(producto._id);
    }

    this.actualizarCarrito();
    this.toastService.info('Producto eliminado del carrito', 'Información');
  }

  actualizarCarrito(): void {
    this.productService.actualizarTotal();
    this.total = this.productService.getTotalCarrito();
  }

  crearCarrito(): void {
    if (!this.productCarrito.length) {
      this.toastService.error('No existen productos en el carrito', 'Error');
      return;
    }

    if (!this.isLoggedIn) {
      this.toastService.error(
        'Debe iniciar sesión para crear un carrito',
        'Error'
      );
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading = true;

    const cart = new Cart();
    cart.products = this.productCarrito;

    const user = this.userService.getUser();
    if (!user) {
      this.toastService.error(
        'No se pudo obtener información del usuario',
        'Error'
      );
      this.isLoading = false;
      return;
    }
    cart.user = user;

    cart.totalAmount = this.total;

    this.cartService
      .createCart(cart)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (result: any) => {
          const createdCart = result.data || result;

          if (createdCart._id) {
            this.router.navigate(['compra', createdCart._id]);
          } else {
            this.toastService.error('Error al crear el carrito', 'Error');
          }
        },
        error: (err) => {
          this.toastService.error('No se pudo crear el carrito', 'Error');
        },
      });
  }

  buscarProductos(): void {
    if (!this.searchTermino) {
      this.productosFiltrados = [];
      return;
    }

    this.productosFiltrados = this.productos.filter((item) =>
      item.title.toLowerCase().includes(this.searchTermino.toLowerCase())
    );
  }

  borrarFiltro(): void {
    this.searchTermino = '';
    this.productosFiltrados = [];
  }

  toggleModoAdmin(): void {
    this.modoAdmin = !this.modoAdmin;
  }

  logout(): void {
    this.datosCompartidos.clearProductCart();
    this.userService.logout();
    this.toastService.info('Sesión cerrada correctamente', 'Información');
    this.router.navigate(['/']);
  }
}
