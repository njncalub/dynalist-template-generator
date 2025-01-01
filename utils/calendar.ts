const PADDING_CHAR = "\t";
const LINE_BREAK_CHAR = "\n";

function formatDate(date: Date, pattern: string): string {
  /**
   * Supports a few placeholders:
   *   %Y => full year (e.g., 2025)
   *   %m => zero-padded month (01..12)
   *   %d => zero-padded day (01..31)
   *   %a => short weekday name (Mon..Sun)
   *   %B => full month name (January..December)
   *
   * Example:  "%Y-%m-%d %a" => "2025-01-01 Wed"
   */

  // Short day names, matching Python's strftime("%a"):
  const weekdayNamesShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Full month names, matching Python's strftime("%B"):
  const monthNamesFull = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return pattern.replace(/%[YmdaB]/g, (match) => {
    switch (match) {
      case "%Y":
        return String(date.getFullYear());
      case "%m":
        return String(date.getMonth() + 1).padStart(2, "0");
      case "%d":
        return String(date.getDate()).padStart(2, "0");
      case "%a":
        // In Python, Monday=Mon, Tuesday=Tue, ...
        // In JS, getDay() => Sunday=0..Saturday=6
        return weekdayNamesShort[date.getDay()];
      case "%B":
        return monthNamesFull[date.getMonth()];
      default:
        // Fallback (should not happen with current usage)
        return match;
    }
  });
}

interface IsoCalendar {
  isoYear: number;
  isoWeek: number; // 1..53
  isoDay: number; // 1..7  (Monday=1..Sunday=7)
}

/**
 * Returns the ISO year, ISO week number (1..53), and ISO weekday (1..7)
 * for the given Date. This mimics `date.isocalendar()` in Python.
 */
function getIsoCalendar(d: Date): IsoCalendar {
  // Take a copy so we don't modify the original.
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));

  // ISO week date weeks start on Monday, so let's adjust for that
  // (In JS, Sunday=0..Saturday=6, but we want Monday=1..Sunday=7)
  let dayOfWeek = date.getUTCDay(); // 0..6
  if (dayOfWeek === 0) {
    dayOfWeek = 7;
  }

  // Let's find Thursday of this week, which is guaranteed to be within
  // the same ISO year & week number
  date.setUTCDate(date.getUTCDate() + (4 - dayOfWeek));

  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNumber = Math.floor(
    ((date.getTime() - yearStart.getTime()) / 86400000 + 10) / 7,
  );

  // ISO year is the same as the UTCFullYear of that "Thursday"
  const isoYear = date.getUTCFullYear();

  // Recompute dayOfWeek for the original input date
  // (Now in 1..7, with Monday=1)
  const originalDow = d.getDay() === 0 ? 7 : d.getDay();

  return {
    isoYear: isoYear,
    isoWeek: weekNumber,
    isoDay: originalDow,
  };
}

/**
 * Equivalent of Python's `datetime.fromisocalendar(iso_year, iso_week, iso_day)`
 * Returns a Date in local time. (If you want pure UTC, you can adjust.)
 */
function fromIsoCalendar(
  isoYear: number,
  isoWeek: number,
  isoDay: number,
): Date {
  // The logic:
  //   1) Start from the Monday of week 1 of isoYear, which is the Monday of the week
  //      containing January 4th of isoYear.
  //   2) Then add (isoWeek-1)*7 days + (isoDay-1) days.
  //
  // We'll do everything in UTC, then return a "local" Date at the end.

  // Step 1: find the Monday of the first ISO week of isoYear
  // Monday of week 1 is the Monday of the week that has January 4th in it.
  const jan4 = new Date(Date.UTC(isoYear, 0, 4));
  // find the day of week for jan4 (1..7 for Mon..Sun)
  let jan4Dow = jan4.getUTCDay();
  if (jan4Dow === 0) {
    jan4Dow = 7;
  }
  // Monday = 1 => offset = (1 - jan4Dow)
  const offsetToMonday = 1 - jan4Dow;

  // Move jan4 to that Monday
  jan4.setUTCDate(jan4.getUTCDate() + offsetToMonday);

  // Step 2: add (isoWeek-1)*7 days
  jan4.setUTCDate(jan4.getUTCDate() + (isoWeek - 1) * 7);

  // Step 3: add (isoDay - 1) days
  jan4.setUTCDate(jan4.getUTCDate() + (isoDay - 1));

  // Return as a local date
  return new Date(
    jan4.getUTCFullYear(),
    jan4.getUTCMonth(),
    jan4.getUTCDate(),
  );
}

