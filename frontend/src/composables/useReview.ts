import { ref, type Ref } from 'vue';
import { api } from '../api';
import { useDialog } from './useDialog';
import { useToast } from 'primevue/usetoast';
import ReviewDialog from '../blocks/ReviewDialog.vue';

export function useReview() {
    const toast = useToast();
    const { confirmDialog } = useDialog();

    const loading = ref(false);

    async function acceptTestcase(testcase_ids: number[]) {
        const data = {
            update_baseline: ref(true),
        };

        const { confirmed } = await confirmDialog({
            message: ReviewDialog,
            data,
        });
        const skip_baseline_update = data.update_baseline.value === false;

        if (!confirmed)
            return false;
        try {
            loading.value = true;
            await api.review.create({
                testcase_ids,
                skip_baseline_update,
                accepted: true,
            });
            toast.add({
                summary: 'Testcase(s) accepted',
                detail: skip_baseline_update ? 'Baseline screenshot(s) update skipped' : 'Baseline screenshot(s) was updated',
                severity: 'success',
                life: 1300,
            });
        } finally {
            loading.value = false;
        }
        return true;
    }

    return { acceptTestcase, loading };
}
