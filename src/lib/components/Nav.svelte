<script lang="ts">
	import { GithubIcon } from '@lucide/svelte';
	import { AppBar } from '@skeletonlabs/skeleton-svelte';
	import { resolve } from '$app/paths';
</script>

<AppBar>
	<AppBar.Toolbar class="grid-cols-[1fr_auto] w-page">
		<AppBar.Headline>
			<a class="btn hover:preset-tonal" href={resolve('/')}>WorkStdout</a>
		</AppBar.Headline>
		<AppBar.Trail class="flex flex-row place-items-center">
			<a type="button" class="btn-icon hover:preset-tonal" href="https://github.com/koerismo/workstdout" rel="external noreferrer" referrerpolicy="no-referrer">
				<GithubIcon class="size-6" />
			</a>
		</AppBar.Trail>
	</AppBar.Toolbar>
</AppBar>
