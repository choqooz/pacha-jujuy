import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { UserService } from 'src/app/service/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm!: FormGroup;
  isSubmitting = false;
  passwordVisible = false;
  confirmPasswordVisible = false;
  private subscription: Subscription = new Subscription();

  constructor(
    private userService: UserService,
    private router: Router,
    private toastService: ToastrService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private initForm(): void {
    this.registerForm = this.fb.group(
      {
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/
            ),
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  private passwordMatchValidator(
    form: FormGroup
  ): { [key: string]: boolean } | null {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (!password || !confirmPassword) return null;

    return password.value === confirmPassword.value
      ? null
      : { passwordMismatch: true };
  }

  get f() {
    return this.registerForm.controls;
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.passwordVisible = !this.passwordVisible;
    } else {
      this.confirmPasswordVisible = !this.confirmPasswordVisible;
    }
  }

  onSubmit(): void {
    // Marcar todos los campos como touched para mostrar errores
    Object.keys(this.registerForm.controls).forEach((key) => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });

    // Detener si el formulario es inválido
    if (this.registerForm.invalid) {
      this.toastService.warning(
        'Por favor corrija los errores en el formulario',
        'Formulario Incompleto'
      );
      return;
    }

    this.isSubmitting = true;

    const user = {
      username: this.f['username'].value,
      email: this.f['email'].value,
      password: this.f['password'].value,
    };

    const sub = this.userService
      .createUser(user)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe(
        (result) => {
          this.toastService.success(
            `Bienvenid@ ${user.username}`,
            'Registro Exitoso',
            { timeOut: 2500 }
          );
          this.router.navigate(['login']);
        },
        (error) => this.handleError(error)
      );

    this.subscription.add(sub);
  }

  private handleError(error: any): void {
    if (error.error?.keyPattern?.email) {
      this.toastService.error('Email ya registrado', 'Error de Registro');
      this.f['email'].setErrors({ alreadyExists: true });
    } else if (error.error?.keyPattern?.username) {
      this.toastService.error(
        'Nombre de usuario ya registrado',
        'Error de Registro'
      );
      this.f['username'].setErrors({ alreadyExists: true });
    } else {
      this.toastService.error(
        error.error?.message || 'Ha ocurrido un error inesperado',
        'Error de Registro'
      );
    }
  }

  navigateToLogin(): void {
    this.router.navigate(['login']);
  }

  cancel(): void {
    this.router.navigate(['home']);
  }
}
