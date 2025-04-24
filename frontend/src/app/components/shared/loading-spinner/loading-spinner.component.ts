import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.css'],
})
export class LoadingSpinnerComponent implements OnInit {
  @Input() message: string = 'Cargando...';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() textClass: string = 'text-primary';
  @Input() centered: boolean = true;
  @Input() padding: string = 'py-5';

  constructor() {}

  ngOnInit(): void {}

  get spinnerSizeClass(): string {
    switch (this.size) {
      case 'sm':
        return 'spinner-border-sm';
      case 'lg':
        return '';
      default:
        return '';
    }
  }

  get containerClass(): string {
    return this.centered ? 'text-center' : '';
  }
}
