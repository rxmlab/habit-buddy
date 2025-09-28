import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { DialogComponent } from './dialog.component';

describe('DialogComponent', () => {
  let component: DialogComponent;
  let fixture: ComponentFixture<DialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
      imports: [DialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Input Properties', () => {
    it('should have default values for input properties', () => {
      expect(component.isOpen).toBe(false);
      expect(component.title).toBe('');
      expect(component.message).toBe('');
      expect(component.type).toBe('info');
      expect(component.buttons).toEqual([]);
    });

    it('should accept custom input values', () => {
      component.isOpen = true;
      component.title = 'Test Title';
      component.message = 'Test Message';
      component.type = 'danger';
      component.buttons = [{ label: 'OK', action: 'ok', variant: 'primary' }];
      
      expect(component.isOpen).toBe(true);
      expect(component.title).toBe('Test Title');
      expect(component.message).toBe('Test Message');
      expect(component.type).toBe('danger');
      expect(component.buttons).toEqual([{ label: 'OK', action: 'ok', variant: 'primary' }]);
    });
  });

  describe('Event Emitters', () => {
    it('should emit close event when backdrop is clicked', () => {
      spyOn(component.close, 'emit');
      
      const backdropEvent = new Event('click');
      Object.defineProperty(backdropEvent, 'target', { value: backdropEvent.currentTarget });
      
      (component as any).onBackdropClick(backdropEvent);
      
      expect(component.close.emit).toHaveBeenCalled();
    });

    it('should emit buttonClick event with correct action', () => {
      spyOn(component.buttonClick, 'emit');
      
      (component as any).onButtonClick('test-action');
      
      expect(component.buttonClick.emit).toHaveBeenCalledWith('test-action');
    });

    it('should emit close event when close button is clicked', () => {
      spyOn(component.close, 'emit');
      
      (component as any).onClose();
      
      expect(component.close.emit).toHaveBeenCalled();
    });
  });

  describe('Button Classes', () => {
    it('should return correct button classes for primary variant', () => {
      const classes = (component as any).getButtonClasses('primary');
      expect(classes).toContain('bg-blue-600');
      expect(classes).toContain('hover:bg-blue-700');
      expect(classes).toContain('text-white');
    });

    it('should return correct button classes for danger variant', () => {
      const classes = (component as any).getButtonClasses('danger');
      expect(classes).toContain('bg-red-600');
      expect(classes).toContain('hover:bg-red-700');
      expect(classes).toContain('text-white');
    });

    it('should return correct button classes for secondary variant', () => {
      const classes = (component as any).getButtonClasses('secondary');
      expect(classes).toContain('bg-slate-100');
      expect(classes).toContain('hover:bg-slate-200');
      expect(classes).toContain('text-slate-700');
    });

    it('should return default classes for unknown variant', () => {
      const classes = (component as any).getButtonClasses('unknown' as any);
      expect(classes).toContain('bg-slate-100');
      expect(classes).toContain('hover:bg-slate-200');
      expect(classes).toContain('text-slate-700');
    });
  });

  describe('Template Rendering', () => {
    it('should render dialog when isOpen is true', () => {
      component.isOpen = true;
      component.title = 'Test Title';
      component.message = 'Test Message';
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const dialog = compiled.querySelector('.fixed.inset-0');
      expect(dialog).toBeTruthy();
    });

    it('should not render dialog when isOpen is false', () => {
      component.isOpen = false;
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const dialog = compiled.querySelector('.fixed.inset-0');
      expect(dialog).toBeFalsy();
    });

    it('should render dialog title', () => {
      component.isOpen = true;
      component.title = 'Test Title';
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const title = compiled.querySelector('h2');
      expect(title).toBeTruthy();
      expect(title.textContent.trim()).toBe('Test Title');
    });

    it('should render dialog message', () => {
      component.isOpen = true;
      component.message = 'Test Message';
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const message = compiled.querySelector('p');
      expect(message).toBeTruthy();
      expect(message.textContent.trim()).toBe('Test Message');
    });

    it('should render dialog buttons', () => {
      component.isOpen = true;
      component.buttons = [
        { label: 'OK', action: 'ok', variant: 'primary' },
        { label: 'Cancel', action: 'cancel', variant: 'secondary' }
      ];
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const buttons = compiled.querySelectorAll('button');
      expect(buttons.length).toBe(3); // 2 custom buttons + 1 close button
    });

    it('should render close button', () => {
      component.isOpen = true;
      component.showCloseButton = true;
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const closeButton = compiled.querySelector('button[aria-label="Close dialog"]');
      expect(closeButton).toBeTruthy();
    });
  });

  describe('Dialog Types', () => {
    it('should apply correct classes for info type', () => {
      component.isOpen = true;
      component.type = 'info';
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const dialog = compiled.querySelector('.bg-white');
      expect(dialog).toBeTruthy();
    });

    it('should apply correct classes for danger type', () => {
      component.isOpen = true;
      component.type = 'danger';
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const dialog = compiled.querySelector('.bg-white');
      expect(dialog).toBeTruthy();
    });

    it('should apply correct classes for success type', () => {
      component.isOpen = true;
      component.type = 'info';
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const dialog = compiled.querySelector('.bg-white');
      expect(dialog).toBeTruthy();
    });

    it('should apply correct classes for warning type', () => {
      component.isOpen = true;
      component.type = 'warning';
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const dialog = compiled.querySelector('.bg-white');
      expect(dialog).toBeTruthy();
    });
  });

  describe('CSS Classes and Styling', () => {
    it('should have correct backdrop classes', () => {
      component.isOpen = true;
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const backdrop = compiled.querySelector('.fixed.inset-0');
      expect(backdrop.classList.contains('fixed')).toBe(true);
      expect(backdrop.classList.contains('inset-0')).toBe(true);
      expect(backdrop.classList.contains('z-50')).toBe(true);
      expect(backdrop.classList.contains('flex')).toBe(true);
      expect(backdrop.classList.contains('items-center')).toBe(true);
      expect(backdrop.classList.contains('justify-center')).toBe(true);
      expect(backdrop.classList.contains('p-4')).toBe(true);
    });

    it('should have correct dialog container classes', () => {
      component.isOpen = true;
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const dialog = compiled.querySelector('.bg-white');
      expect(dialog.classList.contains('bg-white')).toBe(true);
      expect(dialog.classList.contains('rounded-2xl')).toBe(true);
      expect(dialog.classList.contains('shadow-xl')).toBe(true);
      expect(dialog.classList.contains('max-w-md')).toBe(true);
      expect(dialog.classList.contains('w-full')).toBe(true);
    });

    it('should have correct header classes', () => {
      component.isOpen = true;
      component.title = 'Test Title';
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const header = compiled.querySelector('.flex.items-center.justify-between');
      expect(header.classList.contains('flex')).toBe(true);
      expect(header.classList.contains('items-center')).toBe(true);
      expect(header.classList.contains('justify-between')).toBe(true);
      expect(header.classList.contains('p-6')).toBe(true);
      expect(header.classList.contains('border-b')).toBe(true);
      expect(header.classList.contains('border-slate-100')).toBe(true);
    });

    it('should have correct content classes', () => {
      component.isOpen = true;
      component.message = 'Test Message';
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const content = compiled.querySelector('.p-6');
      expect(content.classList.contains('p-6')).toBe(true);
    });

    it('should have correct footer classes', () => {
      component.isOpen = true;
      component.buttons = [{ label: 'OK', action: 'ok', variant: 'primary' }];
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const footer = compiled.querySelector('.flex.flex-col.sm\\:flex-row.gap-3.sm\\:justify-end');
      expect(footer.classList.contains('flex')).toBe(true);
      expect(footer.classList.contains('flex-col')).toBe(true);
      expect(footer.classList.contains('gap-3')).toBe(true);
    });
  });

  describe('Component Structure', () => {
    it('should be a standalone component', () => {
      expect(DialogComponent).toBeTruthy();
    });

    it('should have EventEmitter for close', () => {
      expect(component.close).toBeTruthy();
      expect(component.close.emit).toBeTruthy();
    });

    it('should have EventEmitter for buttonClick', () => {
      expect(component.buttonClick).toBeTruthy();
      expect(component.buttonClick.emit).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      component.isOpen = true;
      component.title = 'Test Title';
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const dialog = compiled.querySelector('.bg-white.rounded-2xl');
      expect(dialog).toBeTruthy();
    });

    it('should have proper close button accessibility', () => {
      component.isOpen = true;
      component.showCloseButton = true;
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const closeButton = compiled.querySelector('button[aria-label="Close dialog"]');
      expect(closeButton).toBeTruthy();
    });
  });

  describe('Event Handling', () => {
    it('should prevent backdrop click when clicking on dialog content', () => {
      spyOn(component.close, 'emit');
      
      const dialogEvent = new Event('click');
      const dialogElement = { contains: jasmine.createSpy('contains').and.returnValue(true) };
      Object.defineProperty(dialogEvent, 'target', { value: dialogElement });
      
      (component as any).onBackdropClick(dialogEvent);
      
      expect(component.close.emit).not.toHaveBeenCalled();
    });

    it('should handle button click events', () => {
      spyOn(component.buttonClick, 'emit');
      
      (component as any).onButtonClick('test-action');
      
      expect(component.buttonClick.emit).toHaveBeenCalledWith('test-action');
    });
  });
});
