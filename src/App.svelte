<script lang="ts">
	import { importSheet } from './core/convert.xlsx.js';
	import { exportSheet } from './core/convert.ical.js';
	import saveAs from 'save-as';

	let input: HTMLInputElement;

	async function onInput() {
		await importSheet(input.files[0]);
		const ical = new Blob([exportSheet()], { type: 'text/calendar' });
		saveAs(ical, input.files[0].name.slice(0, -3) + 'ics');
	}

</script>

<input type="file" on:input="{onInput}" bind:this={input} />