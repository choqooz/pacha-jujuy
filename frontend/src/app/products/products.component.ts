import { Component, OnInit } from '@angular/core';
import { ProductService } from '../service/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../service/user.service';
import { Product } from '../models/product';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
})
export class ProductsComponent implements OnInit {
  productsCarrito: Array<Product> = [];
  products!: any[];
  token: string = this.userService.getToken();
  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private userService: UserService,
    private router: Router,
    private toastService: ToastrService
  ) {}
  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const category = params['category'];
      if (category && category !== 'todos') {
        this.productService
          .getAllProductsByCategory(this.token, category)
          .subscribe(
            (response) => {
              this.products = response;
            },
            (_error) => {}
          );
      } else {
        this.productService.getAllProducts().subscribe(
          (response) => {
            this.products = response;
          },
          (_error) => {}
        );
      }
    });

    window.scrollTo(0, 0);
  }

  agregarCar(product: Product) {
    this.productService.agregarCarrito(product);
    this.toastService.success(
      `${product.title} añadido al carrito`,
      'Producto agregado'
    );
  }
  public infoProd(prod: Product) {
    this.router.navigate(['infoprod', prod._id]);
  }
}
