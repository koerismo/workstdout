import { createToaster } from "@skeletonlabs/skeleton-svelte";

export const toaster = createToaster({
	max: 5,
	placement: 'bottom-end'
});
