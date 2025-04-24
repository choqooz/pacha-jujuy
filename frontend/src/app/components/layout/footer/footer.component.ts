import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from 'src/app/services/product.service';
import { Subscription, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent implements OnInit, OnDestroy {
  categories: string[] = [];
  isLoading = false;
  error: string | null = null;
  currentYear: number = new Date().getFullYear();

  private subscriptions = new Subscription();

  constructor(
    private productService: ProductService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadCategories(): void {
    this.isLoading = true;
    this.error = null;

    const categorySub = this.productService
      .getCategories()
      .pipe(
        catchError((error) => {
          this.error = 'No se pudieron cargar las categorías';
          return of([]); // of() para crear un Observable
        }),
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges(); // Fuerza detección de cambios
        })
      )
      .subscribe({
        next: (categories) => {
          this.categories = categories;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Subscription error:', err);
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        },
      });

    this.subscriptions.add(categorySub);
  }

  navigateToCategory(category: string): void {
    this.router.navigate(['/productos'], { queryParams: { category } });
  }
}
