import { useState } from "preact/hooks";

import { generate } from "../utils/calendar.ts";

const DEFAULTS = {
  year_item_format: "#Y {}",
  year_format: "%Y",
  add_year_overview: true,
  year_overview_format: "#YO Overview",
  show_quarter: true,
  quarter_item_format: "#Q Q{}",
  quarter_format: "{}",
  add_quarter_overview: true,
  quarter_overview_format: "#QO Overview",
  month_item_format: "#M {}",
  month_format: "%B",
  add_month_overview: true,
  month_overview_format: "#MO Overview",
  show_week: true,
  week_item_format: "#W W{}",
  week_format: "{:02d}",
  add_week_overview: true,
  week_overview_format: "#WO Overview",
  day_item_format: "#D {}",
  day_format: "%Y-%m-%d %a",
  add_day_overview: false,
  day_overview_format: "#DO Overview",
};

const PRE_POPULATED_CSS = `
.node-tag[title~="##"],
.node-tag[title~="#~"],
.node-tag[title~="#X"],
.node-tag[title~="#E"],
.node-tag[title~="#N"],
.node-tag[title~="#$"],
.node-tag[title~="#P"],
.node-tag[title~="#I"],
.node-tag[title~="#A"],
.node-tag[title~="#C"],
.node-tag[title~="#>"],
.node-tag[title~="#F"],
.node-tag[title~="#_"],
.node-tag[title~="#="],
.node-tag[title~="#POMO"],
.node-tag[title~="#DOMO"] {
  text-decoration: none !important;
  font-size: 75%;
  display: inline-block;
  min-width: 35px !important;
  padding-left: 5px;
  padding-right: 5px;
  text-align: center;
  border-radius: 10px;
  color: #ffffff !important;
}

/*  regular task */
.node-tag[title~="##"] {
  background: #dee2e6 !important;
}

/*  in-progress task */
.node-tag[title~="#~"] {
  background: #e9ff70 !important;
  color: #000000 !important;
}

/*  finished task */
.node-tag[title~="#X"] {
  background: #495057 !important;
}

/*  type: event */
.node-tag[title~="#E"] {
  background: #f15bb5 !important;
}

/*  type: note */
.node-tag[title~="#N"] {
  background: #00bbf9 !important;
}

/*  type: shopping */
.node-tag[title~="#$"] {
  background: #9d4edd !important;
}

/*  type: collection */
.node-tag[title~="#C"] {
  background: #277DA1 !important;
}

/*  for dates */
.node-tag[title~="#Y"],
.node-tag[title~="#Q"],
.node-tag[title~="#M"],
.node-tag[title~="#W"],
.node-tag[title~="#D"],
.node-tag[title~="#YO"],
.node-tag[title~="#QO"],
.node-tag[title~="#MO"],
.node-tag[title~="#WO"],
.node-tag[title~="#DO"]{
  text-decoration: none !important;
  font-size: 50%;
  display: inline-block;
  min-width: 35px !important;
  padding-left: 5px;
  padding-right: 5px;
  text-align: center;
  color: #000000 !important;
  border-style: dotted !important;
  border-width: 1px !important;
  border-color: #000000 !important;
  border-radius: 10px;
  background: #ffffff !important;
}

/*  for date overviews */
.node-tag[title~="#YO"],
.node-tag[title~="#QO"],
.node-tag[title~="#MO"],
.node-tag[title~="#WO"],
.node-tag[title~="#DO"] {
  background: #fcf4d7 !important;
}

.DocumentBreadcrumb-item .node-tag[title~="#Y"],
.Node.is-currentRoot > .Node-self .node-line .node-tag[title~="#Y"],
.DocumentBreadcrumb-item .node-tag[title~="#YO"],
.Node.is-currentRoot > .Node-self .node-line .node-tag[title~="#YO"],
.DocumentBreadcrumb-item .node-tag[title~="#Q"],
.Node.is-currentRoot > .Node-self .node-line .node-tag[title~="#Q"],
.DocumentBreadcrumb-item .node-tag[title~="#QO"],
.Node.is-currentRoot > .Node-self .node-line .node-tag[title~="#QO"],
.DocumentBreadcrumb-item .node-tag[title~="#M"],
.Node.is-currentRoot > .Node-self .node-line .node-tag[title~="#M"],
.DocumentBreadcrumb-item .node-tag[title~="#MO"],
.Node.is-currentRoot > .Node-self .node-line .node-tag[title~="#MO"],
.DocumentBreadcrumb-item .node-tag[title~="#W"],
.Node.is-currentRoot > .Node-self .node-line .node-tag[title~="#W"],
.DocumentBreadcrumb-item .node-tag[title~="#WO"],
.Node.is-currentRoot > .Node-self .node-line .node-tag[title~="#WO"],
.DocumentBreadcrumb-item .node-tag[title~="#D"],
.Node.is-currentRoot > .Node-self .node-line .node-tag[title~="#D"],
.DocumentBreadcrumb-item .node-tag[title~="#DO"],
.Node.is-currentRoot > .Node-self .node-line .node-tag[title~="#DO"] {
  display: none;
}

/*  type: year */
.node-tag[title~="#Y"] {
}

/*  type: quarter */
.node-tag[title~="#Q"] {
}

/*  type: month */
.node-tag[title~="#M"] {
}

/*  type: week */
.node-tag[title~="#W"] {
}

/*  type: day */
.node-tag[title~="#D"] {
}

/*  signifier: priority */
.node-tag[title~="#P"] {
  background: #F94144 !important;
}

/*  signifier: inspiration */
.node-tag[title~="#I"] {
  background: #F9C74F !important;
}

/*  state: assigned */
.node-tag[title~="#A"] {
  background: #723c70 !important;
}

/*  state: moved back to future log */
.node-tag[title~="#F"] {
  background: #F9844A !important;
}

/* state: forwarded to nearby date */
.node-tag[title~="#>"] {
  background: #469374 !important;
}

/* special type: progress bar: filled */
.node-tag[title~="#="] {
  background: #736f72 !important;
  color: #736f72 !important;
  border-radius: 0 !important;
}

/* special type: progress bar: blank */
.node-tag[title~="#_"] {
  background: #e9e3e6 !important;
  color: #e9e3e6 !important;
  border-radius: 0 !important;
}

/* special type: pomodoro base */
.node-tag[title~="#DOMO"],
.node-tag[title~="#POMO"],
.node-tag[title~="#DOM"],
.node-tag[title~="#POM"] {
  font-size: 75%;
  padding-left: 10px;
  padding-right: 10px;
  border-top-left-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
  color: rgba(0, 0, 0, 0) !important;
  height: 17px !important;
  display: inline-block;
  overflow: hidden;
}

/* special type: pomodoro base (whole) */
.node-tag[title~="#DOMO"],
.node-tag[title~="#POMO"] {
  width: 70px !important;
}

/* special type: pomodoro base (half) */
.node-tag[title~="#DOM"],
.node-tag[title~="#POM"] {
  width: 32px !important;
}

/* special type: pomodoro allocated */
.node-tag[title~="#DOMO"],
.node-tag[title~="#DOM"] {
  background: #7dd181 !important;
}

/* special type: pomodoro finished */
.node-tag[title~="#POMO"],
.node-tag[title~="#POM"]{
  background: #bf4342 !important;
}

/* special type: weekly trackers */
.node-tag[title~="#----"],
.node-tag[title~="#MON-"],
.node-tag[title~="#TUE-"],
.node-tag[title~="#WED-"],
.node-tag[title~="#THU-"],
.node-tag[title~="#FRI-"],
.node-tag[title~="#SAT-"],
.node-tag[title~="#SUN-"],
.node-tag[title~="#MON+"],
.node-tag[title~="#TUE+"],
.node-tag[title~="#WED+"],
.node-tag[title~="#THU+"],
.node-tag[title~="#FRI+"],
.node-tag[title~="#SAT+"],
.node-tag[title~="#SUN+"] {
  text-decoration: none !important;
  font-size: 75%;
  display: inline-block;
  width: 55px !important;
  padding-left: 3px;
  padding-right: 3px;
  text-align: center;
  border-radius: 1px;
}

/* special type: weekly trackers - blank */
.node-tag[title~="#----"] {
  background: #f0efeb !important;
  color: #f0efeb !important;
}

/* special type: weekly trackers - to do */
.node-tag[title~="#MON-"],
.node-tag[title~="#TUE-"],
.node-tag[title~="#WED-"],
.node-tag[title~="#THU-"],
.node-tag[title~="#FRI-"],
.node-tag[title~="#SAT-"],
.node-tag[title~="#SUN-"] {
  border-style: dashed !important;
  border-width: 1px !important;
  border-color: #626041 !important;
  background: #ffffff !important;
  color: #626041 !important;
}

/* special type: weekly trackers - finished */
.node-tag[title~="#MON+"],
.node-tag[title~="#TUE+"],
.node-tag[title~="#WED+"],
.node-tag[title~="#THU+"],
.node-tag[title~="#FRI+"],
.node-tag[title~="#SAT+"],
.node-tag[title~="#SUN+"] {
  background: #2c6e49 !important;
  color: #ffffff !important;
}

/* Images are too big for my liking. */
.node-displayed-image-link, .node-displayed-image {
  max-width: 200px;
  max-height: 400px;
}
`.trim();

