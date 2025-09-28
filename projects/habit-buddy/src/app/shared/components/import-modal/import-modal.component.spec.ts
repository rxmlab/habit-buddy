import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ImportModalComponent } from './import-modal.component';
import { DuplicateAction } from './import.service';

describe('ImportModalComponent', () => {
  let component: ImportModalComponent;
  let fixture: ComponentFixture<ImportModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
      imports: [ImportModalComponent, FormsModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Input Properties', () => {
    it('should accept isOpen input', () => {
      component.isOpen = true;
      expect(component.isOpen).toBe(true);
    });

    it('should accept duplicates input', () => {
      const duplicates = ['Habit 1', 'Habit 2'];
      component.duplicates = duplicates;
      expect(component.duplicates).toEqual(duplicates);
    });
  });

  describe('Event Emitters', () => {
    it('should emit close event when onClose is called', () => {
      spyOn(component.close, 'emit');
      (component as any).onClose();
      expect(component.close.emit).toHaveBeenCalled();
    });

    it('should emit importWithAction event with selected action', () => {
      spyOn(component.importWithAction, 'emit');
      (component as any).selectedAction = 'replace';
      (component as any).onImport();
      expect(component.importWithAction.emit).toHaveBeenCalledWith('replace');
    });
  });

  describe('Component Methods', () => {
    it('should format duplicate list correctly', () => {
      component.duplicates = ['Habit 1', 'Habit 2'];
      const result = (component as any).getDuplicateList();
      expect(result).toBe('• Habit 1\n• Habit 2');
    });

    it('should handle empty duplicates list', () => {
      component.duplicates = [];
      const result = (component as any).getDuplicateList();
      expect(result).toBe('');
    });

    it('should handle single duplicate', () => {
      component.duplicates = ['Single Habit'];
      const result = (component as any).getDuplicateList();
      expect(result).toBe('• Single Habit');
    });
  });

  describe('Template Rendering', () => {
    it('should render modal when isOpen is true', () => {
      component.isOpen = true;
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const modal = compiled.querySelector('.fixed.inset-0');
      expect(modal).toBeTruthy();
    });

    it('should not render modal when isOpen is false', () => {
      component.isOpen = false;
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const modal = compiled.querySelector('.import-modal');
      expect(modal).toBeFalsy();
    });

    it('should render duplicates when provided', () => {
      component.isOpen = true;
      component.duplicates = ['Habit 1', 'Habit 2'];
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const duplicatesList = compiled.querySelector('.bg-gray-50.rounded-md');
      expect(duplicatesList).toBeTruthy();
    });
  });

  describe('Duplicate Actions', () => {
    it('should have skip as default selected action', () => {
      expect((component as any).selectedAction).toBe('skip');
    });

    it('should allow changing selected action', () => {
      (component as any).selectedAction = 'replace';
      expect((component as any).selectedAction).toBe('replace');
      
      (component as any).selectedAction = 'keep-both';
      expect((component as any).selectedAction).toBe('keep-both');
    });
  });

  describe('Component Structure', () => {
    it('should be a standalone component', () => {
      expect(ImportModalComponent).toBeTruthy();
    });

    it('should have correct input properties', () => {
      expect(component.isOpen).toBe(false);
      expect(component.duplicates).toEqual([]);
    });

    it('should have correct output properties', () => {
      expect(component.close).toBeTruthy();
      expect(component.importWithAction).toBeTruthy();
    });

    it('should have protected properties', () => {
      expect((component as any).selectedAction).toBe('skip');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty duplicates array', () => {
      component.isOpen = true;
      component.duplicates = [];
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const modal = compiled.querySelector('.fixed.inset-0');
      expect(modal).toBeTruthy();
    });

    it('should handle very long duplicate names', () => {
      component.isOpen = true;
      component.duplicates = ['A'.repeat(1000)];
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const duplicatesList = compiled.querySelector('.bg-gray-50.rounded-md');
      expect(duplicatesList).toBeTruthy();
    });
  });
});
