import { Component, ViewChild, ElementRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as html2pdf from 'html2pdf.js';
import { catchError, finalize } from 'rxjs/operators';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user';
import { BaseTableComponent } from 'src/app/core/base-components/base-table.component';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { NavigationService } from 'src/app/services/navigation.service';

@Component({
  selector: 'app-user-table',
  templateUrl: './user-table.component.html',
  styleUrls: ['./user-table.component.css'],
})
export class UserTableComponent extends BaseTableComponent {
  @ViewChild('userTable') userTable!: ElementRef;

  users: User[] = [];
  filteredUsers: User[] = [];
  usernameFilter: string = '';
  startDateFilter: string = '';
  endDateFilter: string = '';
  isGeneratingPdf: boolean = false;

  override isLoading = false;

  private token: string;

  constructor(
    private userService: UserService,
    private toastService: ToastrService,
    protected override errorHandler: ErrorHandlerService,
    protected override navigationService: NavigationService
  ) {
    super(errorHandler, navigationService);
    this.token = this.userService.getToken();
  }

  /**
   * Implementa el método abstracto de carga de datos
   */
  protected override loadData(): void {
    this.isLoading = true;

    const userSub = this.userService
      .getAllUserFilter(this.token)
      .pipe(
        catchError((error) => {
          this.handleError(error, 'Error al cargar usuarios');
          this.navigationService.goToHome();
          throw error;
        }),
        finalize(() => (this.isLoading = false))
      )
      .subscribe((result) => {
        this.users = result;
        this.filteredUsers = [...result];
      });

    this.addSubscription(userSub);
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
   * Sobrescribe el método resetFilters de la clase base
   */
  override resetFilters(): void {
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
}
