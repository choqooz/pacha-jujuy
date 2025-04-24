import { Directive, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { NavigationService } from '../../services/navigation.service';

@Directive()
export abstract class BaseFormComponent implements OnInit, OnDestroy {
  protected isSubmitting = false;
  protected subscriptions: Subscription[] = [];

  constructor(
    protected errorHandler: ErrorHandlerService,
    protected navigationService: NavigationService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
  }

  /**
   * Método abstracto para inicializar el formulario - debe ser implementado por subclases
   */
  protected abstract initForm(): void;

  /**
   * Método para obtener el formulario - debe ser implementado por subclases
   */
  protected abstract getForm(): FormGroup;

  /**
   * Método común para verificar si un control de formulario es inválido
   * @param controlName Nombre del control a verificar
   */
  protected isInvalid(controlName: string): boolean {
    const control = this.getForm()?.get(controlName);
    return control
      ? control.invalid && (control.dirty || control.touched)
      : false;
  }

  /**
   * Método para obtener mensaje de error de un control de formulario
   * @param controlName Nombre del control
   * @param errorKey Clave del error
   * @param defaultMessage Mensaje por defecto
   */
  protected getErrorMessage(
    controlName: string,
    errorKey: string,
    defaultMessage: string
  ): string {
    const control = this.getForm()?.get(controlName);
    return control && control.hasError(errorKey) ? defaultMessage : '';
  }

  /**
   * Método para marcar todos los campos como touched
   */
  protected markAllAsTouched(): void {
    Object.keys(this.getForm().controls).forEach((key) => {
      const control = this.getForm().get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  /**
   * Método para manejar errores de formulario
   * @param error Error ocurrido
   * @param defaultMessage Mensaje por defecto
   */
  protected handleFormError(
    error: any,
    defaultMessage: string = 'Error en el formulario'
  ): void {
    this.errorHandler.handleComponentError(error, defaultMessage);
    this.isSubmitting = false;
  }

  /**
   * Método para navegar a una ruta
   * @param route Ruta a navegar
   * @param extras Extras opcionales de navegación
   */
  protected navigateTo(route: string[], extras?: any): void {
    this.navigationService.navigateTo(route, extras);
  }

  /**
   * Método para añadir una suscripción
   * @param subscription Suscripción a añadir
   */
  protected addSubscription(subscription: Subscription): void {
    this.subscriptions.push(subscription);
  }
}