const PRE_POPULATED_NODES = `
LEGEND
    Types
        ## Task
        A regular bullet item.
            Additional explanation bullets can be added. No need for extra bullet type.
        #E **E**vent
        Events are date-related entries that can either be scheduled (e.g. “Charlie’s birthday”) or logged after they occur (e.g. “signed the lease”).
        #N **N**ote
        Things you don't want to forget: facts, ideas, thoughts, and observations. They're used to capture information or data you don't want to forget. This Bullet works well for meeting, lecture, or classroom notes.
        #I **I**nspiration
        Great ideas, personal mantras, and genius insights will never be misplaced again!
        #$ **S**hopping
        A special note for things I buy, since I buy too many and I need to track it.
        #C **C**ollection
        Anything related to collections: A new (yearly|monthly|weekly) collection was added/moved/etc.
    For Date Logs
        #Y **Y**ear
            #YO **Y**ear **O**verview
        #Q **Q**uarter
            #Q **Q**uarter **O**verview
        #M **M**onth
            #MO **M**onth **O**verview
        #W **W**eek
            #WO **W**eek **O**verview
        #D **D**ay
            #DO **D**ay **O**verview
    States
        ## task incomplete
        #~ task in progress
        #X task complete
        #A an overview task assigned to a specific week or day
        #> unfinished task that was moved to the next/succeeding week
        #F unfinished task moved to a future date that is far into the future
        ## unfinished task that was decided to be irrelevant
    Signifiers
        #P ## **P**riority
        Used to mark the most important things on your list. Use it sparingly. If everything is a priority, nothing is.
    Miscellaneous
        Progress Counter
            #= #= #= #_ #_
            Equivalent without the hashtag: \`===__\`
        Pomodoro Counter
            #DOMO #DOMO #DOMO #DOMO 
            #DOMO #DOM
            #POMO #POMO #POMO 
            #POMO #POM
        Weekly Tracker
            #MON- #TUE- #WED- #THU- #FRI- #SAT- #SUN-
            #MON+ #TUE+ #WED+ #THU+ #FRI+ #SAT+ #SUN+
            #---- #---- #WED- #THU+ #FRI- #SAT+ #SUN+
        Placeholder
            ---
    Structure
        Journal
            LEGEND
            INDEX
            LOGS
                #Y 2021
                    #YO Overview
                    #Q Q1
                        #QO Overview
                        #M January
                            #MO Overview
                            #W W53
                                #WO Overview
                                #D 2021-01-01 Fri
                                    #DO Overview
                                #D 2021-01-02 Sat
                                #D 2021-01-03 Sun
`.trim();

