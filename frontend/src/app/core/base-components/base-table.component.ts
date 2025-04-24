import { Directive, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { NavigationService } from '../../services/navigation.service';

@Directive()
export abstract class BaseTableComponent implements OnInit, OnDestroy {
  // Propiedades comunes para tablas
  protected isLoading: boolean = false;
  protected error: string | null = null;
  protected subscriptions: Subscription[] = [];

  constructor(
    protected errorHandler: ErrorHandlerService,
    protected navigationService: NavigationService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
  }

  /**
   * Método abstracto para cargar datos - debe ser implementado por subclases
   */
  protected abstract loadData(): void;

  /**
   * Método para gestionar errores de forma unificada
   * @param error El error que ocurrió
   * @param defaultMessage Mensaje de error por defecto
   */
  protected handleError(
    error: any,
    defaultMessage: string = 'Ha ocurrido un error'
  ): void {
    this.errorHandler.handleComponentError(error, defaultMessage);
  }

  /**
   * Método para navegar a una ruta específica
   * @param route La ruta a la que navegar
   * @param params Parámetros opcionales de navegación
   */
  protected navigateTo(route: string[], params?: any): void {
    this.navigationService.navigateTo(route, params);
  }

  /**
   * Método para resetear filtros - puede ser sobrescrito por subclases
   */
  resetFilters(): void {
    // Implementación a ser personalizada en las clases hijas
  }

  /**
   * Método para añadir una suscripción al arreglo de suscripciones
   * @param subscription La suscripción a añadir
   */
  protected addSubscription(subscription: Subscription): void {
    this.subscriptions.push(subscription);
  }
}
