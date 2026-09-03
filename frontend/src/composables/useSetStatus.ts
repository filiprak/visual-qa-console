import { ref, type Ref } from 'vue';
import { api } from '../api';
import { useDialog } from './useDialog';
import { useToast } from 'primevue/usetoast';
import SetStatusDialog from '../blocks/SetStatusDialog.vue';

export function useSetStatus() {
    const toast = useToast();
    const { confirmDialog } = useDialog();

    const loading = ref(false);

    async function setTestcaseStatus(testcase_ids: number[]) {
        const data = {
            update_status: ref<'reported' | 'new' | 'passed' | 'failed'>('reported'),
        };

        const { confirmed } = await confirmDialog({
            message: SetStatusDialog,
            data,
        });

        if (!confirmed)
            return false;
        try {
            loading.value = true;
            await api.review.create({
                testcase_ids,
                skip_baseline_update: true,
                status: data.update_status.value,
            });
            toast.add({
                summary: 'Testcase(s) status updated',
                severity: 'success',
                life: 1300,
            });
        } finally {
            loading.value = false;
        }
        return true;
    }

    return { setTestcaseStatus, loading };
}
