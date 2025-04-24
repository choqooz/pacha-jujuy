import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { UserService } from '../../services/user.service';
import { AuthResponse } from '../../models/types';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  isLoading = false;
  hidePassword = true;
  private subscription = new Subscription();

  constructor(
    private userService: UserService,
    private router: Router,
    private toastService: ToastrService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();

    // Redirigir si ya está autenticado
    if (this.userService.isLoggedIn()) {
      this.router.navigate(['home']);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const credentials: any = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password,
    };

    const loginSub = this.userService
      .loginUser(credentials)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response: AuthResponse) => {
          this.handleSuccessfulLogin(response);
        },
        error: (error) => this.handleLoginError(error),
      });

    this.subscription.add(loginSub);
  }

  navigateToRegister(): void {
    this.router.navigate(['registro']);
  }

  cancelLogin(): void {
    this.router.navigate(['home']);
  }

  get usernameControl() {
    return this.loginForm.get('username');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }

  private handleSuccessfulLogin(response: AuthResponse): void {
    this.userService.handleLoginSuccess(response);

    this.toastService.success(
      `Bienvenido/a ${response.username}`,
      'Inicio de sesión exitoso',
      { timeOut: 2500 }
    );

    this.router.navigate(['home']);
  }

  private handleLoginError(error: any): void {
    let errorMessage = 'Ha ocurrido un error durante el inicio de sesión';

    if (error?.error?.message) {
      errorMessage = error.error.message;
    } else if (error?.status === 401) {
      errorMessage = 'Credenciales inválidas. Por favor, intente de nuevo.';
    } else if (error?.status === 0) {
      errorMessage =
        'No se pudo conectar con el servidor. Verifique su conexión a internet.';
    }

    this.toastService.error(errorMessage, 'Error de autenticación', {
      timeOut: 3000,
    });
  }
}
