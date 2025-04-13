import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import * as html2pdf from 'html2pdf.js';
import { Subscription } from 'rxjs';
import { finalize, catchError } from 'rxjs/operators';
import { UserService } from 'src/app/service/user.service';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-user-table',
  templateUrl: './user-table.component.html',
  styleUrls: ['./user-table.component.css'],
})
export class UserTableComponent implements OnInit, OnDestroy {
  @ViewChild('userTable') userTable!: ElementRef;

  users: User[] = [];
  filteredUsers: User[] = [];
  usernameFilter: string = '';
  startDateFilter: string = '';
  endDateFilter: string = '';
  isLoading: boolean = false;
  isGeneratingPdf: boolean = false;

  private subscriptions: Subscription = new Subscription();
  private token: string;

  constructor(
    private userService: UserService,
    private toastService: ToastrService,
    private router: Router
  ) {
    this.token = this.userService.getToken();
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Carga todos los usuarios desde el servicio
   */
  private loadUsers(): void {
    this.isLoading = true;

    const userSub = this.userService
      .getAllUserFilter(this.token)
      .pipe(
        catchError((error) => {
          this.handleError(error);
          this.router.navigate(['home']);
          throw error;
        }),
        finalize(() => (this.isLoading = false))
      )
      .subscribe((result) => {
        this.users = result;
        this.filteredUsers = [...result];
      });

    this.subscriptions.add(userSub);
  }

  /**
   * Filtra los usuarios según los criterios actuales
   */
  filterUsers(): void {
    this.filteredUsers = this.users.filter((user) => {
      let usernameMatch = true;
      let dateRangeMatch = true;

      // Filtro por nombre de usuario
      if (this.usernameFilter.trim() !== '') {
        usernameMatch = user.username
          .toLowerCase()
          .includes(this.usernameFilter.toLowerCase());
      }

      // Filtro por rango de fechas
      if (this.startDateFilter && this.endDateFilter) {
        const startDate = new Date(this.startDateFilter);
        const endDate = new Date(this.endDateFilter);
        endDate.setHours(23, 59, 59); 

        // Verificar que las fechas sean válidas antes de comparar
        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
          const userDate = user.createdAt
            ? new Date(user.createdAt)
            : new Date();
          dateRangeMatch = userDate >= startDate && userDate <= endDate;
        }
      }

      return usernameMatch && dateRangeMatch;
    });

    if (this.filteredUsers.length === 0) {
      this.toastService.info(
        'No se encontraron resultados con los filtros aplicados'
      );
    }
  }

  /**
   * Resetea todos los filtros aplicados
   */
  resetFilters(): void {
    this.usernameFilter = '';
    this.startDateFilter = '';
    this.endDateFilter = '';
    this.filteredUsers = [...this.users];
    this.toastService.info('Filtros restablecidos');
  }

  /**
   * Genera un PDF con la tabla de usuarios
   */
  generatePDF(): void {
    if (!this.userTable?.nativeElement) {
      this.toastService.warning('No se encontró la tabla para generar el PDF');
      return;
    }

    this.isGeneratingPdf = true;

    const options = {
      margin: [10, 10, 10, 10],
      filename: 'tabla_usuarios.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
    };

    setTimeout(() => {
      html2pdf()
        .from(this.userTable.nativeElement)
        .set(options)
        .save()
        .then(() => {
          this.toastService.success('PDF generado correctamente');
          this.isGeneratingPdf = false;
        })
        .catch((error: Error) => {
          this.handleError(error, 'Error al generar el PDF');
          this.isGeneratingPdf = false;
        });
    }, 100);
  }

  /**
   * Centraliza el manejo de errores
   */
  private handleError(
    error: any,
    defaultMessage: string = 'Ha ocurrido un error'
  ): void {
    const errorMessage =
      error.error?.message || error.message || defaultMessage;
    this.toastService.error(errorMessage, 'Error', { timeOut: 3500 });
  }
}
