import { ScheduleData, type ClassEntry, type PeriodEntry, type TermEntry } from './datamodel.js';
import { get } from 'svelte/store';

const timezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;

const NEWLINE = '\r\n';

const template_header = [
	'BEGIN:VCALENDAR',
	'PRODID:-//Koerismo//Workdout',
	'VERSION:2.0',
].join(NEWLINE);
const template_footer = 'END:VCALENDAR';

function esc(text: string) {
	return text.replaceAll('\n','\\n');
}

function toFixedLength(number: number, length: number) {
	let s = number.toString();
	if (s.length === length) return s;
	if (s.length > length) return s.slice(0,length);
	return '0'.repeat(length - s.length) + s;
}

// https://stackoverflow.com/questions/10518804/formatting-time-for-ical-export
function writeUTCTimestamp(date: Date) {
	return (
		date.getUTCFullYear()
		+ toFixedLength(date.getUTCMonth() + 1, 2)
		+ toFixedLength(date.getUTCDate(), 2)
		+ 'T'
		+ toFixedLength(date.getUTCHours(), 2)
		+ toFixedLength(date.getUTCMinutes(), 2)
		+ toFixedLength(date.getUTCSeconds(), 2)
		+ 'Z'
	);
}

/** Moves all events to align with the week, and then bumps ones before the start date. */
function bumpDate(start: Date, period: Date) {
	period.setDate(period.getDate() + 7 * +(period < start));
}

function writePeriod(term: TermEntry, cls: ClassEntry, period: PeriodEntry) {
	const now = writeUTCTimestamp(new Date());
	const dayOffset = (period.day - term.start.getUTCDay()) * 1000 * 60 * 60 * 24;
	const start_ts = new Date(Number(term.start) + period.start + timezoneOffset + dayOffset);
	const stop_ts = new Date(Number(term.start) + period.stop + timezoneOffset + dayOffset);
	bumpDate(term.start, start_ts);
	bumpDate(term.start, stop_ts);
	const start = writeUTCTimestamp(start_ts);
	const end = writeUTCTimestamp(stop_ts);
	const term_stop = writeUTCTimestamp(term.stop);

	return [
		'BEGIN:VEVENT',
		'SUMMARY:'+esc(cls.name ?? ''),
		'DESCRIPTION:'+esc(cls.desc ?? ''),

		'CREATED:'+now,
		'DTSTAMP:'+now,
		'LAST-MODIFIED:'+now,
		'DTSTART:'+start,
		'DTEND:'+end,

		'LOCATION:'+esc(period.place),
		'RRULE:FREQ=WEEKLY;UNTIL='+term_stop,
		'SEQUENCE:1',
		'TRANSP:OPAQUE',
		'UID:'+crypto.randomUUID(),
		'END:VEVENT',
	].join(NEWLINE);
}

export function exportSheet() {
	console.log('Starting export...');

	const sheet = get(ScheduleData);
	const out = [ template_header ];

	for ( const term of sheet.terms ) {
		for ( const cls of term.classes ) {
			for ( const period of cls.schedule ) {
				out.push(writePeriod(term, cls, period));
			}
		}
	}

	console.log('Export succeeded!');
	out.push( template_footer );
	return out.join(NEWLINE);
}