import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { Order } from 'src/app/models/order';
import { OrderService } from 'src/app/service/order.service';
import { UserService } from 'src/app/service/user.service';
import * as html2pdf from 'html2pdf.js';
import { ToastrService } from 'ngx-toastr';
import { Subscription, finalize, catchError, EMPTY } from 'rxjs';
import { User } from 'src/app/models/user';
import { OrderWithUsername } from 'src/app/models/types';

const USER_UNKNOWN = 'Usuario desconocido';
const PDF_OPTIONS = {
  margin: [0, 0, 0, 0],
  filename: 'tabla_ordenes.pdf',
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: { scale: 4 },
  jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
};

@Component({
  selector: 'app-order-table',
  templateUrl: './order-table.component.html',
  styleUrls: ['./order-table.component.css'],
})
export class OrderTableComponent implements OnInit, OnDestroy {
  @ViewChild('orderTable') orderTable!: ElementRef;

  token: string;
  users: User[] = [];
  orders: OrderWithUsername[] = [];
  usernameFilter: string = '';
  startDateFilter: string = '';
  endDateFilter: string = '';
  filteredOrders: OrderWithUsername[] = [];
  isLoading: boolean = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private orderService: OrderService,
    private userService: UserService,
    private router: Router,
    private toastService: ToastrService
  ) {
    this.token = this.userService.getToken();
  }

  ngOnInit(): void {
    this.getUsers();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  /**
   * Obtiene todos los usuarios y luego carga las órdenes
   */
  getUsers(): void {
    this.isLoading = true;
    const userSub = this.userService
      .getAllUser(this.token)
      .pipe(
        catchError((error) => {
          this.handleError(error, 'Error al cargar usuarios');
          return EMPTY;
        }),
        finalize(() => (this.isLoading = false))
      )
      .subscribe((users) => {
        this.users = users;
        this.getAllOrders();
      });

    this.subscriptions.push(userSub);
  }

  /**
   * Obtiene todas las órdenes filtradas
   */
  getAllOrders(): void {
    this.isLoading = true;
    const orderSub = this.orderService
      .getAllOrdersFilter(this.token)
      .pipe(
        catchError((error) => {
          this.handleError(error, 'Ha ocurrido un error al cargar órdenes');
          setTimeout(() => this.router.navigate(['home']), 3000);
          return EMPTY;
        }),
        finalize(() => (this.isLoading = false))
      )
      .subscribe((response) => {
        if (Array.isArray(response) && response.length > 0) {
          this.orders = this.mapOrdersWithUsername(response);
          this.filteredOrders = [...this.orders];
        } else {
          this.orders = [];
          this.filteredOrders = [];
          this.toastService.info('No hay órdenes disponibles');
        }
      });

    this.subscriptions.push(orderSub);
  }

  /**
   * Maneja cambio en selección de usuario
   */
  onSelectUser(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const userId = select.value;

    if (userId === '') {
      this.getAllOrders();
    } else {
      this.getOrdersByUserId(userId);
    }
  }

  /**
   * Obtiene órdenes de un usuario específico
   */
  getOrdersByUserId(userId: string): void {
    this.isLoading = true;
    const orderSub = this.orderService
      .getOrderByUserId(userId, this.token)
      .pipe(
        catchError((error) => {
          this.handleError(error, 'Error al cargar órdenes del usuario');
          this.orders = [];
          this.filteredOrders = [];
          return EMPTY;
        }),
        finalize(() => (this.isLoading = false))
      )
      .subscribe((response) => {
        if (Array.isArray(response) && response.length > 0) {
          this.orders = this.mapOrdersWithUsername(response);
          this.filteredOrders = [...this.orders];
        } else {
          this.orders = [];
          this.filteredOrders = [];
          this.toastService.warning(
            'No se encontraron órdenes para este usuario'
          );
        }
      });

    this.subscriptions.push(orderSub);
  }

  generarPDF(): void {
    if (!this.orderTable?.nativeElement) {
      this.toastService.warning('No se encontró la tabla para generar el PDF');
      return;
    }

    html2pdf().from(this.orderTable.nativeElement).set(PDF_OPTIONS).save();
    this.toastService.success('Generando PDF', 'Por favor espere');
  }

  filterOrders(): void {
    if (!this.orders.length) {
      this.filteredOrders = [];
      return;
    }

    const usernameLower = this.usernameFilter.toLowerCase();

    this.filteredOrders = this.orders.filter((order) => {
      const usernameMatch =
        !usernameLower ||
        (order.username?.toLowerCase().includes(usernameLower) ?? false);

      let dateRangeMatch = true;

      if (this.startDateFilter && this.endDateFilter) {
        const startDate = new Date(this.startDateFilter);
        const endDate = new Date(this.endDateFilter);
        endDate.setHours(23, 59, 59);

        // Asegurar fechas válidas
        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
          const orderDate = order.createdAt
            ? new Date(order.createdAt)
            : new Date();
          dateRangeMatch = orderDate >= startDate && orderDate <= endDate;
        }
      }

      return usernameMatch && dateRangeMatch;
    });
  }

  resetFilters(): void {
    this.usernameFilter = '';
    this.startDateFilter = '';
    this.endDateFilter = '';
    this.filteredOrders = [...this.orders];
    this.toastService.info('Filtros restablecidos');
  }

  private mapOrdersWithUsername(orders: Order[]): OrderWithUsername[] {
    if (!orders || !this.users) return [];

    return orders.map((order) => {
      const user = this.users.find((user) => user._id === order.userId);
      return {
        ...order,
        username: user?.username || USER_UNKNOWN,
      };
    });
  }
  private handleError(error: any, message: string): void {
    const errorMessage = error?.error?.message || error?.message || message;
    this.toastService.error(errorMessage, 'Error');
  }
}
