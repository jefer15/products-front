import { Routes } from '@angular/router';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/products/products.component').then(m => m.ProductsComponent),
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/product-form/product-form.component').then(m => m.ProductFormComponent),
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./pages/product-form/product-form.component').then(m => m.ProductFormComponent),
  },
];
