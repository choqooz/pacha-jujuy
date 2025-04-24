import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription, catchError, finalize, of } from 'rxjs';
import { Cart } from 'src/app/models/cart';
import { User } from 'src/app/models/user';
import { CartService } from 'src/app/services/cart.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-cart-table',
  templateUrl: './cart-table.component.html',
  styleUrls: ['./cart-table.component.css'],
})
export class CartTableComponent implements OnInit, OnDestroy {
  // Arrays y datos
  cartList: Cart[] = [];
  filteredCarts: Cart[] = [];
  users: User[] = [];

  // Filtros
  usernameFilter: string = '';
  selectedUser: string = '';

  // Estado UI
  loading: boolean = false;
  error: string | null = null;

  // Datos de sesión
  token: string = this.userService.getToken();

  // Suscripciones
  private subscriptions: Subscription[] = [];

  constructor(
    private cartService: CartService,
    private userService: UserService,
    private toastService: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getUsers();
    this.getAllCarts();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  getAllCarts(): void {
    this.loading = true;
    this.error = null;

    const subscription = this.cartService
      .getAllCartsFilter(this.token)
      .pipe(
        finalize(() => (this.loading = false)),
        catchError((error) => {
          this.error = 'Error al cargar los carritos';
          this.toastService.error(
            'Ha ocurrido un error al cargar los carritos',
            'Error'
          );
          if (error.status === 401 || error.status === 403) {
            this.router.navigate(['home']);
          }

          return of([] as Cart[]);
        })
      )
      .subscribe((response) => {
        this.cartList = response;
        this.filteredCarts = response;
      });

    this.subscriptions.push(subscription);
  }

  /**
   * Obtiene todos los usuarios
   */
  getUsers(): void {
    const subscription = this.userService
      .getAllUser(this.token)
      .pipe(
        catchError((error) => {
          this.toastService.error('Error al cargar usuarios', 'Error');
          return of([] as User[]);
        })
      )
      .subscribe((result) => {
        this.users = result;
      });

    this.subscriptions.push(subscription);
  }

  /**
   * Filtra carritos por nombre de usuario
   */
  filterCarts(): void {
    if (!this.usernameFilter.trim()) {
      this.filteredCarts = this.cartList;
      return;
    }

    const searchTerm = this.usernameFilter.toLowerCase();

    this.filteredCarts = this.cartList.filter((cart) => {
      if (!cart.user) return false;

      return cart.user.username.toLowerCase().includes(searchTerm);
    });
  }

  /**
   * Filtra carritos por usuario seleccionado
   */
  filterCartsByUser(): void {
    if (!this.selectedUser) {
      this.filteredCarts = this.cartList;
      return;
    }

    this.filteredCarts = this.cartList.filter(
      (cart) => cart.user && cart.user._id === this.selectedUser
    );
  }

  /**
   * Confirma y elimina un carrito
   */
  confirmarEliminar(cart: Cart): void {
    if (
      !confirm(
        `¿Está seguro que desea eliminar el carrito de ${
          cart.user?.username || 'usuario desconocido'
        }?`
      )
    ) {
      return;
    }

    this.eliminarCart(cart);
  }

  /**
   * Elimina un carrito
   */
  eliminarCart(cart: Cart): void {
    this.loading = true;

    const subscription = this.cartService
      .deleteCart(cart._id, this.token)
      .pipe(
        finalize(() => (this.loading = false)),
        catchError((error) => {
          this.toastService.error('Error al eliminar el carrito', 'Error');
          return of(null);
        })
      )
      .subscribe((result) => {
        if (result) {
          this.toastService.success('Carrito eliminado correctamente');
          // Actualizar listas sin necesidad de una nueva solicitud
          this.cartList = this.cartList.filter((c) => c._id !== cart._id);
          this.filteredCarts = this.filteredCarts.filter(
            (c) => c._id !== cart._id
          );
        }
      });

    this.subscriptions.push(subscription);
  }

  /**
   * Restablece todos los filtros
   */
  resetFilters(): void {
    this.usernameFilter = '';
    this.selectedUser = '';
    this.filteredCarts = this.cartList;
  }
}
