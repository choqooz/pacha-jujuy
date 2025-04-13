import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subscription, finalize, catchError, EMPTY } from 'rxjs';
import { Product } from 'src/app/models/product';
import { ProductService } from 'src/app/service/product.service';
import { UserService } from 'src/app/service/user.service';

@Component({
  selector: 'app-tproducts',
  templateUrl: './tproducts.component.html',
  styleUrls: ['./tproducts.component.css'],
})
export class TproductsComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  nameFilter: string = '';
  minPriceFilter: number = 0;
  maxPriceFilter: number = 0;
  categories$: Observable<string[]>;
  selectedCategory: string = '';
  token: string;
  isLoading: boolean = false;
  isDeletingProduct: string | null = null;

  private subscriptions: Subscription[] = [];

  constructor(
    private productService: ProductService,
    private userService: UserService,
    private router: Router,
    private toastService: ToastrService
  ) {
    this.token = this.userService.getToken();
    this.categories$ = this.productService.getCategories();
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  /**
   * Carga todos los productos desde el servicio
   */
  private loadProducts(): void {
    this.isLoading = true;
    const sub = this.productService
      .getAllProducts()
      .pipe(
        catchError((error) => {
          this.handleError(error, 'Error al cargar productos');
          this.router.navigate(['home']);
          return EMPTY;
        }),
        finalize(() => (this.isLoading = false))
      )
      .subscribe((products) => {
        this.products = products;
        this.filteredProducts = products;
      });

    this.subscriptions.push(sub);
  }

  /**
   * Filtra productos basado en nombre, categoría y rango de precio
   */
  applyFilters(): void {
    this.filteredProducts = this.products.filter((product) => {
      // Filtro por nombre o tipo
      const nameMatch =
        !this.nameFilter ||
        product.title.toLowerCase().includes(this.nameFilter.toLowerCase()) ||
        product.categories
          .toLowerCase()
          .includes(this.nameFilter.toLowerCase());

      // Filtro por categoría
      const categoryMatch =
        !this.selectedCategory ||
        product.categories.toLowerCase() ===
          this.selectedCategory.toLowerCase();

      // Filtro por rango de precio
      const priceMatch =
        (!this.minPriceFilter && !this.maxPriceFilter) ||
        (product.price >= this.minPriceFilter &&
          product.price <= (this.maxPriceFilter || Number.MAX_VALUE));

      return nameMatch && categoryMatch && priceMatch;
    });
  }

  resetFilters(): void {
    this.nameFilter = '';
    this.minPriceFilter = 0;
    this.maxPriceFilter = 0;
    this.selectedCategory = '';
    this.filteredProducts = [...this.products];
  }


  addProduct(): void {
    this.router.navigate(['fproducts', 0]);
  }


  editProduct(product: Product): void {
    this.router.navigate(['fproducts', product._id]);
  }


  deleteProduct(product: Product): void {
    if (!confirm(`¿Está seguro que desea eliminar "${product.title}"?`)) {
      return;
    }

    this.isDeletingProduct = product._id;

    const sub = this.productService
      .deleteProduct(product._id, this.token)
      .pipe(
        catchError((error) => {
          this.handleError(error, 'No se pudo eliminar el producto');
          return EMPTY;
        }),
        finalize(() => (this.isDeletingProduct = null))
      )
      .subscribe(() => {
        this.products = this.products.filter((p) => p._id !== product._id);
        this.filteredProducts = this.filteredProducts.filter(
          (p) => p._id !== product._id
        );
        this.toastService.success(
          'El producto ha sido eliminado correctamente',
          'Eliminación exitosa',
          { timeOut: 2500 }
        );
      });

    this.subscriptions.push(sub);
  }

  private handleError(error: any, defaultMessage: string): void {
    const errorMessage = error.error?.message || defaultMessage;
    this.toastService.error(errorMessage, 'Error', { timeOut: 3000 });
  }
}
