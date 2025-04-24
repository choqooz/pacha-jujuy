import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';
import { UserService } from 'src/app/services/user.service';
import { BaseFormComponent } from 'src/app/core/base-components/base-form.component';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { CustomValidators } from 'src/app/core/validators/custom-validators';
import { NavigationService } from 'src/app/services/navigation.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent extends BaseFormComponent {
  registerForm!: FormGroup;
  passwordVisible = false;
  confirmPasswordVisible = false;
  override isSubmitting = false;

  constructor(
    private userService: UserService,
    private toastService: ToastrService,
    private fb: FormBuilder,
    protected override errorHandler: ErrorHandlerService,
    protected override navigationService: NavigationService
  ) {
    super(errorHandler, navigationService);
  }

  protected override initForm(): void {
    this.registerForm = this.fb.group(
      {
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            CustomValidators.strongPassword(),
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      {
        validators: CustomValidators.mustMatch('password', 'confirmPassword'),
      }
    );
  }

  protected override getForm(): FormGroup {
    return this.registerForm;
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
    this.markAllAsTouched();

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
          this.navigationService.goToLogin();
        },
        (error) => this.handleRegistrationError(error)
      );

    this.addSubscription(sub);
  }

  private handleRegistrationError(error: any): void {
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
      this.handleFormError(error, 'Error de Registro');
    }
  }

  navigateToLogin(): void {
    this.navigationService.goToLogin();
  }

  cancel(): void {
    this.navigationService.goToHome();
  }
}
