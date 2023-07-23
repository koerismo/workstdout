import * as xlsx from 'xlsx';
import { ScheduleData, type ClassEntry, type PeriodEntry, Day, type TermEntry } from './datamodel.js';
import { exportSheet } from './convert.ical.js';

export enum COUT {
	OK,
	ERR_FILETYPE, // Invalid filetype
	ERR_PARSE,    // Unparsable file
	ERR_SHEET,    // Invalid sheet
	ERR_OTHER,    // Nonspecific error (useless)
}

export enum Rows {
	Header = 2
}

export enum Cols {
	Listing    = 1,
	Credits    = 2,
	Graded     = 3,
	Section    = 4,
	Format     = 5,
	Times      = 7,
	Instructor = 9,
	StartDate  = 10,
	StopDate   = 11
}
const ROW_HEADERS = 2;
const COL_LISTING = 1;
const COL_CREDITS = 2;
const COL_SECTION = 4;
const COL_TIMES = 7;
const COL_INSTRUCTOR = 9;
const COL_DATE_START = 10;
const COL_DATE_STOP = 11;

const RE_TIMES = /([MTWRF\-]+) \| (\d{1,2}:\d{2} [AP]M) - (\d{1,2}:\d{2} [AP]M) \| (.+)/;
const RE_HHMM = /(\d{1,2}):(\d{2}) ([AP]M)/;

function parseTime(hhmm: string) {
	const [_, hh, mm, ap] = RE_HHMM.exec(hhmm);
	return (((parseInt(hh)%12) + 12 * +(ap === 'PM')) * 60 + parseInt(mm)) * 60 * 1000;
}

function parsePeriods(times: string, cls: number): Promise<PeriodEntry[]> {
	const result = RE_TIMES.exec(times);
	if (result == null) return Promise.reject(`Failed to parse class times for string "${times}"`);
	const [_, days, start, stop, place] = result;
	const periods: PeriodEntry[] = [];

	function addPeriod(day: Day) {
		periods.push({
			cls,
			day,
			start: parseTime(start),
			stop: parseTime(stop),
			place
		});
	}

	if (days.includes('M')) addPeriod(Day.M);
	if (days.includes('T')) addPeriod(Day.T);
	if (days.includes('W')) addPeriod(Day.W);
	if (days.includes('R')) addPeriod(Day.R);
	if (days.includes('F')) addPeriod(Day.F);

	return Promise.resolve(periods);
}

export async function importSheet(file: File): Promise<COUT> {
	console.log('Starting import...');

	// Read file
	if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') return COUT.ERR_FILETYPE;
	const buffer = await file.arrayBuffer();
	const book = xlsx.read(buffer, { dense: true, cellDates: true });

	// Parse sheet
	if (!book.SheetNames.length) return COUT.ERR_SHEET;
	const sheet = book.Sheets[book.SheetNames[0]];
	const data = sheet['!data'];

	// Reinterpret class data
	const num_classes = data.length - ROW_HEADERS - 1;
	const sorted: {[date: string]: ClassEntry[]} = {};
	const date_stops: {[date: string]: Date} = {};
	const date_starts: {[date: string]: Date} = {};

	for ( let i=0; i<num_classes; i++ ) {
		const row = data[i + ROW_HEADERS + 1];
		const class_entry = <ClassEntry>{
			name: row[COL_SECTION]?.v.toString(),
			desc: row[COL_INSTRUCTOR]?.v.toString(),
			schedule: await parsePeriods(<string>row[COL_TIMES].v, i)
		}

		const date_start = <Date>row[COL_DATE_START].v;
		const date_stop = <Date>row[COL_DATE_STOP].v;
		const date_index = Number(date_start);

		sorted[date_index] ??= [];
		sorted[date_index].push(class_entry);
		date_starts[date_index] = date_start;
		date_stops[date_index] = date_stop;
	}

	const term_starts = Object.keys(sorted);
	const num_terms = term_starts.length;
	const terms: TermEntry[] = [];

	for ( let i=0; i<num_terms; i++ ) {
		const date_index = term_starts[i];
		const start_date = date_starts[date_index];
		const stop_date = date_stops[date_index];
		terms.push({
			start: start_date,
			stop: stop_date,
			classes: sorted[date_index],
		});
	}

	ScheduleData.set({
		terms
	});

	console.log('Import succeeded!');
	return COUT.OK;
}