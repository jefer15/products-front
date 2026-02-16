import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductFormComponent } from './product-form.component';
import { ProductService } from '../../../../core/services/product/product.service';
import { AlertService } from '../../../../shared/services/alert.service';

describe('ProductFormComponent', () => {
  let component: ProductFormComponent;
  let fixture: ComponentFixture<ProductFormComponent>;

  let productServiceMock: any;
  let routerMock: any;
  let alertServiceMock: any;

  beforeEach(async () => {

    productServiceMock = {
      verifyProductId: jest.fn().mockReturnValue(of(false)),
      createProduct: jest.fn().mockReturnValue(of({})),
      updateProduct: jest.fn().mockReturnValue(of({})),
      getProductById: jest.fn().mockReturnValue(of({
        id: '1',
        name: 'Test',
        description: 'Desc test',
        logo: '',
        date_release: '2025-01-01',
        date_revision: '2026-01-01'
      }))
    };

    routerMock = {
      navigateByUrl: jest.fn()
    };

    alertServiceMock = {
      show: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ProductFormComponent],
      providers: [
        { provide: ProductService, useValue: productServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: AlertService, useValue: alertServiceMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: jest.fn().mockReturnValue(null)
              }
            }
          }
        }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should invalidate form if empty', () => {
    expect(component.productForm.invalid).toBe(true);
  });

  it('should validate ID minlength', () => {
    const idControl = component.productForm.get('id');
    idControl?.setValue('ab');
    expect(idControl?.invalid).toBe(true);
  });

  it('should call createProduct on save when form is valid', fakeAsync(() => {

    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const release = futureDate.toISOString().split('T')[0];

    const revisionDate = new Date(futureDate);
    revisionDate.setFullYear(revisionDate.getFullYear() + 1);
    const revision = revisionDate.toISOString().split('T')[0];

    component.productForm.get('date_revision')?.enable();

    component.productForm.setValue({
      id: '123',
      name: 'Test Product',
      description: 'Valid description 123',
      logo: 'logo.png',
      date_release: release,
      date_revision: revision
    });

    tick();

    component.save();

    expect(productServiceMock.createProduct).toHaveBeenCalled();
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/products');
    expect(alertServiceMock.show).toHaveBeenCalledWith(
      'Producto creado correctamente',
      'success'
    );
  }));


  it('should show error alert if create fails', fakeAsync(() => {

    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const release = futureDate.toISOString().split('T')[0];

    const revisionDate = new Date(futureDate);
    revisionDate.setFullYear(revisionDate.getFullYear() + 1);
    const revision = revisionDate.toISOString().split('T')[0];

    productServiceMock.createProduct.mockReturnValueOnce(
      throwError(() => new Error())
    );

    component.productForm.get('date_revision')?.enable();

    component.productForm.setValue({
      id: '123',
      name: 'Test Product',
      description: 'Valid description 123',
      logo: 'logo.png',
      date_release: release,
      date_revision: revision
    });

    component.productForm.updateValueAndValidity();
    tick();

    component.save();
    tick();

    expect(alertServiceMock.show).toHaveBeenCalledWith(
      'Error al crear el producto',
      'error'
    );
  }));



  it('should call updateProduct when in edit mode', fakeAsync(() => {

    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const release = futureDate.toISOString().split('T')[0];

    const revisionDate = new Date(futureDate);
    revisionDate.setFullYear(revisionDate.getFullYear() + 1);
    const revision = revisionDate.toISOString().split('T')[0];

    component.isEdit = true;
    component.productId = '1';

    component.productForm.get('id')?.disable();
    component.productForm.get('date_revision')?.enable();

    component.productForm.setValue({
      id: '1',
      name: 'Updated Product',
      description: 'Updated description 123',
      logo: 'logo.png',
      date_release: release,
      date_revision: revision
    });

    component.productForm.updateValueAndValidity();
    tick();

    component.save();
    tick();

    expect(productServiceMock.updateProduct).toHaveBeenCalledWith(
      '1',
      component.productForm.getRawValue()
    );

    expect(alertServiceMock.show).toHaveBeenCalledWith(
      'Producto actualizado correctamente',
      'success'
    );
  }));


  it('should invalidate past release date', () => {
    const control = component.productForm.get('date_release');

    const pastDate = new Date();
    pastDate.setFullYear(pastDate.getFullYear() - 1);

    control?.setValue(pastDate.toISOString().split('T')[0]);

    expect(control?.errors?.['pastDate']).toBeTruthy();
  });

  it('should mark id as invalid if id already exists (async validator)', async () => {
    productServiceMock.verifyProductId.mockReturnValueOnce(of(true));

    const idControl = component.productForm.get('id');
    idControl?.setValue('exist1');

    await fixture.whenStable();

    expect(idControl?.errors).toEqual({ idExists: true });
  });

  it('should allow id if it does not exist (async validator)', async () => {
    productServiceMock.verifyProductId.mockReturnValueOnce(of(false));

    const idControl = component.productForm.get('id');
    idControl?.setValue('newid1');

    await fixture.whenStable();

    expect(idControl?.valid).toBe(true);
  });

});
