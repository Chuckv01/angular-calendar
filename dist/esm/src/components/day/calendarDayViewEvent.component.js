import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import addMinutes from 'date-fns/add_minutes';
import { CalendarDragHelper } from '../../providers/calendarDragHelper.provider';
import { CalendarResizeHelper } from '../../providers/calendarResizeHelper.provider';
export var CalendarDayViewEventComponent = (function () {
    function CalendarDayViewEventComponent(cdr) {
        this.cdr = cdr;
        this.eventClicked = new EventEmitter();
        this.eventResized = new EventEmitter();
    }
    CalendarDayViewEventComponent.prototype.resizeStarted = function (event, resizeEvent) {
        this.currentResize = {
            originalTop: event.top,
            originalHeight: event.height,
            edge: typeof resizeEvent.edges.top !== 'undefined' ? 'top' : 'bottom'
        };
        var resizeHelper = new CalendarResizeHelper(this.dayViewContainer);
        this.validateResize = function (_a) {
            var rectangle = _a.rectangle;
            return resizeHelper.validateResize({ rectangle: rectangle });
        };
        this.cdr.markForCheck();
    };
    CalendarDayViewEventComponent.prototype.resizing = function (event, resizeEvent) {
        if (resizeEvent.edges.top) {
            event.top = this.currentResize.originalTop + +resizeEvent.edges.top;
            event.height = this.currentResize.originalHeight - +resizeEvent.edges.top;
        }
        else if (resizeEvent.edges.bottom) {
            event.height = this.currentResize.originalHeight + +resizeEvent.edges.bottom;
        }
    };
    CalendarDayViewEventComponent.prototype.resizeEnded = function (dayEvent) {
        var segments;
        if (this.currentResize.edge === 'top') {
            segments = (dayEvent.top - this.currentResize.originalTop) / this.eventSnapSize;
        }
        else {
            segments = (dayEvent.height - this.currentResize.originalHeight) / this.eventSnapSize;
        }
        dayEvent.top = this.currentResize.originalTop;
        dayEvent.height = this.currentResize.originalHeight;
        var segmentAmountInMinutes = 60 / this.hourSegments;
        var minutesMoved = segments * segmentAmountInMinutes;
        var newStart = dayEvent.event.start;
        var newEnd = dayEvent.event.end;
        if (this.currentResize.edge === 'top') {
            newStart = addMinutes(newStart, minutesMoved);
        }
        else if (newEnd) {
            newEnd = addMinutes(newEnd, minutesMoved);
        }
        this.eventResized.emit({ newStart: newStart, newEnd: newEnd, event: dayEvent.event });
        this.currentResize = null;
    };
    CalendarDayViewEventComponent.prototype.dragStart = function (event) {
        var dragHelper = new CalendarDragHelper(this.dayViewContainer, event);
        this.validateDrag = function (_a) {
            var x = _a.x, y = _a.y;
            return dragHelper.validateDrag({ x: x, y: y });
        };
        this.cdr.markForCheck();
    };
    CalendarDayViewEventComponent.prototype.eventDragged = function (dayEvent, draggedInPixels) {
        var segments = draggedInPixels / this.eventSnapSize;
        var segmentAmountInMinutes = 60 / this.hourSegments;
        var minutesMoved = segments * segmentAmountInMinutes;
        var newStart = addMinutes(dayEvent.event.start, minutesMoved);
        var newEnd;
        if (dayEvent.event.end) {
            newEnd = addMinutes(dayEvent.event.end, minutesMoved);
        }
        this.eventResized.emit({ newStart: newStart, newEnd: newEnd, event: dayEvent.event });
    };
    CalendarDayViewEventComponent.decorators = [
        { type: Component, args: [{
                    selector: 'mwl-calendar-day-view-event',
                    template: "\n    <div\n      class=\"cal-event\"\n      #event\n      [style.marginTop.px]=\"dayEvent.top\"\n      [style.marginLeft.px]=\"dayEvent.left + 70\"\n      [style.height.px]=\"dayEvent.height\"\n      [style.width.px]=\"dayEvent.width - 1\"\n      [style.backgroundColor]=\"dayEvent.event.color.secondary\"\n      [style.borderColor]=\"dayEvent.event.color.primary\"\n      [class.cal-starts-within-day]=\"!dayEvent.startsBeforeDay\"\n      [class.cal-ends-within-day]=\"!dayEvent.endsAfterDay\"\n      [class.cal-draggable]=\"dayEvent.event.draggable\"\n      [ngClass]=\"dayEvent.event.cssClass\"\n      [mwlCalendarTooltip]=\"dayEvent.event | calendarEventTitle:'dayTooltip'\"\n      [tooltipPlacement]=\"tooltipPlacement\"\n      mwlResizable\n      [resizeEdges]=\"{top: dayEvent.event?.resizable?.beforeStart, bottom: dayEvent.event?.resizable?.afterEnd}\"\n      [resizeSnapGrid]=\"{top: eventSnapSize, bottom: eventSnapSize}\"\n      [validateResize]=\"validateResize\"\n      (resizeStart)=\"resizeStarted(dayEvent, $event)\"\n      (resizing)=\"resizing(dayEvent, $event)\"\n      (resizeEnd)=\"resizeEnded(dayEvent)\"\n      mwlDraggable\n      [dragAxis]=\"{x: false, y: dayEvent.event.draggable && !currentResize}\"\n      [dragSnapGrid]=\"{y: eventSnapSize}\"\n      [validateDrag]=\"validateDrag\"\n      (dragStart)=\"dragStart(event)\"\n      (dragEnd)=\"eventDragged(dayEvent, $event.y)\">\n      <mwl-calendar-event-title\n        [event]=\"dayEvent.event\"\n        view=\"day\"\n        (click)=\"eventClicked.emit()\">\n      </mwl-calendar-event-title>\n      <mwl-calendar-event-actions [event]=\"dayEvent.event\"></mwl-calendar-event-actions>\n    </div>\n  "
                },] },
    ];
    /** @nocollapse */
    CalendarDayViewEventComponent.ctorParameters = function () { return [
        { type: ChangeDetectorRef, },
    ]; };
    CalendarDayViewEventComponent.propDecorators = {
        'dayEvent': [{ type: Input },],
        'hourSegments': [{ type: Input },],
        'eventSnapSize': [{ type: Input },],
        'tooltipPlacement': [{ type: Input },],
        'dayViewContainer': [{ type: Input },],
        'eventClicked': [{ type: Output },],
        'eventResized': [{ type: Output },],
    };
    return CalendarDayViewEventComponent;
}());
//# sourceMappingURL=calendarDayViewEvent.component.js.map