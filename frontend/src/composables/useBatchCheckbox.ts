import { h, ref, computed, type FunctionalComponent, type Ref } from 'vue';
import Checkbox from 'primevue/checkbox';

type WithGroup = { id: number; group?: string };

export function useBatchCheckbox<T extends WithGroup>(items: Ref<T[]>) {
    // store only IDs for simplicity
    const selected = ref<number[]>([]);

    const allIds = computed(() => items.value.map(i => i.id));

    const groupMap = computed(() => {
        const map = new Map<string, number[]>();
        for (const item of items.value) {
            if (!item.group) continue;
            if (!map.has(item.group)) map.set(item.group, []);
            map.get(item.group)!.push(item.id);
        }
        return map;
    });

    const isAllChecked = computed(() =>
        allIds.value.length > 0 &&
        allIds.value.every(id => selected.value.includes(id))
    );

    function setAll(checked: boolean) {
        selected.value = checked ? [...allIds.value] : [];
    }

    function toggleGroup(group: string, checked: boolean) {
        const groupIds = groupMap.value.get(group) ?? [];

        if (checked) {
            const set = new Set(selected.value);
            groupIds.forEach(id => set.add(id));
            selected.value = [...set];
        } else {
            selected.value = selected.value.filter(id => !groupIds.includes(id));
        }
    }

    function toggleItem(id: number, checked?: boolean) {
        const set = new Set(selected.value);
        checked = checked === undefined ? !set.has(id) : checked;
        if (checked) set.add(id);
        else set.delete(id);
        selected.value = [...set];
    }

    const AllCheckbox: FunctionalComponent = (props, { attrs }) =>
        h(Checkbox, {
            ...attrs,
            modelValue: isAllChecked.value,
            binary: true,
            'onUpdate:model-value': (val: boolean) => setAll(val),
        });

    const GroupCheckbox: FunctionalComponent<{ group: string }> = (
        (props, { attrs }) =>
            h(Checkbox, {
                ...attrs,
                modelValue: groupMap.value.get(props.group)?.every(id =>
                    selected.value.includes(id)
                ) ?? false,
                binary: true,
                'onUpdate:model-value': (val: boolean) =>
                    toggleGroup(props.group, val),
            })
    );

    const ItemCheckbox: FunctionalComponent<{ value: number }> = (
        (props, { attrs }) =>
            h(Checkbox, {
                ...attrs,
                modelValue: selected.value.includes(props.value),
                binary: true,
                'onUpdate:model-value': (val: boolean) =>
                    toggleItem(props.value, val),
            })
    );

    return {
        selected,
        AllCheckbox,
        GroupCheckbox,
        ItemCheckbox,
        isAllChecked,
        toggleItem,
    };
}