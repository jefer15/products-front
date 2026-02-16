import { Component, OnInit, inject, DestroyRef, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl, AsyncValidatorFn, ValidatorFn, FormGroup, FormControl, } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../../core/services/product/product.service';
import { map, switchMap, catchError, debounceTime, finalize, } from 'rxjs/operators';
import { of, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AlertService } from '../../../../shared/services/alert.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss',
})
export class ProductFormComponent implements OnInit {
  productForm!: FormGroup;
  isSubmitting = false;
  isEdit = false;
  productId: string | null = null;

  private _fb = inject(FormBuilder);
  private _productService = inject(ProductService);
  private _router = inject(Router);
  private _route = inject(ActivatedRoute);
  private _destroyRef = inject(DestroyRef);
  private _alertService = inject(AlertService)

  ngOnInit(): void {
    this.constructorForm();
    this.productId = this._route.snapshot.paramMap.get('id');

    if (this.productId) {
      this.isEdit = true;
      this.loadProduct(this.productId);
      this.productForm.get('id')?.disable();
    }
  }

  constructorForm() {
    this.productForm = this._fb.group({
      id: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10),], [this.productIdExistsValidator()]],
      name: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100),]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200),]],
      logo: ['', Validators.required],
      date_release: ['', [Validators.required, this.releaseDateNotPastValidator()]],
      date_revision: [{ value: '', disabled: true }, Validators.required],
    });

    this.listenReleaseDateChanges();
  }

  productIdExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) {
        return of(null);
      }

      return this._productService.verifyProductId(control.value).pipe(
        map((exists) => (exists ? { idExists: true } : null))
      );
    };
  }

  releaseDateNotPastValidator() {
    return (control: AbstractControl) => {
      if (!control.value) return null;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const selectedDate = new Date(control.value);

      return selectedDate < today ? { pastDate: true } : null;
    };
  }

  private listenReleaseDateChanges(): void {
    this.productForm
      .get('date_release')
      ?.valueChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((value: string) => {
        if (!value) return;

        const releaseDate = new Date(value);
        const revisionDate = new Date(releaseDate);
        revisionDate.setFullYear(releaseDate.getFullYear() + 1);

        this.productForm.get('date_revision')?.setValue(
          revisionDate.toISOString().split('T')[0]
        );
      });
  }

  loadProduct(id: string): void {
    this._productService.getProductById(id).subscribe((product) => {
      this.productForm.patchValue(product);
    });
  }

  save(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    if (this.isEdit && this.productId) {
      this._productService
        .updateProduct(this.productId, this.productForm.getRawValue())
        .subscribe({
          next: () => {
            this.isSubmitting = false;
            this._router.navigateByUrl('/products');
            this._alertService.show('Producto actualizado correctamente', 'success');
          },
          error: () => {
            this.isSubmitting = false;
            this._alertService.show('Error al actualizar el producto', 'error');
          },
        });
    } else {
      this._productService
        .createProduct(this.productForm.getRawValue())
        .subscribe({
          next: () => {
            this.isSubmitting = false;
            this._router.navigateByUrl('/products');
            this._alertService.show('Producto creado correctamente', 'success');
          },
          error: () => {
            this.isSubmitting = false;
            this._alertService.show('Error al crear el producto', 'error');
          },
        });
    }
  }

  reset(): void {
    this.productForm.reset();
  }
}