<template>
    <Tag
        v-if="status == 'passed'"
        severity="success"
    >
        <Icon name="check"> </Icon>
        Passed
    </Tag>
    <Tag
        v-else
        severity="danger"
    >
        <Icon name="times"></Icon>
        Failed
    </Tag>
</template>
<script setup lang="ts">
defineProps<{
    status: 'passed' | 'failed';
}>();
</script>
