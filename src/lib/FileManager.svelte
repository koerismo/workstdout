<script lang="ts">
	import { importSheet } from "../core/convert.xlsx";
	let inputElement: HTMLInputElement;

	function doParse() {
		importSheet(inputElement.files[0]);
	}
</script>

<input type="file" on:input="{doParse}" bind:this={inputElement} />
