function escapeText(t: string) {
	return t.replace(/[,\n]/g, c => '\\' + c);
}

function formatInt(t: number, len: number=2): string {
	return t.toString().padStart(len, '0');
}

// function mod(n: number, d: number): number {
// 	return ((n % d) + d) % d;
// }

export const enum Timezone {
	Invalid = -1,
	Floating,
	Local,
	UTC,
};

export class Timestamp {
	constructor(
		public zone: Timezone,
		public year: number,
		public month: number = 0,
		public day: number = 1,
		public hour: number = 0,
		public minute: number = 0,
		public second: number = 0,
	) {}

	static from(d: Date | string, timezone: Timezone): Timestamp {
		if (typeof d === 'string')
			d = new Date(d);

		return new this(
			timezone,
			d.getFullYear(),
			d.getMonth(),
			d.getDate(),
			d.getHours(),
			d.getMinutes(),
			d.getSeconds()
		);
	}

	static now(): Timestamp {
		return this.from(new Date(), Timezone.UTC);
	}

	toDate(): Date {
		return new Date(this.year, this.month, this.day, this.hour, this.minute, this.second);
	}

	delocalize(): Timestamp {
		if (this.zone !== Timezone.Local) return this;
		return Timestamp.from(this.toDate(), Timezone.UTC);
	}

	add(p: Partial<{ seconds: number; minutes: number; hours: number; days: number; months: number; years: number; }>): Timestamp {
		const d = this.toDate();
		if (p.seconds) d.setSeconds(d.getSeconds() + p.seconds);
		if (p.minutes) d.setMinutes(d.getMinutes() + p.minutes);
		if (p.hours) d.setHours(d.getHours() + p.hours);
		if (p.days) d.setDate(d.getDate() + p.days);
		if (p.months) d.setMonth(d.getMonth() + p.months);
		if (p.years) d.setFullYear(d.getFullYear() + p.years);
		return Timestamp.from(d, this.zone);
	}

	isAfter(d: Timestamp): boolean {
		if (d.zone !== this.zone) throw 'Cannot compare timestamps with different timezones!';
		return d.toDate().getTime() < this.toDate().getTime();
	}

	toString(): string {
		let format: string;
		if (this.zone === Timezone.Floating)
			format = '%';
		else if (this.zone === Timezone.UTC)
			format = '%Z';
		else if (this.zone === Timezone.Local) {
			const tzName = Intl.DateTimeFormat().resolvedOptions().timeZone;
			format = `TZID=${escapeText(tzName)}:%`;
		} else {
			throw Error('Timestamp has invalid timezone!');
		}

		return format.replace('%', (
			  formatInt(this.year, 4)
			+ formatInt(this.month + 1)
			+ formatInt(this.day)
			+ 'T'
			+ formatInt(this.hour)
			+ formatInt(this.minute)
			+ formatInt(this.second)
		));
	}

	cc(): ';' | ':' {
		return this.zone === Timezone.Local ? ';' : ':';
	}
}

export type WeekdayString = 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU';

// This is only implementing a tiny subset of the spec!
// https://www.rfc-editor.org/rfc/rfc5545#section-3.3.10

export class WeeklyRepeat {
	constructor(
		public days: WeekdayString[],
		public until?: Timestamp
	) {
	}

	toString() {
		const keys: string[] = ['FREQ=WEEKLY'];
		if (this.until) {
			if (this.until.zone === Timezone.Local) throw 'whoops';
			keys.push('UNTIL=' + this.until.toString());
		}
		keys.push('BYDAY=' + this.days.join(','));
		return keys.join(';');
	}
}


export class VCalendar {
	constructor(
		public prodId: string,
		public version: string,
		public events: VEvent[] = [],
		public props: Record<string, string> = {},
	) {
	}
	
	write() {
		return [
			'BEGIN:VCALENDAR',
			'PRODID:' + escapeText(this.prodId),
			'VERSION:' + escapeText(this.version),
			...Object.entries(this.props)
				.map( ([k, v]) => k.toUpperCase() + ':' + escapeText(v) ),
			...this.events
				.flatMap( e => e.write() ),
			'END:VCALENDAR'
		]
	}
}

export class VEvent {
	constructor(
		public summary: string,
		public description: string,
		public dtstart: Timestamp,
		public dtend: Timestamp,
		public location: string,
		public repeat?: WeeklyRepeat,
		public dtstamp: Timestamp = Timestamp.now(),
		public uid: string = crypto.randomUUID(),
		) {
		}

	write() {
		const  dstamp = this.dtstamp,
			   dstart = this.dtstart,
			   dend = this.dtend;

		return [
			'BEGIN:VEVENT',
			'DTSTAMP'      + dstamp.cc() + dstamp.toString(),
			'DTSTART'      + dstart.cc() + dstart.toString(),
			'DTEND'        + dend.cc()   + dend.toString(),
			'DESCRIPTION:' + escapeText(this.description),
			'SUMMARY:'     + escapeText(this.summary),
			'LOCATION:'    + escapeText(this.location),
			...(this.repeat ? ['RRULE:' + this.repeat.toString()] : []),
			'UID:'         + this.uid,
			'END:VEVENT'
		]
	}
}
