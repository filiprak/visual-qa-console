import { ref } from 'vue';
import { api } from '../api';
import { useConfirmDialog } from './useConfirmDialog';
import { useToast } from 'primevue/usetoast';

export function useReview() {
    const toast = useToast();
    const { confirmDialog } = useConfirmDialog();

    const loading = ref(false);

    async function acceptTestcase(testcase_ids: number[]) {
        if (
            !(await confirmDialog({
                message:
                    'Are you sure you want to accept this UI visual test(s)? This action will mark the screenshot as approved and update baseline screenshot.',
                icon: 'pi pi-exclamation-triangle',
            }))
        )
            return false;
        try {
            loading.value = true;
            await api.review.create({
                testcase_ids,
                accepted: true,
            });
            toast.add({
                summary: 'Result(s) accepted',
                detail: 'Baseline screenshot(s) was updated',
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