interface CalendarOptions {
  initial_padding: number;
  year_item_format: string;
  year_format: string;
  add_year_overview: boolean;
  year_overview_format: string;

  show_quarter: boolean;
  quarter_item_format: string;
  quarter_format: string;
  add_quarter_overview: boolean;
  quarter_overview_format: string;

  month_item_format: string;
  month_format: string;
  add_month_overview: boolean;
  month_overview_format: string;

  show_week: boolean;
  week_item_format: string;
  week_format: string;
  add_week_overview: boolean;
  week_overview_format: string;

  day_item_format: string;
  day_format: string;
  add_day_overview: boolean;
  day_overview_format: string;
}

const DEFAULT_YEAR_ITEM_FORMAT = "#Y {}";
const DEFAULT_YEAR_FORMAT = "%Y";
const DEFAULT_ADD_YEAR_OVERVIEW = true;
const DEFAULT_YEAR_OVERVIEW_FORMAT = "#YO Overview";

const DEFAULT_SHOW_QUARTER = true;
const DEFAULT_QUARTER_ITEM_FORMAT = "#Q Q{}";
const DEFAULT_QUARTER_FORMAT = "{}";
const DEFAULT_ADD_QUARTER_OVERVIEW = true;
const DEFAULT_QUARTER_OVERVIEW_FORMAT = "#QO Overview";

const DEFAULT_MONTH_ITEM_FORMAT = "#M {}";
const DEFAULT_MONTH_FORMAT = "%B";
const DEFAULT_ADD_MONTH_OVERVIEW = true;
const DEFAULT_MONTH_OVERVIEW_FORMAT = "#MO Overview";

const DEFAULT_SHOW_WEEK = true;
const DEFAULT_WEEK_ITEM_FORMAT = "#W W{}";
const DEFAULT_WEEK_FORMAT = "{:02d}";
const DEFAULT_ADD_WEEK_OVERVIEW = true;
const DEFAULT_WEEK_OVERVIEW_FORMAT = "#WO Overview";

const DEFAULT_DAY_ITEM_FORMAT = "#D {}";
const DEFAULT_DAY_FORMAT = "%Y-%m-%d %a";
const DEFAULT_ADD_DAY_OVERVIEW = false;
const DEFAULT_DAY_OVERVIEW_FORMAT = "#DO Overview";

const DEFAULT_OPTIONS: CalendarOptions = {
  initial_padding: 0,
  year_item_format: DEFAULT_YEAR_ITEM_FORMAT,
  year_format: DEFAULT_YEAR_FORMAT,
  add_year_overview: DEFAULT_ADD_YEAR_OVERVIEW,
  year_overview_format: DEFAULT_YEAR_OVERVIEW_FORMAT,

  show_quarter: DEFAULT_SHOW_QUARTER,
  quarter_item_format: DEFAULT_QUARTER_ITEM_FORMAT,
  quarter_format: DEFAULT_QUARTER_FORMAT,
  add_quarter_overview: DEFAULT_ADD_QUARTER_OVERVIEW,
  quarter_overview_format: DEFAULT_QUARTER_OVERVIEW_FORMAT,

  month_item_format: DEFAULT_MONTH_ITEM_FORMAT,
  month_format: DEFAULT_MONTH_FORMAT,
  add_month_overview: DEFAULT_ADD_MONTH_OVERVIEW,
  month_overview_format: DEFAULT_MONTH_OVERVIEW_FORMAT,

  show_week: DEFAULT_SHOW_WEEK,
  week_item_format: DEFAULT_WEEK_ITEM_FORMAT,
  week_format: DEFAULT_WEEK_FORMAT,
  add_week_overview: DEFAULT_ADD_WEEK_OVERVIEW,
  week_overview_format: DEFAULT_WEEK_OVERVIEW_FORMAT,

  day_item_format: DEFAULT_DAY_ITEM_FORMAT,
  day_format: DEFAULT_DAY_FORMAT,
  add_day_overview: DEFAULT_ADD_DAY_OVERVIEW,
  day_overview_format: DEFAULT_DAY_OVERVIEW_FORMAT,
};

export function generate(
  startDate: Date,
  userOptions: Partial<CalendarOptions> = {},
): string {
  // Merge defaults
  const options: CalendarOptions = {
    ...DEFAULT_OPTIONS,
    ...userOptions,
  };
  return generateYear(options.initial_padding, startDate, options);
}

