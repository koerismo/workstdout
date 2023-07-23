import * as Excel from 'exceljs';
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
function makeTimeFloat(d: Date): Date {
	d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
	return d;
}

function getHeaderIndices(sheet: Excel.Worksheet, row: number): HeaderIndices | undefined {
	const colCount = sheet.columnCount;
	const indices: Partial<HeaderIndices> = {};

	for (let i=1; i<=colCount; i++) {
		const cellText = sheet.getCell(row, i).text.toLowerCase();
		if (!ValidHeaders.includes(cellText as ValidHeader)) continue;
		indices[cellText as ValidHeader] = i;
	}

	if (Object.keys(indices).length < 5) return;
	return indices as HeaderIndices;
} 

export async function readCourseSheet(file: File): Promise<ResultType<CourseEntry[], string>> {
	const buffer = await file.arrayBuffer();
	const workbook = new Excel.Workbook();

	try {
		await workbook.xlsx.load(buffer);
	}
	catch (e) {
		console.error(e);
		return Err(String(e));
	}

	const sheet = workbook.getWorksheet(1);
	if (!sheet) return Err('Provided spreadsheet is empty!');

	const headerRow = 3;
	const headerIndices = getHeaderIndices(sheet, headerRow);
	if (!headerIndices) return Err('Could not identify spreadsheet headers!');

	let row: number;
	const get = <T extends Excel.CellValue>(key: ValidHeader) => sheet.getCell(row, headerIndices[key]).value as T;

	const out: CourseEntry[] = [];
	for (row=headerRow+1; row<=sheet.rowCount; row++) {
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
