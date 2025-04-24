import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, finalize, catchError } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  categoryProducts: Product[] = [];
  showShopText = false;
  isLoading = false;
  error: string | null = null;

  private subscriptions = new Subscription();

  constructor(private productService: ProductService, private router: Router) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Loads all products and extracts unique categories
   */
  private loadProducts(): void {
    this.isLoading = true;
    this.error = null;

    const productSub = this.productService
      .getAllProducts()
      .pipe(
        catchError((error) => {
          this.error =
            'No se pudieron cargar los productos. Por favor, intente de nuevo más tarde.';
          return [];
        }),
        finalize(() => (this.isLoading = false))
      )
      .subscribe((products) => {
        this.products = products;
        this.extractUniqueCategories(products);
      });

    this.subscriptions.add(productSub);
  }

  /**
   * Extracts products with unique categories from the product list
   */
  private extractUniqueCategories(products: Product[]): void {
    const uniqueCategories = new Set<string>();

    this.categoryProducts = products.filter((product) => {
      const lowerCategory = product.categories.toLowerCase();
      if (!uniqueCategories.has(lowerCategory)) {
        uniqueCategories.add(lowerCategory);
        return true;
      }
      return false;
    });
  }

  /**
   * Navigates to products page filtered by category
   */
  navigateToCategory(category: string): void {
    this.router.navigate(['/productos'], {
      queryParams: { category: category },
    });
  }

  /**
   * Navigates to product detail page
   */
  mover(prod: Product): void {
    this.router.navigate(['infoprod', prod._id]);
  }
}
