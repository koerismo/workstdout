import { Err, Ok, type ResultType } from '@koerismo/result';
import { Timestamp, Timezone, VEvent, WeeklyRepeat, type WeekdayString } from './ical.js';

const RE_HHMM = /(\d\d?):(\d\d) ([AP]M)/;

/** Parses a HH:MM (AM/PM) string to minutes. */
function parseHHMM(str: string): number | undefined {
	const strMatch = str.match(RE_HHMM);
	if (!strMatch) return;

	const [_, hh, mm, amPM] = strMatch;
	const hours = +hh, minutes = +mm;

	const pmOffset = ((amPM === 'PM') !== (hours === 12)) ? 12 : 0;
	return (hours + pmOffset) * 60 + minutes;
}

const WeekDays = ['M', 'T', 'W', 'R', 'F', 'S', 'U'] as const;
const WeekMap: Record<string, WeekdayString> = {
	'M': 'MO',
	'T': 'TU',
	'W': 'WE',
	'R': 'TH',
	'F': 'FR',
	'S': 'SA',
	'U': 'SU',
};

export function parseToEvent(
		section: string,
		instructor: string,
		meetingPattern: string,
		termStartDate: Date,
		termEndDate: Date,
	): ResultType<VEvent, string> {

	const [dayStr, timeStr, locStr] = meetingPattern.split('|', 3);
	const dayStrSplit = dayStr.toUpperCase().split(/\W/g);
	const days: WeekdayString[] = [];

	// Parse days
	for (let i=0; i<WeekDays.length; i++) {
		const D = WeekDays[i];
		if (!dayStrSplit.includes(D)) continue;
		days.push(WeekMap[D]);
	}

	if (!days.length)
		return Err('No days were defined for the session to take place!');

	// Parse start/end times
	const [startTimeStr, endTimeStr] = timeStr.split(' - ', 2);
	const startTime = parseHHMM(startTimeStr);
	const endTime   = parseHHMM(endTimeStr);

	if (startTime === undefined || endTime === undefined)
		return Err('Failed to parse time ranges: "'+timeStr+'"');

	// Figure out when the first class will occur.
	const classStart = new Date(termStartDate);
	for (let i=0; i<7; i++) {
		classStart.setDate(termStartDate.getDate() + i);
		const weekday = classStart.getDay() - 1;
		if (days.includes(WeekMap[WeekDays[weekday]])) break;
	}

	const termEnd = Timestamp.from(termEndDate, Timezone.Floating).add({ days: 1 });

	const classEnd = new Date(classStart);
	classStart.setHours(0, startTime);
	classEnd.setHours(0, endTime);

	return Ok(
		new VEvent(
			section,
			instructor,
			Timestamp.from(classStart, Timezone.Floating),
			Timestamp.from(classEnd, Timezone.Floating),
			locStr.trimStart(),
			new WeeklyRepeat(days, termEnd),
		)
	);
}
