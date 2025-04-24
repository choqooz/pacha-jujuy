import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ProductsComponent } from './components/products/products.component';
import { TproductsComponent } from './components/tproducts/tproducts.component';
import { FproductsComponent } from './components/fproducts/fproducts.component';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { OrderTableComponent } from './components/order-table/order-table.component';
import { CartTableComponent } from './components/cart-table/cart-table.component';
import { UserTableComponent } from './components/user-table/user-table.component';
import { InfoProductComponent } from './components/info-product/info-product.component';
import { CompraComponent } from './components/compra/compra.component';
import { EstadisticaComponent } from './components/estadistica/estadistica.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'tproducts', component: TproductsComponent },
  { path: 'fproducts/:id', component: FproductsComponent },
  { path: 'infoprod/:id', component: InfoProductComponent },
  { path: 'productos', component: ProductsComponent },
  { path: 'registro', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'order-table', component: OrderTableComponent },
  { path: 'cartTable', component: CartTableComponent },
  { path: 'tuser', component: UserTableComponent },
  { path: 'compra/:id', component: CompraComponent },
  { path: 'status', component: EstadisticaComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
