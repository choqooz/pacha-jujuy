import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Product } from 'src/app/models/product';
import { ProductService } from 'src/app/service/product.service';
import { UserService } from 'src/app/service/user.service';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-fproducts',
  templateUrl: './fproducts.component.html',
  styleUrls: ['./fproducts.component.css'],
})
export class FproductsComponent implements OnInit, OnDestroy {
  producto: Product = new Product();
  accion: string = '';
  token: string = this.userService.getToken();
  isLoading: boolean = false;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private productService: ProductService,
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private toastService: ToastrService
  ) {}

  ngOnInit(): void {
    const routeSub = this.activatedRoute.params.subscribe((params) => {
      if (params['id'] == '0') {
        this.accion = 'new';
      } else {
        this.accion = 'update';
        this.cargarProducto(params['id']);
      }
    });
    this.subscriptions.add(routeSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onSubmit(): void {
    if (this.accion === 'new') {
      this.guardarProd();
    } else {
      this.actualizarProd();
    }
  }

  cargarProducto(id: string): void {
    this.isLoading = true;
    const sub = this.productService
      .getProductById(id, this.token)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe(
        (result: any) => {
          Object.assign(this.producto, result);
        },
        (error: any) => {
          this.toastService.error(
            error.error?.message || 'Error al cargar el producto',
            'Error'
          );
          this.router.navigate(['tproducts']);
        }
      );
    this.subscriptions.add(sub);
  }

  guardarProd(): void {
    this.isLoading = true;
    const sub = this.productService
      .createProduct(this.producto, this.token)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe(
        () => {
          this.toastService.success(
            'Producto registrado correctamente',
            this.producto.title
          );
          this.navigateToProducts();
        },
        (error: any) => {
          this.toastService.error(
            error.error?.message || 'No se pudo registrar el producto',
            this.producto.title
          );
        }
      );
    this.subscriptions.add(sub);
  }

  actualizarProd(): void {
    this.isLoading = true;
    const sub = this.productService
      .updateProduct(this.producto, this.token)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe(
        () => {
          this.toastService.success(
            'Producto modificado correctamente',
            this.producto.title
          );
          this.navigateToProducts();
        },
        (error: any) => {
          this.toastService.error(
            error.error?.message || 'No se pudo modificar el producto',
            this.producto.title
          );
        }
      );
    this.subscriptions.add(sub);
  }

  cancelar(): void {
    this.navigateToProducts();
  }

  private navigateToProducts(): void {
    this.router.navigate(['tproducts']);
  }
}
