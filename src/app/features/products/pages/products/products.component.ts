import { ChangeDetectionStrategy, Component, DestroyRef, HostListener, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../../core/services/product/product.service';
import { Product } from '../../../../core/models/product.model';
import { Router } from '@angular/router';
import { signal, computed } from '@angular/core';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { AlertService } from '../../../../shared/services/alert.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    ConfirmModalComponent
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsComponent implements OnInit {

  products = signal<Product[]>([]);
  searchTerm = signal('');
  pageSize = signal(5);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  showModal = false;
  productToDelete: Product | null = null;
  activeMenu: string | null = null;

  filteredProducts = computed(() => {
    const term = this.searchTerm().toLowerCase();

    return this.products().filter(product =>
      product.name.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term)
    );
  });

  visibleProducts = computed(() =>
    this.filteredProducts().slice(0, this.pageSize())
  );

  private _productService = inject(ProductService);
  private _router = inject(Router);
  private _alertService = inject(AlertService);
  private _destroyRef = inject(DestroyRef);

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.menu-container')) {
      this.activeMenu = null;
    }
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this._productService.getProducts()
    .pipe(takeUntilDestroyed(this._destroyRef))
    .subscribe({
      next: (response) => {
        this.products.set(response.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Error al cargar productos');
        this.isLoading.set(false);
      }
    });
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
  }

  onPageSizeChange(value: string): void {
    this.pageSize.set(Number(value));
  }

  trackById(_: number, product: Product): string {
    return product.id;
  }

  edit(product: Product) {
    this._router.navigate(['/products/edit', product.id]);
  }

  create() {
    this._router.navigate(['/products/create']);
  }

  openModal(product: Product): void {
    this.productToDelete = product;
    this.showModal = true;
  }

  closeModal(): void {
    this.productToDelete = null;
    this.showModal = false;
  }

  toggleMenu(id: string): void {
    this.activeMenu = this.activeMenu === id ? null : id;
  }

  getInitials(name: string): string {
    if (!name) return '';
    return name.substring(0, 2).toUpperCase();
  }

  confirmDelete(): void {
    if (!this.productToDelete) return;

    this._productService.deleteProduct(this.productToDelete.id).subscribe({
      next: () => {
        this.closeModal();
        this.loadProducts();
        this._alertService.show('Producto eliminado correctamente', 'success');
      },
      error: () => {
        this.closeModal();
        this._alertService.show('Error al eliminar el producto', 'error');
      },
    });
  }
}
