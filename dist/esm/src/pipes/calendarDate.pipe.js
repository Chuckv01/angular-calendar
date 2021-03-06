import { Pipe, LOCALE_ID, Inject } from '@angular/core';
import { CalendarDateFormatter } from './../providers/calendarDateFormatter.provider';
export var CalendarDate = (function () {
    /**
     * @private
     */
    function CalendarDate(dateFormatter, locale) {
        this.dateFormatter = dateFormatter;
        this.locale = locale;
    }
    /**
     * @private
     */
    CalendarDate.prototype.transform = function (date, method, locale) {
        if (locale === void 0) { locale = this.locale; }
        return this.dateFormatter[method]({ date: date, locale: locale });
    };
    CalendarDate.decorators = [
        { type: Pipe, args: [{
                    name: 'calendarDate'
                },] },
    ];
    /** @nocollapse */
    CalendarDate.ctorParameters = function () { return [
        { type: CalendarDateFormatter, },
        { type: undefined, decorators: [{ type: Inject, args: [LOCALE_ID,] },] },
    ]; };
    return CalendarDate;
}());
//# sourceMappingURL=calendarDate.pipe.js.map