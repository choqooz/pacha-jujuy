import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { Product } from '../../models/product';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
})
export class ProductsComponent implements OnInit {
  productsCarrito: Array<Product> = [];
  products: Product[] = [];
  token: string = this.userService.getToken();
  isLoading: boolean = false;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private userService: UserService,
    private router: Router,
    private toastService: ToastrService
  ) {}

  ngOnInit() {
    // Iniciar la carga
    window.scrollTo(0, 0);
    this.loadProducts();
  }

  private loadProducts() {
    this.isLoading = true;

    this.route.queryParams.subscribe((params) => {
      const category = params['category'];

      if (category && category !== 'todos') {
        this.productService
          .getAllProductsByCategory(this.token, category)
          .pipe(finalize(() => (this.isLoading = false)))
          .subscribe(
            (response) => {
              this.products = response;
            },
            (error) => {
              console.error('Error al cargar productos por categoría:', error);
              this.toastService.error('Error al cargar los productos', 'Error');
            }
          );
      } else {
        this.productService
          .getAllProducts()
          .pipe(finalize(() => (this.isLoading = false)))
          .subscribe(
            (response) => {
              this.products = response;
            },
            (error) => {
              console.error('Error al cargar todos los productos:', error);
              this.toastService.error('Error al cargar los productos', 'Error');
            }
          );
      }
    });
  }

  agregarCar(product: Product) {
    this.productService.agregarCarrito(product);
    this.toastService.success(
      `${product.title} añadido al carrito`,
      'Producto agregado'
    );
  }

  infoProd(prod: Product) {
    this.router.navigate(['infoprod', prod._id]);
  }
}
