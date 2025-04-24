import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.css'],
})
export class SliderComponent implements OnInit {
  @ViewChild('carousel', { static: true }) carousel!: ElementRef;

  products: Product[] = [];
  featuredProducts: Product[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.featuredProducts = this.getRandomProducts(products, 5);
      },
      error: (err) => {
        console.error('Error al cargar productos para el slider:', err);
      },
    });
  }

  private getRandomProducts(products: Product[], count: number): Product[] {
    if (products.length <= count) {
      return products;
    }

    const shuffled = [...products].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  scrollCarousel(direction: number): void {
    const element = this.carousel.nativeElement;
    const scrollAmount = element.offsetWidth * 0.7;
    element.scrollBy({ left: scrollAmount * direction, behavior: 'smooth' });
  }
}
