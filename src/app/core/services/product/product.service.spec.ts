import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { Product } from '../../models/product.model';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService],
    });

    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch products', () => {
    service.getProducts().subscribe(response => {
      expect(response.data.length).toBe(1);
    });

    const req = httpMock.expectOne(r => r.method === 'GET');
    expect(req.request.url).toContain('/products');

    req.flush({
      data: [
        {
          id: '1',
          name: 'Test',
          description: 'Desc',
          logo: '',
          date_release: '',
          date_revision: '',
        },
      ],
    });
  });

  it('should create a product', () => {
    const product: Product = {
      id: '1',
      name: 'Test',
      description: 'Desc',
      logo: '',
      date_release: '',
      date_revision: '',
    };

    service.createProduct(product).subscribe(response => {
      expect(response.data.id).toBe('1');
    });

    const req = httpMock.expectOne(r => r.method === 'POST');
    expect(req.request.url).toContain('/products');

    req.flush({
      message: 'Product added successfully',
      data: product,
    });
  });

  it('should update a product', () => {
    service.updateProduct('1', { name: 'Updated' }).subscribe(response => {
      expect(response.data.name).toBe('Updated');
    });

    const req = httpMock.expectOne(r => r.method === 'PUT');
    expect(req.request.url).toContain('/products/1');

    req.flush({
      message: 'Product updated successfully',
      data: { name: 'Updated' },
    });
  });

  it('should delete a product', () => {
    service.deleteProduct('1').subscribe(response => {
      expect(response).toBeDefined();
    });

    const req = httpMock.expectOne(r => r.method === 'DELETE');
    expect(req.request.url).toContain('/products/1');

    req.flush({
      message: 'Product removed successfully',
      data: null,
    });
  });

  it('should verify product id', () => {
    service.verifyProductId('1').subscribe(exists => {
      expect(exists).toBe(true);
    });

    const req = httpMock.expectOne(r =>
      r.url.includes('/verification/1')
    );

    req.flush(true);
  });
});
