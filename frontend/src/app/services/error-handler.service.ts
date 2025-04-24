import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  constructor(private toastService: ToastrService, private router: Router) {}

  handleError(
    message: string,
    title: string = 'Error',
    options: any = {}
  ): void {
    this.toastService.error(message, title, { timeOut: 3000, ...options });
    console.error(`${title}: ${message}`);
  }

  handleWarning(
    message: string,
    title: string = 'Advertencia',
    options: any = {}
  ): void {
    this.toastService.warning(message, title, { timeOut: 3000, ...options });
  }

  handleInfo(
    message: string,
    title: string = 'Información',
    options: any = {}
  ): void {
    this.toastService.info(message, title, { timeOut: 3000, ...options });
  }

  handleSuccess(
    message: string,
    title: string = 'Éxito',
    options: any = {}
  ): void {
    this.toastService.success(message, title, { timeOut: 3000, ...options });
  }

  handleHttpError(
    error: any,
    defaultMessage: string = 'Ha ocurrido un error'
  ): Observable<never> {
    let errorMessage = defaultMessage;

    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        errorMessage = 'No hay conexión con el servidor.';
      } else if (error.status === 401) {
        errorMessage = 'Sesión expirada. Por favor, inicie sesión nuevamente.';
        this.router.navigate(['/login']);
      } else if (error.status === 403) {
        errorMessage = 'No tiene permisos para realizar esta acción.';
      } else if (error.status === 404) {
        errorMessage = 'Recurso no encontrado.';
      } else if (error.error?.message) {
        // Extraer mensaje de error del cuerpo de la respuesta
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      console.error('Error HTTP:', error);
    }

    this.handleError(errorMessage);

    // Devolver un Observable de error para la cadena de observables
    return throwError(() => error);
  }

  handleComponentError(
    error: any,
    defaultMessage: string = 'Ha ocurrido un error'
  ): void {
    let errorMessage = defaultMessage;

    if (error instanceof HttpErrorResponse) {
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.status === 401) {
        errorMessage = 'Sesión expirada. Por favor, inicie sesión nuevamente.';
      } else if (error.message) {
        errorMessage = error.message;
      }
    } else if (error?.message) {
      errorMessage = error.message;
    }

    this.handleError(errorMessage);
  }
}
