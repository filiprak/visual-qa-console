import { ref } from 'vue';
import { api } from '../api';
import { useConfirmDialog } from './useConfirmDialog';

export function useReview() {
    const { confirmDialog } = useConfirmDialog();

    const loading = ref(false);

    async function acceptTestcase(testcase_id: number) {
        if (
            !(await confirmDialog({
                message:
                    'Are you sure you want to accept this UI visual test? This action will mark the screenshot as approved and update baseline screenshot.',
                icon: 'pi pi-exclamation-triangle',
            }))
        )
            return false;
        try {
            loading.value = true;
            await api.review.create({
                testcase_id,
                accepted: true,
            });
        } finally {
            loading.value = false;
        }
        return true;
    }

    return { acceptTestcase, loading };
}
