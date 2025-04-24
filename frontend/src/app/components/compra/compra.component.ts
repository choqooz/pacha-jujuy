import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ICreateOrderRequest, IPayPalConfig, ItemCategory } from 'ngx-paypal';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Cart } from 'src/app/models/cart';
import { Order } from 'src/app/models/order';
import { CartService } from 'src/app/services/cart.service';
import { DatosCompartidosService } from 'src/app/services/datos-compartidos.service';
import { OrderService } from 'src/app/services/order.service';
import { UserService } from 'src/app/services/user.service';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-compra',
  templateUrl: './compra.component.html',
  styleUrls: ['./compra.component.css'],
})
export class CompraComponent implements OnInit, OnDestroy {
  token: string;
  cart: Cart = new Cart();
  payPalConfig?: IPayPalConfig;
  addressForm: FormGroup;
  direccionConfirmada: boolean = false;
  isProcessingPayment: boolean = false;
  private subscriptions = new Subscription();

  constructor(
    private cartService: CartService,
    private userService: UserService,
    private orderService: OrderService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private datosCompartidos: DatosCompartidosService,
    private errorHandler: ErrorHandlerService,
    private fb: FormBuilder
  ) {
    this.token = this.userService.getToken();
    this.addressForm = this.fb.group({
      address: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.clearCartData();
    this.initConfig();

    const cartSub = this.activatedRoute.params
      .pipe(
        switchMap((params) => {
          if (!params['id']) {
            this.router.navigate(['/carrito']);
            return [];
          }
          return this.cartService.getCart(params['id'], this.token);
        })
      )
      .subscribe({
        next: (result) => {
          if (result) {
            Object.assign(this.cart, result);
            this.datosCompartidos.setProductCarrito(this.cart.products);
          }
        },
        error: (error) => {
          this.errorHandler.handleError(
            'No se pudo cargar la información del carrito',
            'Error'
          );
          this.router.navigate(['/carrito']);
        },
      });

    this.subscriptions.add(cartSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private initConfig(): void {
    this.payPalConfig = {
      currency: 'USD',
      clientId: environment.clientId,
      createOrderOnClient: () => this.createPayPalOrder(),
      advanced: {
        commit: 'true',
      },
      style: {
        label: 'paypal',
        layout: 'vertical',
      },
      onApprove: (data, actions) => this.onPayPalApprove(data, actions),
      onClientAuthorization: (data) => this.onPayPalClientAuthorization(data),
      onCancel: () => this.onPayPalCancel(),
      onError: (err) => this.onPayPalError(err),
    };
  }

  private createPayPalOrder(): ICreateOrderRequest {
    const totalAmount = this.cart.totalAmount.toFixed(2);
    const items = [
      {
        name: 'Total de la compra',
        quantity: '1',
        category: 'DIGITAL_GOODS' as ItemCategory,
        unit_amount: {
          currency_code: 'USD',
          value: totalAmount,
        },
      },
    ];

    return {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: totalAmount,
            breakdown: {
              item_total: {
                currency_code: 'USD',
                value: totalAmount,
              },
            },
          },
          items: items,
        },
      ],
    };
  }

  private onPayPalApprove(data: any, actions: any): Promise<any> {
    this.errorHandler.handleInfo('Procesando pago...', 'PayPal');
    this.isProcessingPayment = true;
    return actions.order.get().then((details: any) => {
      const orderData: Order = this.createOrderData('APPROVED');
      orderData.amount = parseFloat(details.purchase_units[0].amount.value);
      return this.orderService.createOrder(orderData, this.token).toPromise();
    });
  }

  private onPayPalClientAuthorization(data: any): void {
    this.errorHandler.handleSuccess(
      `¡Pago completado! Monto: $${data.purchase_units[0].amount.value}`,
      'Transacción exitosa'
    );
    this.clearCartData();

    setTimeout(() => {
      this.router.navigate(['/']);
    }, 3000);
  }

  private onPayPalCancel(): void {
    this.isProcessingPayment = false;
    this.errorHandler.handleWarning('Has cancelado el pago', 'Pago cancelado');
  }

  private onPayPalError(err: any): void {
    this.handlePaymentError(err);
  }

  confirmarDireccion(): void {
    if (!this.token) {
      this.errorHandler.handleError(
        'No estás logueado',
        'Ha ocurrido un error'
      );
      return;
    }
    if (this.addressForm.invalid) {
      this.errorHandler.handleError(
        'Por favor, ingresa la dirección',
        'Campo requerido'
      );
      return;
    }
    this.direccionConfirmada = true;
    this.errorHandler.handleSuccess(
      'Dirección confirmada',
      'Continúe con el pago'
    );
  }

  comprarCarrito(): void {
    if (!this.validatePaymentPreconditions()) {
      return;
    }

    this.isProcessingPayment = true;
    const orderData: Order = this.createOrderData('PENDING');

    this.processMercadoPagoPayment(orderData);
  }

  iniciarPagoPayPal(): void {
    if (!this.direccionConfirmada) {
      this.errorHandler.handleError(
        'Por favor confirma la dirección primero',
        'Dirección requerida'
      );
      return;
    }

    if (!this.validatePaymentPreconditions()) {
      return;
    }

    this.isProcessingPayment = true;
    this.errorHandler.handleInfo('Procesando pago con PayPal...', 'PayPal');
  }

  iniciarPagoMercadoPago(): void {
    this.comprarCarrito();
  }

  cancelarOrden(): void {
    this.cartService.deleteCart(this.cart._id, this.token).subscribe({
      next: (result) => {
        this.errorHandler.handleInfo('Orden cancelada', 'Volviendo al inicio');

        this.clearCartData();

        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 2000);
      },
      error: (error) => {
        this.errorHandler.handleError(
          'Error al cancelar la orden',
          'Ha ocurrido un problema'
        );
      },
    });
  }