function generateYear(
  padding: number,
  startDate: Date,
  options: CalendarOptions,
): string {
  let results = "";

  // Year heading
  const yearStr = formatDate(startDate, options.year_format);
  const yearItem = options.year_item_format.replace("{}", yearStr);
  results += `${PADDING_CHAR.repeat(padding)}${yearItem}${LINE_BREAK_CHAR}`;

  // Year overview
  if (options.add_year_overview) {
    const overview = options.year_overview_format;
    results += `${
      PADDING_CHAR.repeat(padding + 1)
    }${overview}${LINE_BREAK_CHAR}`;
  }

  // Quarters vs. direct months
  if (options.show_quarter) {
    const currentQuarter = getQuarter(startDate);
    const allQuarters = [
      startDate,
      ...[2, 3, 4].map((q) => getQuarterStartDate(startDate.getFullYear(), q))
        .filter(
          (_, i) => (i + 1) > (currentQuarter - 1), // we only want the subsequent quarters
        ),
    ];
    // Actually we want from the *next* quarter, so let's adjust properly:
    // Or do the exact Python logic:
    //    for q in range(current_quarter+1, 5):
    //        ...
    // We'll do that approach:
    const resultQuarters: Date[] = [];
    resultQuarters.push(startDate);
    for (let q = currentQuarter + 1; q <= 4; q++) {
      resultQuarters.push(getQuarterStartDate(startDate.getFullYear(), q));
    }

    for (const quarterDate of resultQuarters) {
      results += generateQuarter(padding + 1, quarterDate, options);
    }
  } else {
    // Otherwise go month by month from startDate.month to December
    const months: Date[] = [startDate];
    const startMonth = startDate.getMonth() + 1;
    for (let m = startMonth + 1; m <= 12; m++) {
      months.push(new Date(startDate.getFullYear(), m - 1, 1));
    }
    for (const monthDate of months) {
      results += generateMonth(padding + 1, monthDate, options);
    }
  }

  return results;
}

function generateQuarter(
  padding: number,
  startDate: Date,
  options: CalendarOptions,
): string {
  let results = "";

  // Quarter heading
  const quarterNum = getQuarter(startDate);
  const quarterStr = options.quarter_format.replace("{}", String(quarterNum));
  const quarterItem = options.quarter_item_format.replace("{}", quarterStr);
  results += `${PADDING_CHAR.repeat(padding)}${quarterItem}${LINE_BREAK_CHAR}`;

  // Collect all months for this quarter
  const allMonths = [startDate];
  for (let m = startDate.getMonth() + 2; m <= quarterNum * 3; m++) {
    allMonths.push(new Date(startDate.getFullYear(), m - 1, 1));
  }

  for (const monthDate of allMonths) {
    results += generateMonth(padding + 1, monthDate, options);
  }

  return results;
}

function generateMonth(
  padding: number,
  startDate: Date,
  options: CalendarOptions,
): string {
  let results = "";

  // Month heading
  const monthStr = formatDate(startDate, options.month_format);
  const monthItem = options.month_item_format.replace("{}", monthStr);
  results += `${PADDING_CHAR.repeat(padding)}${monthItem}${LINE_BREAK_CHAR}`;

  // Month overview
  if (options.add_month_overview) {
    const overview = options.month_overview_format;
    results += `${
      PADDING_CHAR.repeat(padding + 1)
    }${overview}${LINE_BREAK_CHAR}`;
  }

  // Find the last day of this month
  let endDate: Date;
  const year = startDate.getFullYear();
  const month = startDate.getMonth(); // 0..11
  try {
    // If month == 11 (Dec), month+1=12 => next year's Jan => create date => minus 1 day => Dec 31
    const nextMonth = new Date(year, month + 1, 1);
    endDate = new Date(nextMonth.getTime() - 24 * 3600 * 1000);
  } catch (_e) {
    // fallback
    endDate = new Date(year + 1, 0, 0);
  }

  if (options.show_week) {
    results += _generateMonthByIsoWeeks(padding, startDate, endDate, options);
  } else {
    // Just list each day
    for (
      let dayNum = startDate.getDate(); dayNum <= endDate.getDate(); dayNum++
    ) {
      const dateObj = new Date(year, month, dayNum);
      results += generateDay(padding + 1, dateObj, options);
    }
  }

  return results;
}

