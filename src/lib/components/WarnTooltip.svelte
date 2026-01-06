<script lang="ts">
	import { TriangleAlertIcon } from '@lucide/svelte';
	import { Portal, Tooltip, useTooltip } from '@skeletonlabs/skeleton-svelte';

	const id = $props.id();
	const tooltip = useTooltip({ id, positioning: { placement: 'bottom-end', offset: { mainAxis: 12 } } });
</script>

<div class="grid gap-4">
	<Tooltip.Provider value={tooltip}>
		<Tooltip.Trigger class="opacity-40 hover:opacity-100">
			<TriangleAlertIcon class="size-4" />
		</Tooltip.Trigger>
		<Portal>
			<Tooltip.Positioner>
				<Tooltip.Content class="card block text-center bg-surface-100-900 p-2 shadow-lg text-sm">
					This section could not be fully parsed.<br>
					Exporting it may cause issues!
				</Tooltip.Content>
			</Tooltip.Positioner>
		</Portal>
	</Tooltip.Provider>
</div>
