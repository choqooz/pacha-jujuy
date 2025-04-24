import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';
import { Product } from 'src/app/models/product';
import { ProductService } from 'src/app/services/product.service';
import { UserService } from 'src/app/services/user.service';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-info-product',
  templateUrl: './info-product.component.html',
  styleUrls: ['./info-product.component.css'],
})
export class InfoProductComponent implements OnInit, OnDestroy {
  producto: Product = new Product();
  token: string;
  isLoading: boolean = false;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private productService: ProductService,
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.token = this.userService.getToken();
  }

  ngOnInit(): void {
    const routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        window.scrollTo(0, 0);
      }
    });
    this.subscriptions.add(routerSub);

    const paramsSub = this.activatedRoute.params.subscribe((params) => {
      if (params['id']) {
        this.loadProduct(params['id']);
      }
    });
    this.subscriptions.add(paramsSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  addToCart(): void {
    try {
      this.productService.agregarCarrito(this.producto);
      this.toastr.success(
        `${this.producto.title} añadido al carrito`,
        'Producto agregado'
      );
    } catch (error) {
      this.toastr.error('No se pudo agregar el producto al carrito', 'Error');
    }
  }

  private loadProduct(id: string): void {
    this.isLoading = true;
    const productSub = this.productService
      .getProductById(id, this.token)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe(
        (result: Product) => {
          Object.assign(this.producto, result);
        },
        (error) => {
          this.toastr.error(
            'No se pudo cargar la información del producto',
            'Error'
          );
          this.router.navigate(['/products']);
        }
      );
    this.subscriptions.add(productSub);
  }
}
