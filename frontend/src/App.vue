<template>
    <div class="text-3xl font-bold underline">
        <Button>Verify</Button>
        <ToggleSwitch>Verify</ToggleSwitch>
        <IconField>
            <InputIcon class="pi pi-search" />
            <InputText v-model="text"
                       placeholder="Search" />
        </IconField>
    </div>
</template>
<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import Button from "primevue/button"
import ToggleSwitch from 'primevue/toggleswitch';
import IconField from 'primevue/iconfield';
import InputText from 'primevue/inputtext';
import InputIcon from 'primevue/inputicon';

const res = ref<unknown>();
const text = ref<string>();

onBeforeMount(() => {
    fetch('/api').then(r => r.json()).then((d) => {
        res.value = d;
    })
});
</script>