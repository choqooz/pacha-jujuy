import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  constructor(private toastService: ToastrService) {}

  handleError(message: string, title: string = 'Error', options: any = {}): void {
    this.toastService.error(message, title, { timeOut: 3000, ...options });
    console.error(`${title}: ${message}`);
  }

  handleWarning(message: string, title: string = 'Advertencia', options: any = {}): void {
    this.toastService.warning(message, title, { timeOut: 3000, ...options });
  }

  handleInfo(message: string, title: string = 'Información', options: any = {}): void {
    this.toastService.info(message, title, { timeOut: 3000, ...options });
  }

  handleSuccess(message: string, title: string = 'Éxito', options: any = {}): void {
    this.toastService.success(message, title, { timeOut: 3000, ...options });
  }
}