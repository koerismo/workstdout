import { VCalendar, VEvent, Timestamp, Timezone, WeeklyRepeat } from './core/ical.js';
import { parseToEvent } from './core/eventparser.js';
import { readCourseSheet, type CourseEntry } from './core/xlsx.js';

import config from './config.json';

export class CourseConverter {
	public courses: { entry: CourseEntry, enabled: boolean }[] = $state([]);
	public errors: string[] = $state.raw([]);
	protected output: Blob | undefined = $state.raw();
	public readyToGenerate: boolean = $state(false);

	async parseFile(file: File) {
		const result = await readCourseSheet(file);
		this.setCourses(result.ok ? result.value : []);
		this.errors = result.ok ? [] : [result.value];
		return result;
	}

	setCourses(entries: CourseEntry[]) {
		this.courses = entries.map(entry => ({ entry, enabled: true }));
		this.readyToGenerate = this.courses.length !== 0;
	}

	generateOutput() {
		const events: VEvent[] = [];
		let errors: string[] = [];

		for (const { entry, enabled } of this.courses) {
			if (!enabled) continue;
			const evResult = parseToEvent(
				entry.section,
				entry.instructor,
				entry.meetPatterns,
				entry.startDate,
				entry.endDate,
			);

			if (!evResult.ok) errors.push(evResult.value);
			else events.push(evResult.value);
		}

		this.errors = errors;
		if (errors.length) {
			this.output = undefined;
			return false;
		}

		const calendar = new VCalendar(config.product, '2.0', events);
		const text = calendar.write().join('\r\n');
		this.output = new Blob([text], { type: 'text/calendar' });
		return true;
	}

	downloadOutput() {
		if (!this.output) return;
		const url = URL.createObjectURL(this.output);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'Courses.ics';
		a.target = '_blank';
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
	}
}
