import { ref } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';

interface OpenTestcaseOpts {
    prevId?: (current_id?: number) => Promise<number | undefined>,
    nextId?: (current_id?: number) => Promise<number | undefined>,
}

const visible = ref(false);
const id = ref<number>();
const options = ref<OpenTestcaseOpts>();

export function useTestcaseView() {
    function openTestcase(testcase_id: number, opts?: OpenTestcaseOpts) {
        id.value = testcase_id;
        visible.value = true;
        options.value = opts;
    }

    onBeforeRouteLeave((_, from, next) => {
        if (visible.value) {
            visible.value = false;
            next(from);
        } else {
            next();
        }
    });

    return { openTestcase, id, visible, options };
}
