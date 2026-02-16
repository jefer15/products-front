import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AlertService } from './alert.service';

describe('AlertService', () => {
  let service: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlertService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set message and type when show is called', () => {
    service.show('Test message', 'success');

    expect(service.message()).toBe('Test message');
    expect(service.type()).toBe('success');
  });

  it('should default type to info if not provided', () => {
    service.show('Info message');

    expect(service.message()).toBe('Info message');
    expect(service.type()).toBe('info');
  });

  it('should clear message manually', () => {
    service.show('Temporary message', 'error');

    service.clear();

    expect(service.message()).toBeNull();
  });

  it('should clear message automatically after 2 seconds', fakeAsync(() => {
    service.show('Auto clear message', 'success');

    expect(service.message()).toBe('Auto clear message');

    tick(2000);

    expect(service.message()).toBeNull();
  }));
});
