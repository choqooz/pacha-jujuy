import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/layout/header/header.component';
import { FooterComponent } from './components/layout/footer/footer.component';
import { HomeComponent } from './components/home/home.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { LoginComponent } from './components/login/login.component';
import { ProductsComponent } from './components/products/products.component';
import { TproductsComponent } from './components/tproducts/tproducts.component';
import { FproductsComponent } from './components/fproducts/fproducts.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RegisterComponent } from './components/register/register.component';
import { OrderTableComponent } from './components/order-table/order-table.component';
import { UserService } from './services/user.service';
import { TokenInterceptorService } from './services/token-interceptor.service';
import { CartTableComponent } from './components/cart-table/cart-table.component';
import { UserTableComponent } from './components/user-table/user-table.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SliderComponent } from './components/slider/slider.component';
import { FormatoEmail } from './components/shared/directivas/validacion.directive';
import { InfoProductComponent } from './components/info-product/info-product.component';
import { CompraComponent } from './components/compra/compra.component';
import { NgxPayPalModule } from 'ngx-paypal';
import { EstadisticaComponent } from './components/estadistica/estadistica.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    LoginComponent,
    ProductsComponent,
    TproductsComponent,
    FproductsComponent,
    RegisterComponent,
    OrderTableComponent,
    CartTableComponent,
    UserTableComponent,
    SliderComponent,
    FormatoEmail,
    InfoProductComponent,
    CompraComponent,
    EstadisticaComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    NgxDatatableModule,
    NgxPayPalModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
  ],
  providers: [
    UserService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
