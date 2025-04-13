import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User, UserResponse } from '../models/user';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthResponse } from '../models/types';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl: string = environment.apiUrl || 'http://localhost:5000/api';
  private user: User | null = null;

  // Subjects para estado de la aplicación
  private loginSubject = new BehaviorSubject<boolean>(false);
  private adminSubject = new BehaviorSubject<boolean>(false);

  // Observables públicos
  readonly login$ = this.loginSubject.asObservable();
  readonly admin$ = this.adminSubject.asObservable();

  constructor(private http: HttpClient) {
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
   * Crea headers HTTP con autenticación opcional
   */
  private getAuthHeaders(token?: string): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  /**
   * Manejo centralizado de errores HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('API Error:', error);
    return throwError(() => error);
  }

  /**
   * Registra un nuevo usuario
   */
  createUser(user: User): Observable<UserResponse> {
    const url = `${this.apiUrl}/auth/register`;
    const body = {
      username: user.username,
      email: user.email,
      password: user.password,
    };

    return this.http
      .post<UserResponse>(url, body, {
        headers: this.getAuthHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Inicia sesión de usuario
   */
  loginUser(credentials: {
    username: string;
    password: string;
  }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/auth/login`,
      credentials
    );
  }

  /**
   * Obtiene estadísticas de usuarios (admin)
   */
  getUserStats(token: string): Observable<any> {
    const url = `${this.apiUrl}/users/stats`;

    return this.http
      .get<any>(url, {
        headers: this.getAuthHeaders(token),
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtiene todos los usuarios (admin)
   */
  getAllUser(token: string): Observable<User[]> {
    const url = `${this.apiUrl}/users`;

    return this.http
      .get<User[]>(url, {
        headers: this.getAuthHeaders(token),
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtiene usuarios filtrados (admin)
   */
  getAllUserFilter(token: string): Observable<User[]> {
    const url = `${this.apiUrl}/users`;

    return this.http
      .get<User[]>(url, {
        headers: this.getAuthHeaders(token),
        params: new HttpParams().set('new', 'true'),
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtiene un usuario por su ID
   */
  getUserById(userId?: string): Observable<User> {
    const id = userId || sessionStorage.getItem('userId');

    if (!id) {
      return throwError(() => new Error('No se encontró ID de usuario'));
    }

    const url = `${this.apiUrl}/users/${id}`;
    const token = this.getToken();

    return this.http
      .get<User>(url, {
        headers: this.getAuthHeaders(token),
      })
      .pipe(
        catchError(this.handleError),
        // Opcional: guardar el usuario en la caché del servicio
        tap((user) => {
          this.user = user;
          // También podemos almacenar el usuario completo en sessionStorage
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

  // MÉTODOS DE GESTIÓN DE ESTADO DE AUTENTICACIÓN

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
   * Obtiene datos completos del usuario
   */
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
