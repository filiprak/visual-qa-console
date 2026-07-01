import { ref } from "vue";

const visible = ref(false);
const id = ref<number>();

export function useTestcaseView() {
    function openTestcase(testcase_id: number) {
        id.value = testcase_id;
        visible.value = true;
    }

    return { openTestcase, id, visible };
}