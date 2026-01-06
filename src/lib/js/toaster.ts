import { createToaster } from "@skeletonlabs/skeleton-svelte";

export const toaster = createToaster({
	max: 6,
	placement: 'bottom-end'
});
