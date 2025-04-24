import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User, UserResponse } from '../models/user';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';
import { AuthResponse } from '../models/types';
import { HttpUtilService } from './http-util.service';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private user: User | null = null;

  // Subjects para estado de la aplicación
  private loginSubject = new BehaviorSubject<boolean>(false);
  private adminSubject = new BehaviorSubject<boolean>(false);

  // Observables públicos
  readonly login$ = this.loginSubject.asObservable();
  readonly admin$ = this.adminSubject.asObservable();

  constructor(
    private http: HttpClient,
    private httpUtil: HttpUtilService,
    private errorHandler: ErrorHandlerService
  ) {
    this.checkAuthStatus();
  }

  /**
   * Verifica el estado de autenticación al cargar el servicio
   */
  private checkAuthStatus(): void {
    const token = this.getToken();
    const isAdmin = this.getAdmin() === 'true';

    if (token) {
      this.loginSubject.next(true);
      this.adminSubject.next(isAdmin);
      this.getUser();
    }
  }

  /**
   * Registra un nuevo usuario
   */
  createUser(user: User): Observable<UserResponse> {
    const url = `${this.httpUtil.getApiUrl()}/auth/register`;
    const body = {
      username: user.username,
      email: user.email,
      password: user.password,
    };

    return this.http
      .post<UserResponse>(url, body, {
        headers: this.httpUtil.getHeaders(),
      })
      .pipe(
        catchError((error) =>
          this.errorHandler.handleHttpError(error, 'Error al registrar usuario')
        )
      );
  }

  /**
   * Inicia sesión de usuario
   */
  loginUser(credentials: {
    username: string;
    password: string;
  }): Observable<AuthResponse> {
    const url = `${this.httpUtil.getApiUrl()}/auth/login`;
    return this.http
      .post<AuthResponse>(url, credentials)
      .pipe(
        catchError((error) =>
          this.errorHandler.handleHttpError(error, 'Error al iniciar sesión')
        )
      );
  }

  /**
   * Obtiene estadísticas de usuarios (admin)
   */
  getUserStats(token: string): Observable<any> {
    const url = `${this.httpUtil.getApiUrl()}/users/stats`;

    return this.http
      .get<any>(url, {
        headers: this.httpUtil.getHeaders(token),
      })
      .pipe(
        catchError((error) =>
          this.errorHandler.handleHttpError(
            error,
            'Error al obtener estadísticas'
          )
        )
      );
  }

  /**
   * Obtiene todos los usuarios (admin)
   */
  getAllUser(token: string): Observable<User[]> {
    const url = `${this.httpUtil.getApiUrl()}/users`;

    return this.http
      .get<User[]>(url, {
        headers: this.httpUtil.getHeaders(token),
      })
      .pipe(
        catchError((error) =>
          this.errorHandler.handleHttpError(error, 'Error al obtener usuarios')
        )
      );
  }

  /**
   * Obtiene usuarios filtrados (admin)
   */
  getAllUserFilter(token: string): Observable<User[]> {
    const url = `${this.httpUtil.getApiUrl()}/users`;

    return this.http
      .get<User[]>(url, {
        headers: this.httpUtil.getHeaders(token),
        params: new HttpParams().set('new', 'true'),
      })
      .pipe(
        catchError((error) =>
          this.errorHandler.handleHttpError(
            error,
            'Error al obtener usuarios filtrados'
          )
        )
      );
  }

  /**
   * Obtiene un usuario por su ID
   */
  getUserById(userId?: string): Observable<User> {
    const id = userId || sessionStorage.getItem('userId');

    if (!id) {
      return throwError(() => new Error('No se encontró ID de usuario'));
    }

    const url = `${this.httpUtil.getApiUrl()}/users/${id}`;
    const token = this.getToken();

    return this.http
      .get<User>(url, {
        headers: this.httpUtil.getHeaders(token),
      })
      .pipe(
        catchError((error) =>
          this.errorHandler.handleHttpError(error, 'Error al obtener usuario')
        ),
        tap((user) => {
          this.user = user;
          sessionStorage.setItem('user', JSON.stringify(user));
        })
      );
  }

  handleLoginSuccess(response: AuthResponse): void {
    sessionStorage.setItem('accessToken', response.accessToken);
    sessionStorage.setItem('userId', response._id);
    sessionStorage.setItem('username', response.username);
    sessionStorage.setItem('isAdmin', String(response.isAdmin));

    this.setLogin(true);
  }


  /**
   * Establece el token en sessionStorage
   */
  setToken(token: string): void {
    sessionStorage.setItem('accesToken', token);
  }

  /**
   * Establece el estado de admin
   */
  setAdmin(admin: boolean): void {
    sessionStorage.setItem('isAdmin', admin ? 'true' : 'false');
    this.adminSubject.next(admin);
  }

  /**
   * Establece el estado de login
   */
  setLogin(login: boolean): void {
    this.loginSubject.next(login);
  }

  /**
   * Establece el nombre de usuario
   */
  setUsername(username: string): void {
    sessionStorage.setItem('username', username);
  }

  /**
   * Establece el email
   */
  setEmail(email: string): void {
    sessionStorage.setItem('email', email);
  }

  /**
   * Almacena datos completos del usuario
   */
  setUser(user: User): void {
    this.user = user;
    sessionStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Obtiene el token actual
   */
  getToken(): string {
    return sessionStorage.getItem('accessToken') || '';
  }

  /**
   * Obtiene el estado de admin
   */
  getAdmin(): string {
    return sessionStorage.getItem('isAdmin') || '';
  }

  /**
   * Obtiene el nombre de usuario
   */
  getUsername(): string {
    return sessionStorage.getItem('username') || '';
  }

  /**
   * Obtiene el email
   */
  getEmail(): string {
    return sessionStorage.getItem('email') || '';
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /**
   * Obtiene datos completos del usuario desde sessionStorage o solicita a la API
   */
  getUser(): User | null {
    // Si ya tenemos el usuario en memoria, lo devolvemos
    if (this.user) return this.user;

    const userString = sessionStorage.getItem('user');
    if (userString) {
      try {
        this.user = JSON.parse(userString);
        return this.user;
      } catch (error) {
        console.error('Error al parsear el usuario:', error);
      }
    }

    const userId = sessionStorage.getItem('userId');
    if (userId) {
      this.user = {
        _id: userId,
        username: this.getUsername(),
        email: this.getEmail(),
        isAdmin: this.isAdmin(),
      } as User;
    }

    return this.user;
  }

  isAdmin(): boolean {
    const isAdminStr = sessionStorage.getItem('isAdmin');
    return isAdminStr === 'true';
  }

  /**
   * Cierra la sesión y limpia todos los datos
   */
  logout(): void {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('isAdmin');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('user');

    this.user = null;
    this.setAdmin(false);
    this.setLogin(false);
  }
}