  // Helper methods
  private validatePaymentPreconditions(): boolean {
    if (!this.token) {
      this.errorHandler.handleError(
        'No hay sesión activa',
        'Error de autenticación'
      );
      this.router.navigate(['/login']);
      return false;
    }

    if (this.isProcessingPayment) {
      this.errorHandler.handleInfo(
        'Procesando pago anterior, por favor espere',
        'Procesando'
      );
      return false;
    }

    if (!this.direccionConfirmada) {
      this.errorHandler.handleError(
        'Por favor confirma la dirección primero',
        'Dirección requerida'
      );
      return false;
    }

    return true;
  }

  private createOrderData(status: string): Order {
    return {
      userId: this.cart.user._id as string,
      products: this.cart.products,
      amount: this.cart.totalAmount,
      address: this.addressForm.get('address')?.value,
      status: status,
    };
  }

  private processMercadoPagoPayment(orderData: Order): void {
    const paymentSub = this.orderService
      .createOrder(orderData, this.token)
      .pipe(
        switchMap((orderResult) =>
          this.cartService.buyCart(this.cart, this.token)
        )
      )
      .subscribe({
        next: (result) => {
          this.clearCartData();
          window.location.href = result.init_point;
        },
        error: (error) => this.handlePaymentError(error),
      });

    this.subscriptions.add(paymentSub);
  }

  private handlePaymentError(error: any): void {
    this.isProcessingPayment = false;

    if (error.status === 401) {
      this.errorHandler.handleError(
        'Sesión expirada. Por favor, inicie sesión nuevamente',
        'Error de autenticación'
      );
      this.userService.logout();
      this.router.navigate(['/login']);
    } else {
      this.errorHandler.handleError(
        'Error al procesar la compra',
        'Ha ocurrido un problema'
      );
    }
  }
  private clearCartData(): void {
    this.cart = new Cart();

    this.datosCompartidos.clearProductCart();

    // Reset payment processing flags
    this.isProcessingPayment = false;
    this.direccionConfirmada = false;
    this.addressForm.reset();
  }
}
