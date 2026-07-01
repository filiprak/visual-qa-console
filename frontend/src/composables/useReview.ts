import { ref } from 'vue';
import { api } from '../api';

export function useReview() {
    const loading = ref(false);

    async function acceptTestcase(testcase_id: number) {
        if (!confirm('Confirm accepting testcase')) return;
        try {
            loading.value = true;
            await api.review.create({
                testcase_id,
                accepted: true,
            })
        } finally {
            loading.value = false;
        }
    }

    return { acceptTestcase, loading };
}
