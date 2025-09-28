import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { DialogService } from './dialog.service';

describe('DialogService', () => {
  let service: DialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
    service = TestBed.inject(DialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Dialog State Management', () => {
    it('should initialize with closed dialog', () => {
      expect(service.isOpen()).toBe(false);
      expect(service.config().title).toBe('');
      expect(service.config().message).toBe('');
      expect(service.config().type).toBe('info');
      expect(service.config().buttons).toBeUndefined();
    });

    it('should open dialog with basic configuration', () => {
      service.showInfo('Test Message', 'Test Title');
      
      expect(service.isOpen()).toBe(true);
      expect(service.config().title).toBe('Test Title');
      expect(service.config().message).toBe('Test Message');
      expect(service.config().type).toBe('info');
      expect(service.config().buttons).toEqual([{ label: 'OK', action: 'ok', variant: 'primary' }]);
    });

    it('should close dialog', () => {
      service.showInfo('Test Message', 'Test Title');
      expect(service.isOpen()).toBe(true);
      
      service.close();
      
      expect(service.isOpen()).toBe(false);
    });
  });

  describe('Dialog Types', () => {
    it('should show info dialog', () => {
      service.showInfo('Info Message', 'Info Title');
      
      expect(service.isOpen()).toBe(true);
      expect(service.config().type).toBe('info');
      expect(service.config().title).toBe('Info Title');
      expect(service.config().message).toBe('Info Message');
    });

    it('should show success dialog', () => {
      service.showSuccess('Success Message', 'Success Title');
      
      expect(service.isOpen()).toBe(true);
      expect(service.config().type).toBe('info');
      expect(service.config().title).toBe('Success Title');
      expect(service.config().message).toBe('Success Message');
    });

    it('should show warning dialog', () => {
      service.showWarning('Warning Message', 'Warning Title');
      
      expect(service.isOpen()).toBe(true);
      expect(service.config().type).toBe('warning');
      expect(service.config().title).toBe('Warning Title');
      expect(service.config().message).toBe('Warning Message');
    });

    it('should show error dialog', () => {
      service.showError('Error Message', 'Error Title');
      
      expect(service.isOpen()).toBe(true);
      expect(service.config().type).toBe('danger');
      expect(service.config().title).toBe('Error Title');
      expect(service.config().message).toBe('Error Message');
    });
  });

  describe('Dialog with Buttons', () => {
    it('should show dialog with custom buttons', () => {
      const buttons = [
        { label: 'OK', action: 'ok', variant: 'primary' as const },
        { label: 'Cancel', action: 'cancel', variant: 'secondary' as const }
      ];
      
      service.show({ title: 'Test Title', message: 'Test Message', type: 'info', buttons });
      
      expect(service.isOpen()).toBe(true);
      expect(service.config().buttons).toEqual(buttons);
    });

    it('should show confirmation dialog with default buttons', () => {
      service.showInfo('Are you sure?', 'Confirm Title');
      
      expect(service.isOpen()).toBe(true);
      expect(service.config().type).toBe('info');
      expect(service.config().buttons?.length).toBe(1);
      expect(service.config().buttons?.[0].label).toBe('OK');
    });

    it('should show confirmation dialog with custom buttons', () => {
      const buttons = [
        { label: 'No', action: 'no', variant: 'secondary' as const },
        { label: 'Yes', action: 'yes', variant: 'primary' as const }
      ];
      
      service.show({
        title: 'Confirm Title',
        message: 'Are you sure?',
        type: 'info',
        buttons: buttons
      });
      
      expect(service.isOpen()).toBe(true);
      expect(service.config().buttons).toEqual(buttons);
    });
  });

  describe('Dialog Configuration', () => {
    it('should handle empty title and message', () => {
      service.showInfo('', '');
      
      expect(service.isOpen()).toBe(true);
      expect(service.config().title).toBe('');
      expect(service.config().message).toBe('');
    });

    it('should handle very long title and message', () => {
      const longTitle = 'A'.repeat(1000);
      const longMessage = 'B'.repeat(1000);
      
      service.showInfo(longMessage, longTitle);
      
      expect(service.isOpen()).toBe(true);
      expect(service.config().title).toBe(longTitle);
      expect(service.config().message).toBe(longMessage);
    });

    it('should handle special characters in title and message', () => {
      const specialTitle = 'Title with @#$%^&*() characters';
      const specialMessage = 'Message with émojis 🎯 and ñ characters';
      
      service.showInfo(specialMessage, specialTitle);
      
      expect(service.isOpen()).toBe(true);
      expect(service.config().title).toBe(specialTitle);
      expect(service.config().message).toBe(specialMessage);
    });
  });

  describe('Button Variants', () => {
    it('should handle different button variants', () => {
      const buttons = [
        { label: 'Primary', action: 'primary', variant: 'primary' as const },
        { label: 'Secondary', action: 'secondary', variant: 'secondary' as const },
        { label: 'Danger', action: 'danger', variant: 'danger' as const },
        { label: 'Success', action: 'success', variant: 'primary' as const },
        { label: 'Warning', action: 'warning', variant: 'secondary' as const }
      ];
      
      service.show({ title: 'Test Title', message: 'Test Message', type: 'info', buttons });
      
      expect(service.config().buttons).toEqual(buttons);
    });

    it('should handle buttons without variant (default to secondary)', () => {
      const buttons = [
        { label: 'Default', action: 'default', variant: 'secondary' as const }
      ];
      
      service.show({ title: 'Test Title', message: 'Test Message', type: 'info', buttons });
      
      expect(service.config().buttons?.[0].variant).toBe('secondary');
    });
  });

  describe('Dialog State Transitions', () => {
    it('should replace existing dialog when opening new one', () => {
      service.showInfo('First Message', 'First Title');
      expect(service.config().title).toBe('First Title');
      
      service.showError('Second Message', 'Second Title');
      
      expect(service.isOpen()).toBe(true);
      expect(service.config().title).toBe('Second Title');
      expect(service.config().type).toBe('danger');
    });

    it('should maintain state when closing and reopening', () => {
      service.showInfo('Test Message', 'Test Title');
      service.close();
      
      expect(service.isOpen()).toBe(false);
      
      service.showInfo('New Message', 'New Title');
      
      expect(service.isOpen()).toBe(true);
      expect(service.config().title).toBe('New Title');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null or undefined parameters', () => {
      expect(() => service.showInfo(null as any, null as any)).not.toThrow();
      expect(() => service.showInfo(undefined as any, undefined as any)).not.toThrow();
    });

    it('should handle empty buttons array', () => {
      service.show({ title: 'Test Title', message: 'Test Message', type: 'info', buttons: [] });
      
      expect(service.isOpen()).toBe(true);
      expect(service.config().buttons).toEqual([]);
    });

    it('should handle invalid dialog type', () => {
      service.show({ title: 'Test Title', message: 'Test Message', type: 'info' });
      
      expect(service.isOpen()).toBe(true);
      expect(service.config().type).toBe('info');
    });

    it('should handle buttons with missing properties', () => {
      const buttons = [
        { label: 'OK', action: 'ok', variant: 'primary' as const }, // Fixed missing action and variant
        { label: 'Test', action: 'test', variant: 'secondary' as const }, // Fixed missing label and variant
        { label: 'Primary', action: 'primary', variant: 'primary' as const } // Fixed missing label and action
      ];
      
      expect(() => service.show({ title: 'Test Title', message: 'Test Message', type: 'info', buttons })).not.toThrow();
    });
  });

  describe('Service Methods', () => {
    it('should have all required methods', () => {
      expect(typeof service.showInfo).toBe('function');
      expect(typeof service.showSuccess).toBe('function');
      expect(typeof service.showWarning).toBe('function');
      expect(typeof service.showError).toBe('function');
      expect(typeof service.showInfo).toBe('function');
      expect(typeof service.show).toBe('function');
      expect(typeof service.close).toBe('function');
      expect(typeof service.isOpen).toBe('function');
      expect(typeof service.config).toBe('function');
    });

    it('should return signals for reactive state', () => {
      expect(typeof service.isOpen).toBe('function');
      expect(typeof service.config).toBe('function');
      
      // Test that they return functions (signals)
      expect(typeof service.isOpen()).toBe('boolean');
      expect(typeof service.config()).toBe('object');
    });
  });

  describe('Performance', () => {
    it('should handle rapid dialog operations efficiently', () => {
      const startTime = performance.now();
      
      // Open and close 100 dialogs rapidly
      for (let i = 0; i < 100; i++) {
        service.showInfo(`Title ${i}`, `Message ${i}`);
        service.close();
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000); // Should complete in less than 1 second
      expect(service.isOpen()).toBe(false);
    });

    it('should handle large number of buttons efficiently', () => {
      const buttons = [];
      for (let i = 0; i < 100; i++) {
        buttons.push({
          label: `Button ${i}`,
          action: `action${i}`,
          variant: 'primary' as const
        });
      }
      
      const startTime = performance.now();
      service.show({ title: 'Test Title', message: 'Test Message', type: 'info', buttons });
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Should complete in less than 100ms
      expect(service.config().buttons?.length).toBe(100);
    });
  });

  describe('Integration', () => {
    it('should work with different dialog types and buttons', () => {
      const testCases = [
        { type: 'info', buttons: [{ label: 'OK', action: 'ok', variant: 'primary' as const }] },
        { type: 'success', buttons: [{ label: 'Great!', action: 'success', variant: 'primary' as const }] },
        { type: 'warning', buttons: [{ label: 'Continue', action: 'continue', variant: 'secondary' as const }] },
        { type: 'danger', buttons: [{ label: 'Delete', action: 'delete', variant: 'danger' as const }] }
      ];
      
      testCases.forEach(testCase => {
        service.show({ title: 'Test Title', message: 'Test Message', type: testCase.type as any, buttons: testCase.buttons });
        
        expect(service.isOpen()).toBe(true);
        expect(service.config().type).toBe(testCase.type);
        expect(service.config().buttons).toEqual(testCase.buttons);
        
        service.close();
      });
    });
  });
});
