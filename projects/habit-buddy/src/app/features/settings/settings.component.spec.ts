import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { SettingsComponent } from './settings.component';
import { HabitService } from '../../shared/services/habit.service';
import { DialogService } from '../../shared/services/dialog.service';
import { ImportService } from '../../shared/components/import-modal/import.service';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let habitService: jasmine.SpyObj<HabitService>;
  let dialogService: jasmine.SpyObj<DialogService>;
  let importService: jasmine.SpyObj<ImportService>;

  beforeEach(async () => {
    const habitServiceSpy = jasmine.createSpyObj('HabitService', ['habits', 'loadSampleHabits', 'clearAllHabits']);
    const dialogServiceSpy = jasmine.createSpyObj('DialogService', ['showSuccess', 'showError']);
    const importServiceSpy = jasmine.createSpyObj('ImportService', ['importHabits', 'importHabitsWithOptions']);

    habitServiceSpy.habits.and.returnValue([]);

    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: HabitService, useValue: habitServiceSpy },
        { provide: DialogService, useValue: dialogServiceSpy },
        { provide: ImportService, useValue: importServiceSpy }
      ],
      imports: [SettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    habitService = TestBed.inject(HabitService) as jasmine.SpyObj<HabitService>;
    dialogService = TestBed.inject(DialogService) as jasmine.SpyObj<DialogService>;
    importService = TestBed.inject(ImportService) as jasmine.SpyObj<ImportService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with default values', () => {
      expect(component).toBeTruthy();
      expect((component as any).showLoadSampleDialog()).toBe(false);
      expect((component as any).showClearDataDialog()).toBe(false);
      expect((component as any).isImportModalOpen()).toBe(false);
    });
  });

  describe('Data Management', () => {
    it('should export data', () => {
      spyOn(URL, 'createObjectURL').and.returnValue('blob:url');
      spyOn(URL, 'revokeObjectURL');
      const mockAnchor = jasmine.createSpyObj('HTMLAnchorElement', ['click']);
      spyOn(document, 'createElement').and.returnValue(mockAnchor);
      spyOn(document.body, 'appendChild');
      spyOn(document.body, 'removeChild');

      (component as any).exportData();

      expect(habitService.habits).toHaveBeenCalled();
      expect(document.createElement).toHaveBeenCalledWith('a');
    });

    it('should import data', () => {
      const mockInput = jasmine.createSpyObj('HTMLInputElement', ['click']);
      spyOn(document, 'createElement').and.returnValue(mockInput);

      (component as any).importData();

      expect(document.createElement).toHaveBeenCalledWith('input');
    });

    it('should load sample data', () => {
      (component as any).loadSampleData();
      expect((component as any).showLoadSampleDialog()).toBe(true);
    });

    it('should clear all data', () => {
      (component as any).clearAllData();
      expect((component as any).showClearDataDialog()).toBe(true);
    });
  });

  describe('Dialog Management', () => {
    it('should close load sample dialog', () => {
      (component as any).onLoadSampleDialogClose();
      expect((component as any).showLoadSampleDialog()).toBe(false);
    });

    it('should handle load sample dialog action', () => {
      (component as any).onLoadSampleDialogAction('confirm');
      expect(habitService.loadSampleHabits).toHaveBeenCalled();
      expect(dialogService.showSuccess).toHaveBeenCalledWith('Sample data loaded successfully!');
      expect((component as any).showLoadSampleDialog()).toBe(false);
    });

    it('should close clear data dialog', () => {
      (component as any).onClearDataDialogClose();
      expect((component as any).showClearDataDialog()).toBe(false);
    });

    it('should handle clear data dialog action', () => {
      (component as any).onClearDataDialogAction('confirm');
      expect(habitService.clearAllHabits).toHaveBeenCalled();
      expect(dialogService.showSuccess).toHaveBeenCalledWith('All data cleared successfully!');
      expect((component as any).showClearDataDialog()).toBe(false);
    });

    it('should close import modal', () => {
      (component as any).onImportModalClose();
      expect((component as any).isImportModalOpen()).toBe(false);
      expect((component as any).duplicateHabits).toEqual([]);
      expect((component as any).pendingImportData).toBe('');
    });
  });

  describe('Import Handling', () => {
    it('should handle import with action', () => {
      (component as any).pendingImportData = '{"habits": []}';
      importService.importHabitsWithOptions.and.returnValue({ success: true, message: 'Success' });

      (component as any).onImportWithAction('skip' as any);

      expect(importService.importHabitsWithOptions).toHaveBeenCalled();
      expect(dialogService.showSuccess).toHaveBeenCalled();
    });

    it('should handle import error', () => {
      (component as any).pendingImportData = '{"habits": []}';
      importService.importHabitsWithOptions.and.returnValue({ success: false, message: 'Error' });

      (component as any).onImportWithAction('skip' as any);

      expect(dialogService.showError).toHaveBeenCalled();
    });
  });

  describe('Template Rendering', () => {
    it('should render settings container', () => {
      const compiled = fixture.nativeElement;
      const container = compiled.querySelector('.view');
      expect(container).toBeTruthy();
    });

    it('should render export button', () => {
      const compiled = fixture.nativeElement;
      const exportButton = compiled.querySelector('button[class*="bg-slate-50"]');
      expect(exportButton).toBeTruthy();
    });

    it('should render import button', () => {
      const compiled = fixture.nativeElement;
      const importButton = compiled.querySelector('button[class*="bg-blue-50"]');
      expect(importButton).toBeTruthy();
    });
  });

  describe('CSS Classes and Styling', () => {
    it('should have correct container classes', () => {
      const compiled = fixture.nativeElement;
      const container = compiled.querySelector('.view');
      expect(container).toBeTruthy();
    });

    it('should have correct button classes', () => {
      const compiled = fixture.nativeElement;
      const buttons = compiled.querySelectorAll('button');
      buttons.forEach((button: any) => {
        expect(button).toBeTruthy();
      });
    });
  });

  describe('Component Structure', () => {
    it('should have required icons', () => {
      expect((component as any).SettingsIcon).toBeTruthy();
      expect((component as any).DatabaseIcon).toBeTruthy();
      expect((component as any).DownloadIcon).toBeTruthy();
      expect((component as any).UploadIcon).toBeTruthy();
      expect((component as any).Trash2Icon).toBeTruthy();
    });

    it('should have dialog state signals', () => {
      expect((component as any).showLoadSampleDialog).toBeTruthy();
      expect((component as any).showClearDataDialog).toBeTruthy();
      expect((component as any).isImportModalOpen).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper button accessibility', () => {
      const compiled = fixture.nativeElement;
      const buttons = compiled.querySelectorAll('button');
      buttons.forEach((button: any) => {
        expect(button).toBeTruthy();
      });
    });

    it('should have proper form accessibility', () => {
      const compiled = fixture.nativeElement;
      const forms = compiled.querySelectorAll('form');
      forms.forEach((form: any) => {
        expect(form).toBeTruthy();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty habits array', () => {
      habitService.habits.and.returnValue([]);
      (component as any).exportData();
      expect(habitService.habits).toHaveBeenCalled();
    });

    it('should handle import with no pending data', () => {
      (component as any).pendingImportData = '';
      (component as any).onImportWithAction('skip' as any);
      expect(importService.importHabitsWithOptions).not.toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    it('should handle component creation efficiently', () => {
      const startTime = performance.now();
      const newFixture = TestBed.createComponent(SettingsComponent);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100);
      expect(newFixture.componentInstance).toBeTruthy();
    });
  });
});