function _generateMonthByIsoWeeks(
  padding: number,
  startDate: Date,
  endDate: Date,
  options: CalendarOptions,
): string {
  let results = "";

  // We'll track all the Monday-of-each-ISO-week that falls within this month
  const startDates = [startDate];

  // Start + end as ISO
  const { isoYear: startIsoYear, isoWeek: startWeekNum } = getIsoCalendar(
    startDate,
  );
  const { isoYear: endIsoYear, isoWeek: endWeekNum } = getIsoCalendar(endDate);

  let nextWeek = startWeekNum + 1;
  let currentIsoYear = startIsoYear;

  while (true) {
    let nextWeekStart: Date;
    try {
      nextWeekStart = fromIsoCalendar(currentIsoYear, nextWeek, 1);
    } catch (_e) {
      // If stepping into a new ISO year
      nextWeek = 1;
      currentIsoYear += 1;
      nextWeekStart = fromIsoCalendar(currentIsoYear, nextWeek, 1);
    }

    if (nextWeekStart.getTime() > endDate.getTime()) {
      break;
    }
    startDates.push(nextWeekStart);
    nextWeek += 1;

    if (
      currentIsoYear > endIsoYear ||
      (currentIsoYear === endIsoYear && nextWeek > endWeekNum)
    ) {
      break;
    }
  }

  // Generate each ISO week
  for (const wkStartDate of startDates) {
    results += generateWeek(padding + 1, wkStartDate, options);
  }

  return results;
}

function generateWeek(
  padding: number,
  startDate: Date,
  options: CalendarOptions,
): string {
  let results = "";

  const { isoYear, isoWeek, isoDay } = getIsoCalendar(startDate);

  // Format the week heading (like #W W01)
  // The Python code used something like .format("{:02d}".format(isoWeek)).
  // We'll do a quick replacement for "{:02d}" => zero-padded two digits
  const paddedWeek = String(isoWeek).padStart(2, "0");
  const weekItem = options.week_item_format.replace("{}", paddedWeek);
  results += `${PADDING_CHAR.repeat(padding)}${weekItem}${LINE_BREAK_CHAR}`;

  // Week overview
  if (options.add_week_overview) {
    const overview = options.week_overview_format;
    results += `${
      PADDING_CHAR.repeat(padding + 1)
    }${overview}${LINE_BREAK_CHAR}`;
  }

  // List the dates for this ISO week that match the startDate's month
  // isoDay is Monday=1..Sunday=7
  const datesInWeek: Date[] = [];
  for (let dayIndex = isoDay; dayIndex <= 7; dayIndex++) {
    let dateObj: Date;
    try {
      dateObj = fromIsoCalendar(isoYear, isoWeek, dayIndex);
    } catch (_e) {
      // In case isoYear is off by 1, let's do isoYear-1
      dateObj = fromIsoCalendar(isoYear - 1, isoWeek, dayIndex);
    }

    // Only include if same month as startDate
    if (dateObj.getMonth() === startDate.getMonth()) {
      datesInWeek.push(dateObj);
    }
  }

  // Output each day in this ISO week
  for (const dateObj of datesInWeek) {
    // Double-check month boundary
    if (dateObj.getMonth() !== startDate.getMonth()) {
      break;
    }
    results += generateDay(padding + 1, dateObj, options);
  }

  return results;
}

function generateDay(
  padding: number,
  date: Date,
  options: CalendarOptions,
): string {
  let results = "";

  // Format the day heading (like "#D 2025-01-01 Wed")
  const dayStr = formatDate(date, options.day_format);
  const dayItem = options.day_item_format.replace("{}", dayStr);
  results += `${PADDING_CHAR.repeat(padding)}${dayItem}${LINE_BREAK_CHAR}`;

  // Day overview
  if (options.add_day_overview) {
    const overview = options.day_overview_format;
    results += `${
      PADDING_CHAR.repeat(padding + 1)
    }${overview}${LINE_BREAK_CHAR}`;
  }

  return results;
}

function getQuarter(date: Date): number {
  /*
   Returns the quarter (1..4) for the given date.
  */
  const month = date.getMonth() + 1; // JS months: 0..11, we want 1..12
  if (month >= 1 && month <= 3) return 1;
  if (month >= 4 && month <= 6) return 2;
  if (month >= 7 && month <= 9) return 3;
  return 4; // 10..12 => Q4
}

function getQuarterStartDate(year: number, quarter: number): Date {
  /*
   Returns the date for the first day of the specified quarter in 'year'.
   Quarter must be 1..4.
  */
  return new Date(year, (quarter - 1) * 3, 1);
}

if (import.meta.main) {
  const start = new Date(2025, 0, 1); // Jan 1, 2025
  const result = generate(start);
  console.log(result);
}
