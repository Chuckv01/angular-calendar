import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  OnChanges,
  OnInit,
  OnDestroy,
  LOCALE_ID,
  Inject
} from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import {
  WeekDay,
  CalendarEvent,
  WeekViewEvent,
  WeekViewEventRow,
  getWeekViewHeader,
  getWeekView
} from 'calendar-utils';
import { ResizeEvent } from 'angular-resizable-element';
import addDays from 'date-fns/add_days';
import { CalendarDragHelper } from '../../providers/calendarDragHelper.provider';
import { CalendarResizeHelper } from '../../providers/calendarResizeHelper.provider';
import { CalendarEventTimesChangedEvent } from '../../interfaces/calendarEventTimesChangedEvent.interface';

@Component({
  selector: 'mwl-calendar-week-view',
  template: ``
})
export class CalendarWeekViewComponent implements OnChanges, OnInit, OnDestroy {

  /**
   * The current view date
   */
  @Input() viewDate: Date;

  /**
   * An array of events to display on view
   */
  @Input() events: CalendarEvent[] = [];

  /**
   * An observable that when emitted on will re-render the current view
   */
  @Input() refresh: Subject<any>;

  /**
   * The locale used to format dates
   */
  @Input() locale: string;

  /**
   * The placement of the event tooltip
   */
  @Input() tooltipPlacement: string = 'bottom';

  /**
   * The start number of the week
   */
  @Input() weekStartsOn: number;

  /**
   * Called when a header week day is clicked
   */
  @Output() dayClicked: EventEmitter<{date: Date}> = new EventEmitter<{date: Date}>();

  /**
   * Called when the event title is clicked
   */
  @Output() eventClicked: EventEmitter<{event: CalendarEvent}> = new EventEmitter<{event: CalendarEvent}>();

  /**
   * Called when an event is resized or dragged and dropped
   */
  @Output() eventTimesChanged: EventEmitter<CalendarEventTimesChangedEvent> = new EventEmitter<CalendarEventTimesChangedEvent>();

  /**
   * @private
   */
  days: WeekDay[];

  /**
   * @private
   */
  eventRows: WeekViewEventRow[] = [];

  /**
   * @private
   */
  refreshSubscription: Subscription;

  /**
   * @private
   */
  currentResize: {
    originalOffset: number,
    originalSpan: number,
    edge: string
  };

  /**
   * @private
   */
  validateDrag: Function;

  /**
   * @private
   */
  validateResize: Function;

  /**
   * @private
   */
  constructor(private cdr: ChangeDetectorRef, @Inject(LOCALE_ID) locale: string) {
    this.locale = locale;
  }

  /**
   * @private
   */
  ngOnInit(): void {
    if (this.refresh) {
      this.refreshSubscription = this.refresh.subscribe(() => {
        this.refreshAll();
        this.cdr.markForCheck();
      });
    }
  }

  /**
   * @private
   */
  ngOnChanges(changes: any): void {

    if (changes.viewDate) {
      this.refreshHeader();
    }

    if (changes.events || changes.viewDate) {
      this.refreshBody();
    }

  }

  /**
   * @private
   */
  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  /**
   * @private
   */
  resizeStarted(weekViewContainer: HTMLElement, weekEvent: WeekViewEvent, resizeEvent: ResizeEvent): void {
    this.currentResize = {
      originalOffset: weekEvent.offset,
      originalSpan: weekEvent.span,
      edge: typeof resizeEvent.edges.left !== 'undefined' ? 'left' : 'right'
    };
    const resizeHelper: CalendarResizeHelper = new CalendarResizeHelper(weekViewContainer, this.getDayColumnWidth(weekViewContainer));
    this.validateResize = ({rectangle}) => resizeHelper.validateResize({rectangle});
    this.cdr.markForCheck();
  }

  /**
   * @private
   */
  resizing(weekEvent: WeekViewEvent, resizeEvent: ResizeEvent, dayWidth: number): void {
    if (resizeEvent.edges.left) {
      const diff: number = Math.round(+resizeEvent.edges.left / dayWidth);
      weekEvent.offset = this.currentResize.originalOffset + diff;
      weekEvent.span = this.currentResize.originalSpan - diff;
    } else if (resizeEvent.edges.right) {
      const diff: number = Math.round(+resizeEvent.edges.right / dayWidth);
      weekEvent.span = this.currentResize.originalSpan + diff;
    }
  }

  /**
   * @private
   */
  resizeEnded(weekEvent: WeekViewEvent): void {

    let daysDiff: number;
    if (this.currentResize.edge === 'left') {
      daysDiff = weekEvent.offset - this.currentResize.originalOffset;
    } else {
      daysDiff = weekEvent.span - this.currentResize.originalSpan;
    }

    weekEvent.offset = this.currentResize.originalOffset;
    weekEvent.span = this.currentResize.originalSpan;

    let newStart: Date = weekEvent.event.start;
    let newEnd: Date = weekEvent.event.end;
    if (this.currentResize.edge === 'left') {
      newStart = addDays(newStart, daysDiff);
    } else if (newEnd) {
      newEnd = addDays(newEnd, daysDiff);
    }

    this.eventTimesChanged.emit({newStart, newEnd, event: weekEvent.event});
    this.currentResize = null;

  }

  /**
   * @private
   */
  eventDragged(weekEvent: WeekViewEvent, draggedByPx: number, dayWidth: number): void {

    const daysDragged: number = draggedByPx / dayWidth;
    const newStart: Date = addDays(weekEvent.event.start, daysDragged);
    let newEnd: Date;
    if (weekEvent.event.end) {
      newEnd = addDays(weekEvent.event.end, daysDragged);
    }

    this.eventTimesChanged.emit({newStart, newEnd, event: weekEvent.event});

  }

  /**
   * @private
   */
  getDayColumnWidth(eventRowContainer: HTMLElement): number {
    return Math.floor(eventRowContainer.offsetWidth / 7);
  }

  /**
   * @private
   */
  dragStart(weekViewContainer: HTMLElement, event: HTMLElement): void {
    const dragHelper: CalendarDragHelper = new CalendarDragHelper(weekViewContainer, event);
    this.validateDrag = ({x, y}) => dragHelper.validateDrag({x, y});
    this.cdr.markForCheck();
  }

  private refreshHeader(): void {
    this.days = getWeekViewHeader({
      viewDate: this.viewDate,
      weekStartsOn: this.weekStartsOn
    });
  }

  private refreshBody(): void {
    this.eventRows = getWeekView({
      events: this.events,
      viewDate: this.viewDate,
      weekStartsOn: this.weekStartsOn
    });
  }

  private refreshAll(): void {
    this.refreshHeader();
    this.refreshBody();
  }

}
