import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.css'],
})
export class SliderComponent {
  panels!: NodeListOf<Element>;

  constructor() {}

  ngAfterViewInit(): void {
    this.panels = document.querySelectorAll('.panel');
    this.panels.forEach((panel) => {
      panel.addEventListener('click', () => {
        this.removeActiveClasses();
        panel.classList.add('active');
      });
    });
  }

  removeActiveClasses() {
    this.panels.forEach((panel) => {
      panel.classList.remove('active');
    });
  }
}