export default function Generator() {
  const [year, setYear] = useState(2025);
  const [options, setOptions] = useState({ ...DEFAULTS });
  const [output, setOutput] = useState("");

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    const startDate = new Date(year, 0, 1);
    const calendarOutput = generate(startDate, options);
    setOutput(calendarOutput);
  };

  const handleOptionChange = (key: string, value: boolean | string) => {
    setOptions((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div class="bg-gray-100 min-h-screen flex flex-col items-center p-4">
      <div class="container bg-white shadow-lg rounded-lg p-6 flex gap-8">
        {/* Left Column: Settings */}
        <div class="w-1/2">
          <h1 class="text-2xl font-bold text-gray-800 mb-4">
            Dynalist Template Generator
          </h1>
          <form onSubmit={handleSubmit} class="space-y-4">
            <div>
              <label for="year" class="block text-sm font-medium text-gray-700">
                Year:
              </label>
              <select
                id="year"
                value={year}
                onChange={(e) => {
                  const target = e.target as HTMLSelectElement;
                  setYear(Number(target.value));
                }}
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                {Array.from({ length: 10 }, (_, i) => 2025 + i).map((yr) => (
                  <option value={yr}>{yr}</option>
                ))}
              </select>
            </div>

            <fieldset class="border border-gray-300 rounded-md p-4">
              <legend class="text-sm font-medium text-gray-700">
                Year Settings
              </legend>
              <div class="space-y-2">
                <div>
                  <label class="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={options.add_year_overview}
                      onChange={(e) => {
                        const target = e.target as HTMLInputElement;
                        handleOptionChange("add_year_overview", target.checked);
                      }}
                      class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span class="ml-2 text-sm text-gray-700">
                      Add Year Overview
                    </span>
                  </label>
                </div>
                <div>
                  <label
                    for="year_item_format"
                    class="block text-sm font-medium text-gray-700"
                  >
                    Year Item Format:
                  </label>
                  <input
                    type="text"
                    id="year_item_format"
                    value={options.year_item_format}
                    onChange={(e) => {
                      const target = e.target as HTMLInputElement;
                      handleOptionChange("year_item_format", target.value);
                    }}
                    class="mt-1 block w-full border-gray-400 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    for="year_format"
                    class="block text-sm font-medium text-gray-700"
                  >
                    Year Format:
                  </label>
                  <input
                    type="text"
                    id="year_format"
                    value={options.year_format}
                    onChange={(e) => {
                      const target = e.target as HTMLInputElement;
                      handleOptionChange("year_format", target.value);
                    }}
                    class="mt-1 block w-full border-gray-400 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    for="year_overview_format"
                    class="block text-sm font-medium text-gray-700"
                  >
                    Year Overview Format:
                  </label>
                  <input
                    type="text"
                    id="year_overview_format"
                    value={options.year_overview_format}
                    onChange={(e) => {
                      const target = e.target as HTMLInputElement;
                      handleOptionChange("year_overview_format", target.value);
                    }}
                    class="mt-1 block w-full border-gray-400 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </fieldset>

            <fieldset class="border border-gray-300 rounded-md p-4">
              <legend class="text-sm font-medium text-gray-700">
                Quarter Settings
              </legend>
              <div class="space-y-2">
                <div>
                  <label class="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={options.show_quarter}
                      onChange={(e) => {
                        const target = e.target as HTMLInputElement;
                        handleOptionChange("show_quarter", target.checked);
                      }}
                      class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span class="ml-2 text-sm text-gray-700">
                      Show Quarters
                    </span>
                  </label>
                </div>
                <div>
                  <label class="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={options.add_quarter_overview}
                      onChange={(e) => {
                        const target = e.target as HTMLInputElement;
                        handleOptionChange(
                          "add_quarter_overview",
                          target.checked,
                        );
                      }}
                      class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span class="ml-2 text-sm text-gray-700">
                      Add Quarter Overview
                    </span>
                  </label>
                </div>
                <div>
                  <label
                    for="quarter_item_format"
                    class="block text-sm font-medium text-gray-700"
                  >
                    Quarter Item Format:
                  </label>
                  <input
                    type="text"
                    id="quarter_item_format"
                    value={options.quarter_item_format}
                    onChange={(e) => {
                      const target = e.target as HTMLInputElement;
                      handleOptionChange("quarter_item_format", target.value);
                    }}
                    class="mt-1 block w-full border-gray-400 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    for="quarter_format"
                    class="block text-sm font-medium text-gray-700"
                  >
                    Quarter Format:
                  </label>
                  <input
                    type="text"
                    id="quarter_format"
                    value={options.quarter_format}
                    onChange={(e) => {
                      const target = e.target as HTMLInputElement;
                      handleOptionChange("quarter_format", target.value);
                    }}
                    class="mt-1 block w-full border-gray-400 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    for="quarter_overview_format"
                    class="block text-sm font-medium text-gray-700"
                  >
                    Quarter Overview Format:
                  </label>
                  <input
                    type="text"
                    id="quarter_overview_format"
                    value={options.quarter_overview_format}
                    onChange={(e) => {
                      const target = e.target as HTMLInputElement;
                      handleOptionChange(
                        "quarter_overview_format",
                        target.value,
                      );
                    }}
                    class="mt-1 block w-full border-gray-400 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </fieldset>

            <fieldset class="border border-gray-300 rounded-md p-4">
              <legend class="text-sm font-medium text-gray-700">
                Month Settings
              </legend>
              <div class="space-y-2">
                <div>
                  <label class="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={options.add_month_overview}
                      onChange={(e) => {
                        const target = e.target as HTMLInputElement;
                        handleOptionChange(
                          "add_month_overview",
                          target.checked,
                        );
                      }}
                      class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span class="ml-2 text-sm text-gray-700">
                      Add Month Overview
                    </span>
                  </label>
                </div>
                <div>
                  <label
                    for="month_item_format"
                    class="block text-sm font-medium text-gray-700"
                  >
                    Month Item Format:
                  </label>
                  <input
                    type="text"
                    id="month_item_format"
                    value={options.month_item_format}
                    onChange={(e) => {
                      const target = e.target as HTMLInputElement;
                      handleOptionChange("month_item_format", target.value);
                    }}
                    class="mt-1 block w-full border-gray-400 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    for="month_format"
                    class="block text-sm font-medium text-gray-700"
                  >
                    Month Format:
                  </label>
                  <input
                    type="text"
                    id="month_format"
                    value={options.month_format}
                    onChange={(e) => {
                      const target = e.target as HTMLInputElement;
                      handleOptionChange("month_format", target.value);
                    }}
                    class="mt-1 block w-full border-gray-400 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    for="month_overview_format"
                    class="block text-sm font-medium text-gray-700"
                  >
                    Month Overview Format:
                  </label>
                  <input
                    type="text"
                    id="month_overview_format"
                    value={options.month_overview_format}
                    onChange={(e) => {
                      const target = e.target as HTMLInputElement;
                      handleOptionChange("month_overview_format", target.value);
                    }}
                    class="mt-1 block w-full border-gray-400 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </fieldset>

            <fieldset class="border border-gray-300 rounded-md p-4">
              <legend class="text-sm font-medium text-gray-700">
                Day Settings
              </legend>
              <div class="space-y-2">
                <div>
                  <label class="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={options.add_day_overview}
                      onChange={(e) => {
                        const target = e.target as HTMLInputElement;
                        handleOptionChange("add_day_overview", target.checked);
                      }}
                      class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span class="ml-2 text-sm text-gray-700">
                      Add Day Overview
                    </span>
                  </label>
                </div>
                <div>
                  <label
                    for="day_item_format"
                    class="block text-sm font-medium text-gray-700"
                  >
                    Day Item Format:
                  </label>
                  <input
                    type="text"
                    id="day_item_format"
                    value={options.day_item_format}
                    onChange={(e) => {
                      const target = e.target as HTMLInputElement;
                      handleOptionChange("day_item_format", target.value);
                    }}
                    class="mt-1 block w-full border-gray-400 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    for="day_format"
                    class="block text-sm font-medium text-gray-700"
                  >
                    Day Format:
                  </label>
                  <input
                    type="text"
                    id="day_format"
                    value={options.day_format}
                    onChange={(e) => {
                      const target = e.target as HTMLInputElement;
                      handleOptionChange("day_format", target.value);
                    }}
                    class="mt-1 block w-full border-gray-400 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    for="day_overview_format"
                    class="block text-sm font-medium text-gray-700"
                  >
                    Day Overview Format:
                  </label>
                  <input
                    type="text"
                    id="day_overview_format"
                    value={options.day_overview_format}
                    onChange={(e) => {
                      const target = e.target as HTMLInputElement;
                      handleOptionChange("day_overview_format", target.value);
                    }}
                    class="mt-1 block w-full border-gray-400 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </fieldset>

            <button
              type="submit"
              class="w-full bg-indigo-600 text-white py-2 px-4 rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Generate
            </button>
          </form>
        </div>

        {/* Right Column: Output */}
        <div class="w-1/2 space-y-4">
          <div class="output">
            <h2 class="text-lg font-bold text-gray-800 mb-2">
              Generated Year Nodes
            </h2>
            <textarea
              readOnly
              value={output}
              onClick={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.select();
                navigator.clipboard.writeText(output);
              }}
              class="w-full h-64 border-gray-400 rounded-md p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm resize-none bg-gray-200"
            />
          </div>

          <div class="output">
            <h2 class="text-lg font-bold text-gray-800 mb-2">
              Dynalist Pro CSS
            </h2>
            <textarea
              readOnly
              value={PRE_POPULATED_CSS}
              onClick={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.select();
                navigator.clipboard.writeText(PRE_POPULATED_CSS);
              }}
              class="w-full h-64 border-gray-400 rounded-md p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm resize-none bg-gray-200"
            />
          </div>

          <div class="output">
            <h2 class="text-lg font-bold text-gray-800 mb-2">
              Sample Legend
            </h2>
            <textarea
              readOnly
              value={PRE_POPULATED_NODES}
              onClick={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.select();
                navigator.clipboard.writeText(PRE_POPULATED_NODES);
              }}
              class="w-full h-64 border-gray-400 rounded-md p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm resize-none bg-gray-200"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
