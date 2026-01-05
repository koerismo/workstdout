import { read as readXLSX, type WorkSheet, type WorkBook, utils, type CellObject, type CellAddress } from 'xlsx';
import { Ok, Err, type ResultType } from '@koerismo/result';

export interface CourseEntry {
	startDate: Date;
	endDate: Date;
	section: string;
	instructor: string;
	meetPatterns: string;
}

type HeaderIndices = {[key: string]: number};
type ValidHeader = 'start date' | 'end date' | 'instructor' | 'meeting patterns' | 'section';
const ValidHeaders = ['start date', 'end date', 'instructor', 'meeting patterns', 'section'] as const;

/** Offsets the provided Date's local time to equal its UTC time. */
function makeTimeFloat<T extends Date | undefined>(d: T): T {
	if (!d) return d;
	d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
	return d;
}

function getSheetMaxs(sheet: WorkSheet): { r: number; c: number; } {
	let rowCount = 0;
	let colCount = 0;
	const keys = Object.keys(sheet);
	
	for (let i=0; i<keys.length; i++) {
		const key = keys[i];
		if (key[0] === '!') continue;

		const { c, r } = utils.decode_cell(key);
		if (c > colCount) colCount = c;
		if (r > rowCount) rowCount = r;
	}

	return { c: colCount, r: rowCount };
}

function getHeaderIndices(sheet: WorkSheet, colCount: number, r: number): HeaderIndices | undefined {
	const indices: Partial<HeaderIndices> = {};

	for (let c=0; c<colCount; c++) {
		let cellText: CellObject['v'] = sheet[utils.encode_cell({ r, c })]?.v;
		if (typeof cellText !== 'string') continue;

		cellText = cellText.toLowerCase();
		if (!ValidHeaders.includes(cellText as ValidHeader)) continue;
		indices[cellText as ValidHeader] = c;
	}

	if (Object.keys(indices).length < 5) return;
	return indices as HeaderIndices;
}

export async function readCourseSheet(file: File): Promise<ResultType<CourseEntry[], string>> {
	const buffer = await file.arrayBuffer();
	let workbook: WorkBook;
	try {
		workbook = readXLSX(buffer, { cellHTML: false, cellFormula: false, cellText: false, cellDates: true });
	}
	catch (e) {
		console.error(e);
		return Err(String(e));
	}

	const sheet = workbook.Sheets[workbook.SheetNames[0]];
	if (!sheet) return Err('Provided spreadsheet is empty!');

	const sheetMaxs = getSheetMaxs(sheet);
	const colCount = sheetMaxs.c + 1;
	const rowCount = sheetMaxs.r + 1;

	const headerRow = 2;
	const headerIndices = getHeaderIndices(sheet, colCount, headerRow);
	if (!headerIndices) return Err('Could not identify spreadsheet headers!');

	let row: number;
	const get = <T>(key: ValidHeader) => {
		return (
			sheet[
				utils.encode_cell({ r: row, c: headerIndices[key] })
			] as CellObject
		)?.v as T;
	}

	const out: CourseEntry[] = [];
	for (row=headerRow+1; row<rowCount; row++) {
		out.push({
			startDate: makeTimeFloat(get<Date>('start date')),
			endDate: makeTimeFloat(get<Date>('end date')),
			section: get<string>('section'),
			instructor: get<string>('instructor'),
			meetPatterns: get<string>('meeting patterns'),
		});
	}

	return Ok(out);
}
