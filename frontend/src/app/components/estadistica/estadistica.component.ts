import { Component, OnInit, OnDestroy } from '@angular/core';
import { OrderService } from 'src/app/services/order.service';
import { UserService } from 'src/app/services/user.service';
import * as html2pdf from 'html2pdf.js';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { UserStatsResponse, IncomeStatsResponse } from 'src/app/models/types';

@Component({
  selector: 'app-estadistica',
  templateUrl: './estadistica.component.html',
  styleUrls: ['./estadistica.component.css'],
})
export class EstadisticaComponent implements OnInit, OnDestroy {
  stats: UserStatsResponse[] = [];
  token: string = this.userService.getToken();
  incomeData: IncomeStatsResponse[] = [];
  private subscriptions: Subscription = new Subscription();

  constructor(
    private userService: UserService,
    private orderService: OrderService,
    private router: Router,
    private toastService: ToastrService
  ) {}

  ngOnInit(): void {
    this.cargarEstadisticasUsuarios();
    this.cargarEstadisticasIngresos();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getMonthName(month: number): string {
    const monthNames = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    return monthNames[month - 1] || '';
  }

  generarPDF(): void {
    const element = document.getElementById('tablaEstadisticas');
    if (!element) {
      this.toastService.error('Elemento no encontrado', 'Error');
      return;
    }

    const options = {
      margin: [0, 0, 0, 0],
      filename: 'estadisticas_mensuales.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 4 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    html2pdf().from(element).set(options).save();
  }

  getMonthlyIncome(month: number): string {
    const monthIncome = this.incomeData.find((item) => item._id === month);
    return monthIncome ? monthIncome.total.toString() : '-';
  }

  calculatePercentage(total: number): string {
    const maxTotal = this.calcularTotalUsuarios();
    if (maxTotal === 0) return '0.00';

    const percentage = (total / maxTotal) * 100;
    return percentage.toFixed(2);
  }

  public calcularTotalUsuarios(): number {
    return this.stats.reduce((acc, curr) => acc + curr.total, 0);
  }

  calcularTotalIngresos(): string {
    const total = this.incomeData.reduce((sum, item) => sum + item.total, 0);
    return total.toLocaleString('es-AR');
  }

  isLoading: boolean = true;

  private cargarEstadisticasUsuarios(): void {
    this.isLoading = true;
    const sub = this.userService.getUserStats(this.token).subscribe(
      (data: UserStatsResponse[]) => {
        this.stats = this.sortStatsByMonth(data);
        this.isLoading = false;
      },
      (error) => {
        this.toastService.error(error.error, 'Ha Ocurrido un Error', {
          timeOut: 2500,
        });
        this.isLoading = false;
        this.router.navigate(['home']);
      }
    );
    this.subscriptions.add(sub);
  }

  private cargarEstadisticasIngresos(): void {
    const sub = this.orderService.getAllStats(this.token).subscribe(
      (data: IncomeStatsResponse[]) => {
        this.incomeData = data;
        this.isLoading = false;
      },
      (error) => {
        this.toastService.error('Error al cargar datos de ingresos', 'Error');
        this.isLoading = false;
      }
    );
    this.subscriptions.add(sub);
  }

  private sortStatsByMonth(stats: UserStatsResponse[]): UserStatsResponse[] {
    return [...stats].sort((a, b) => a._id - b._id);
  }
}
