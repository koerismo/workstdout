import { writable } from "svelte/store";

export enum Day {
	S, M, T, W, R, F, U
}

export interface ClassEntry {
	name: string;
	desc: string;
	schedule: PeriodEntry[];
}

export interface PeriodEntry {
	cls: number;
	day: Day;
	start: number;
	stop: number;
	place: string;
}

export interface TermEntry {
	start: Date;
	stop: Date;
	classes: ClassEntry[];
}

export interface Schedule {
	terms: TermEntry[];
}

export const ScheduleData = writable<Schedule|null>(null);