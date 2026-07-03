import { ref } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';

const visible = ref(false);
const id = ref<number>();

export function useTestcaseView() {

    function openTestcase(testcase_id: number) {
        id.value = testcase_id;
        visible.value = true;
    }

    onBeforeRouteLeave((_, from, next) => {
        if (visible.value) {
            visible.value = false;
            next(from);
        } else {
            next();
        }
    });

    return { openTestcase, id, visible };
}
