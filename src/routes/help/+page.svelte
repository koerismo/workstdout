<script lang="ts">
	import { resolve } from '$app/paths';

	// import FocusImage from "$lib/components/FocusImage.svelte";
	import HelpImage from '$lib/assets/help/help_workday_cropped.webp';

</script>
<main class="flex flex-col w-page gap-5 my-8">
	<h2 class="h2">Usage</h2>
	<p>
		This tool is designed to convert Workday Excel exports into <code>.ics</code> (iCalendar) calendar files, which can be imported into most popular calendar software.
	</p>

	<ol class="list-decimal ps-[0.9em] h5 space-y-6">
		<li>
			<b>Exporting from Workday</b>
			<p class="text-base-all mb-3">
				You can find your registered courses by going to the <b>View My Courses</b> page of Workday, found in the Academics section.
				After navigating to this page, use the small "Export spreadsheet" button to save the table as a <code>.xlsx</code> file.
			</p>
			<!-- <FocusImage src={HelpImage} bounds="86.5% 73% 1.6% 8%"></FocusImage> -->
			<img class="rounded-sm" src={HelpImage} alt="Shows the Workday interface, highlighting the Excel export button of the registered courses." />
		</li>
		<li>
			<b>Converting</b>
			<p class="text-base-all">
				Navigate to this website's <a class="underline" href={resolve('/')}>homepage</a>. Click the file picker at the top of the page to upload the Workday spreadsheet file, or drag the file onto it.
				A list of the found courses should appear.
			</p>
			<p class="text-base-all">
				Uncheck any courses which you do not wish to export, then click the Download button to generate the calendar file.
				After generation finishes, your browser should automatically download the resulting file.
			</p>
		</li>
		<li class="space-y-3">
			<b>Importing into a Calendar</b>
			<p class="text-base-all">
				<b>Google:</b>
				To add to Google Calendar, navigate to the <a class="underline" href="https://calendar.google.com/calendar/r/settings/export" rel="external noreferrer">Import & Export</a>
				settings page and select the iCalendar file for upload. After configuring where the events should be added to, press Import to insert them.
			</p>
			<p class="text-base-all">
				<b>Apple:</b>
				On MacOS, the iCalendar file can be double-clicked to insert it into Apple Calendar.
			</p>
			<p class="text-base-all">
				<b>Outlook:</b>
				To add to Outlook Calendar, press the Add Calendar button located on the lefthand side, then select Import ICS.
				Select the iCalendar file. After configuring where the events should be added to, press Import to insert them.
			</p>
		</li>
	</ol>

	<h2 class="h2">Troubleshooting</h2>

	<h4 class="h4">No courses appear after I upload my file.</h4>
	<p>
		If no courses are appearing, it is likely that the spreadsheet you are uploading is either broken, incomplete, or otherwise incompatible.
		Try redownloading the file to ensure that the file is valid, or opening and re-saving the spreadsheet with Excel or an Excel-compatible alternative.
	</p>
	<p>
		If you continue to get errors such as <code class="code">Could not identify spreadsheet headers!</code>, it is possible that this app must be updated to maintain compatibility with Workday exports.
		<a class="underline" rel="external noreferrer" href="https://github.com/koerismo/workstdout/issues/new">Create a report on our issue tracker!</a>
	</p>
</main>
