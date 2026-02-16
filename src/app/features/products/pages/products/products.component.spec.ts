import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ProductService } from '../../../../core/services/product/product.service';
import { ProductsComponent } from './products.component';
import { Router } from '@angular/router';
import { AlertService } from '../../../../shared/services/alert.service';


describe('ProductsComponent', () => {
  let component: ProductsComponent;
  let fixture: ComponentFixture<ProductsComponent>;

  let productServiceMock: any;
  let routerMock: any;
  let alertServiceMock: any;

  beforeEach(async () => {
    productServiceMock = {
      getProducts: jest.fn().mockReturnValue(
        of({
          data: [
            {
              id: '1',
              name: 'Test Product',
              description: 'Desc',
              logo: '',
              date_release: '',
              date_revision: ''
            }
          ]
        })
      ),
      deleteProduct: jest.fn().mockReturnValue(of(void 0))
    };

    routerMock = {
      navigate: jest.fn()
    };

    alertServiceMock = {
      show: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ProductsComponent],
      providers: [
        { provide: ProductService, useValue: productServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: AlertService, useValue: alertServiceMock }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load products on init', () => {
    expect(productServiceMock.getProducts).toHaveBeenCalled();
    expect(component.products().length).toBe(1);
    expect(component.isLoading()).toBe(false);
  });

  it('should filter products by search term', () => {
    component.searchTerm.set('test');
    expect(component.filteredProducts().length).toBe(1);
  });

  it('should call delete and show success alert', () => {
    component.productToDelete = {
      id: '1',
      name: 'Test',
      description: 'Desc',
      logo: '',
      date_release: '',
      date_revision: ''
    };

    component.confirmDelete();

    expect(productServiceMock.deleteProduct).toHaveBeenCalledWith('1');
    expect(alertServiceMock.show).toHaveBeenCalledWith(
      'Producto eliminado correctamente',
      'success'
    );
  });

  it('should set errorMessage if loadProducts fails', () => {
    productServiceMock.getProducts.mockReturnValueOnce(
      throwError(() => new Error())
    );

    component.loadProducts();

    expect(component.errorMessage()).toBe('Error al cargar productos');
    expect(component.isLoading()).toBe(false);
  });

  it('should show error alert if delete fails', () => {
    productServiceMock.deleteProduct.mockReturnValueOnce(
      throwError(() => new Error())
    );

    component.productToDelete = {
      id: '1',
      name: 'Test',
      description: 'Desc',
      logo: '',
      date_release: '',
      date_revision: ''
    };

    component.confirmDelete();

    expect(alertServiceMock.show).toHaveBeenCalledWith(
      'Error al eliminar el producto',
      'error'
    );
  });

  it('should not call delete if no productToDelete', () => {
    component.productToDelete = null;

    component.confirmDelete();

    expect(productServiceMock.deleteProduct).not.toHaveBeenCalled();
  });

  it('should close modal', () => {
    component.productToDelete = { id: '1' } as any;
    component.showModal = true;

    component.closeModal();

    expect(component.productToDelete).toBeNull();
    expect(component.showModal).toBe(false);
  });

  it('should toggle menu', () => {
    component.toggleMenu('1');
    expect(component.activeMenu).toBe('1');

    component.toggleMenu('1');
    expect(component.activeMenu).toBeNull();
  });

  it('should return first two uppercase letters', () => {
    expect(component.getInitials('angular')).toBe('AN');
    expect(component.getInitials('')).toBe('');
  });

  it('should navigate to create', () => {
    component.create();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/products/create']);
  });

  it('should navigate to edit', () => {
    component.edit({ id: '1' } as any);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/products/edit', '1']);
  });

  it('should change page size', () => {
    component.onPageSizeChange('10');
    expect(component.pageSize()).toBe(10);
  });

  it('should return product id in trackById', () => {
    const result = component.trackById(0, { id: 'abc' } as any);
    expect(result).toBe('abc');
  });

});
