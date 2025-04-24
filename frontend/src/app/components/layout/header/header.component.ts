import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil, finalize } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Cart } from 'src/app/models/cart';
import { Product } from 'src/app/models/product';
import { User } from 'src/app/models/user';

import { UserService } from 'src/app/services/user.service';
import { ProductService } from 'src/app/services/product.service';
import { CartService } from 'src/app/services/cart.service';
import { DatosCompartidosService } from 'src/app/services/datos-compartidos.service';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { CustomValidators } from 'src/app/core/validators/custom-validators';

declare var bootstrap: any;

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

  // Formulario de registro
  registerForm!: FormGroup;
  registerPasswordVisible: boolean = false;
  registerConfirmPasswordVisible: boolean = false;
  isRegisterSubmitting: boolean = false;

  // Formulario de login
  loginForm!: FormGroup;
  loginPasswordVisible: boolean = false;
  isLoginSubmitting: boolean = false;

  // Modal references
  private loginModal: any;
  private registerModal: any;

  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private productService: ProductService,
    private cartService: CartService,
    private router: Router,
    private datosCompartidos: DatosCompartidosService,
    private toastService: ToastrService,
    private fb: FormBuilder,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.inicializarDatos();
    this.initForms();
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

  private initForms(): void {
    // Inicializar formulario de registro
    this.registerForm = this.fb.group(
      {
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            CustomValidators.strongPassword(),
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      {
        validators: CustomValidators.mustMatch('password', 'confirmPassword'),
      }
    );

    // Inicializar formulario de login
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });
  }

  // Getters para acceder fácilmente a los campos de los formularios
  get rf() {
    return this.registerForm.controls;
  }

  get lf() {
    return this.loginForm.controls;
  }

  toggleRegisterPasswordVisibility(
    field: 'password' | 'confirmPassword'
  ): void {
    if (field === 'password') {
      this.registerPasswordVisible = !this.registerPasswordVisible;
    } else {
      this.registerConfirmPasswordVisible =
        !this.registerConfirmPasswordVisible;
    }
  }

  onRegisterSubmit(): void {
    if (this.registerForm.invalid) {
      this.toastService.warning(
        'Por favor corrija los errores en el formulario',
        'Formulario Incompleto'
      );
      return;
    }

    this.isRegisterSubmitting = true;

    const user = {
      username: this.rf['username'].value,
      email: this.rf['email'].value,
      password: this.rf['password'].value,
    };

    this.userService
      .createUser(user)
      .pipe(finalize(() => (this.isRegisterSubmitting = false)))
      .subscribe({
        next: (result) => {
          this.toastService.success(
            `Bienvenid@ ${user.username}`,
            'Registro Exitoso',
            { timeOut: 2500 }
          );
          this.closeModals();
          this.loginAfterRegister(user.username, user.password);
        },
        error: (error) => this.handleRegistrationError(error),
      });
  }

  onLoginSubmit(): void {
    if (this.loginForm.invalid) {
      this.toastService.warning(
        'Por favor corrija los errores en el formulario',
        'Formulario Incompleto'
      );
      return;
    }

    this.isLoginSubmitting = true;

    const credentials = {
      username: this.lf['username'].value,
      password: this.lf['password'].value,
    };

    this.userService
      .loginUser(credentials)
      .pipe(finalize(() => (this.isLoginSubmitting = false)))
      .subscribe({
        next: (response) => {
          this.userService.handleLoginSuccess(response);
          this.toastService.success(
            `Bienvenid@ ${credentials.username}`,
            'Inicio de sesión exitoso'
          );
          this.closeModals();
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.toastService.error(
            'Credenciales incorrectas. Por favor, inténtelo de nuevo.',
            'Error de inicio de sesión'
          );
        },
      });
  }

  private loginAfterRegister(username: string, password: string): void {
    this.userService.loginUser({ username, password }).subscribe({
      next: (response) => {
        this.userService.handleLoginSuccess(response);
        this.router.navigate(['/']);
      },
      error: (_) => {
        this.toastService.info(
          'Por favor inicie sesión con sus nuevas credenciales',
          'Información'
        );
      },
    });
  }

  private handleRegistrationError(error: any): void {
    if (error.error?.keyPattern?.email) {
      this.toastService.error('Email ya registrado', 'Error de Registro');
      this.rf['email'].setErrors({ alreadyExists: true });
    } else if (error.error?.keyPattern?.username) {
      this.toastService.error(
        'Nombre de usuario ya registrado',
        'Error de Registro'
      );
      this.rf['username'].setErrors({ alreadyExists: true });
    } else {
      this.errorHandler.handleError(
        'Error al registrar el usuario',
        'Error de Registro'
      );
    }
  }

  private closeModals(): void {
    // Cerrar todos los modales Bootstrap abiertos
    const modals = document.querySelectorAll(
      '.modal'
    ) as NodeListOf<HTMLElement>;
    modals.forEach((modal) => {
      const bsModal = bootstrap.Modal.getInstance(modal);
      if (bsModal) {
        bsModal.hide();
      }
    });

    // Reiniciar formularios
    this.registerForm.reset();
    this.loginForm.reset();
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
          this.isAdmin = this.checkIsAdmin();
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
      // Ahora en lugar de navegar a /login, abrimos el modal de login
      const loginModalEl = document.getElementById('loginModal');
      if (loginModalEl) {
        const loginModal = new bootstrap.Modal(loginModalEl);
        loginModal.show();
      }
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
