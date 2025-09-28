import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { signal } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { LayoutComponent } from './layout.component';
import { DialogService } from '../../../shared/services/dialog.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { HabitService } from '../../../shared/services/habit.service';

describe('LayoutComponent', () => {
  let component: LayoutComponent;
  let fixture: ComponentFixture<LayoutComponent>;
  let dialogService: jasmine.SpyObj<DialogService>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let habitService: jasmine.SpyObj<HabitService>;

  beforeEach(async () => {
    const dialogServiceSpy = jasmine.createSpyObj('DialogService', ['close'], {
      isOpen: signal(false),
      config: signal({ title: '', message: '', type: 'info', buttons: [] })
    });

    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', [
      'closeReminderDialog', 'markHabitAsDone', 'snoozeReminder'
    ], {
      showReminderDialog: signal(false),
      currentReminderHabit: signal(null),
      currentReminder: signal(null)
    });

    const habitServiceSpy = jasmine.createSpyObj('HabitService', ['toggleCheckinToday']);

    await TestBed.configureTestingModule({
      imports: [LayoutComponent, RouterTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        { provide: SwUpdate, useValue: jasmine.createSpyObj('SwUpdate', ['checkForUpdate', 'activateUpdate']) },
        { provide: DialogService, useValue: dialogServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: HabitService, useValue: habitServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutComponent);
    component = fixture.componentInstance;
    dialogService = TestBed.inject(DialogService) as jasmine.SpyObj<DialogService>;
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    habitService = TestBed.inject(HabitService) as jasmine.SpyObj<HabitService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Dialog Management', () => {
    it('should close dialog when onGlobalDialogAction is called', () => {
      (component as any).onGlobalDialogAction('test-action');
      expect(dialogService.close).toHaveBeenCalled();
    });

    it('should handle dialog button clicks', () => {
      (component as any).onGlobalDialogAction('confirm');
      expect(dialogService.close).toHaveBeenCalled();
    });
  });

  describe('Reminder Dialog Management', () => {
    it('should close reminder dialog when onReminderDialogClose is called', () => {
      (component as any).onReminderDialogClose();
      expect(notificationService.closeReminderDialog).toHaveBeenCalled();
    });

    it('should mark habit as done when onMarkHabitAsDone is called', async () => {
      const habitId = 'test-habit-id';
      habitService.toggleCheckinToday.and.returnValue(Promise.resolve({ success: true }));
      
      await (component as any).onMarkHabitAsDone(habitId);
      
      expect(notificationService.markHabitAsDone).toHaveBeenCalledWith(habitId);
    });

    it('should snooze reminder when onSnoozeReminder is called', () => {
      const habitId = 'test-habit-id';
      
      (component as any).onSnoozeReminder(habitId);
      
      expect(notificationService.snoozeReminder).toHaveBeenCalledWith(habitId);
    });
  });

  describe('Template Rendering', () => {
    it('should render sidebar for desktop view', () => {
      const compiled = fixture.nativeElement;
      const sidebar = compiled.querySelector('app-sidebar');
      expect(sidebar).toBeTruthy();
      expect(sidebar.classList.contains('hidden')).toBe(true);
      expect(sidebar.classList.contains('md:flex')).toBe(true);
    });

    it('should render header for mobile view', () => {
      const compiled = fixture.nativeElement;
      const header = compiled.querySelector('app-header');
      expect(header).toBeTruthy();
      expect(header.classList.contains('md:hidden')).toBe(true);
    });

    it('should render bottom navigation for mobile view', () => {
      const compiled = fixture.nativeElement;
      const bottomNav = compiled.querySelector('app-bottom-nav');
      expect(bottomNav).toBeTruthy();
      expect(bottomNav.classList.contains('md:hidden')).toBe(true);
    });

    it('should render router outlet for main content', () => {
      const compiled = fixture.nativeElement;
      const routerOutlet = compiled.querySelector('router-outlet');
      expect(routerOutlet).toBeTruthy();
    });

    it('should render global help component', () => {
      const compiled = fixture.nativeElement;
      const globalHelp = compiled.querySelector('app-global-help');
      expect(globalHelp).toBeTruthy();
    });

    it('should render PWA prompt component', () => {
      const compiled = fixture.nativeElement;
      const pwaPrompt = compiled.querySelector('app-pwa-prompt');
      expect(pwaPrompt).toBeTruthy();
    });

    it('should render dialog component with correct bindings', () => {
      const compiled = fixture.nativeElement;
      const dialog = compiled.querySelector('app-dialog');
      expect(dialog).toBeTruthy();
    });

    it('should render reminder dialog component with correct bindings', () => {
      const compiled = fixture.nativeElement;
      const reminderDialog = compiled.querySelector('app-reminder-dialog');
      expect(reminderDialog).toBeTruthy();
    });

    it('should render audio element for notifications', () => {
      const compiled = fixture.nativeElement;
      const audio = compiled.querySelector('audio#ding');
      expect(audio).toBeTruthy();
      expect(audio.src).toContain('digital_watch_alarm_long.ogg');
    });

    it('should render modals container', () => {
      const compiled = fixture.nativeElement;
      const modalsContainer = compiled.querySelector('#modals');
      expect(modalsContainer).toBeTruthy();
    });
  });

  describe('Layout Structure', () => {
    it('should have correct main container classes', () => {
      const compiled = fixture.nativeElement;
      const mainContainer = compiled.querySelector('.h-screen.flex.flex-col.md\\:flex-row');
      expect(mainContainer).toBeTruthy();
    });

    it('should have correct main content classes', () => {
      const compiled = fixture.nativeElement;
      const mainContent = compiled.querySelector('main');
      expect(mainContent.classList.contains('flex-1')).toBe(true);
      expect(mainContent.classList.contains('p-4')).toBe(true);
      expect(mainContent.classList.contains('md:p-6')).toBe(true);
      expect(mainContent.classList.contains('overflow-y-auto')).toBe(true);
      expect(mainContent.classList.contains('md:h-full')).toBe(true);
      expect(mainContent.classList.contains('pb-24')).toBe(true);
      expect(mainContent.classList.contains('md:pb-6')).toBe(true);
    });

    it('should have correct sidebar classes', () => {
      const compiled = fixture.nativeElement;
      const sidebar = compiled.querySelector('app-sidebar');
      expect(sidebar.classList.contains('hidden')).toBe(true);
      expect(sidebar.classList.contains('md:flex')).toBe(true);
      expect(sidebar.classList.contains('md:flex-col')).toBe(true);
      expect(sidebar.classList.contains('w-72')).toBe(true);
      expect(sidebar.classList.contains('md:h-full')).toBe(true);
    });

    it('should have correct bottom navigation classes', () => {
      const compiled = fixture.nativeElement;
      const bottomNav = compiled.querySelector('app-bottom-nav');
      expect(bottomNav.classList.contains('md:hidden')).toBe(true);
      expect(bottomNav.classList.contains('fixed')).toBe(true);
      expect(bottomNav.classList.contains('left-0')).toBe(true);
      expect(bottomNav.classList.contains('right-0')).toBe(true);
      expect(bottomNav.classList.contains('bottom-0')).toBe(true);
    });
  });

  describe('Service Integration', () => {
    it('should inject DialogService correctly', () => {
      expect(dialogService).toBeTruthy();
    });

    it('should inject NotificationService correctly', () => {
      expect(notificationService).toBeTruthy();
    });

    it('should inject HabitService correctly', () => {
      expect(habitService).toBeTruthy();
    });
  });
});
