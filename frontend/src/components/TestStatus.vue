<template>
    <Tag
        v-if="status == 'passed'"
        severity="success"
    >
        <Icon name="check"> </Icon>
        Passed
    </Tag>
    <Tag
        v-else-if="status == 'approved'"
        severity="success"
    >
        <Icon name="check"> </Icon>
        Approved
    </Tag>
    <Tag
        v-else-if="status == 'new'"
        severity="info"
    >
        <Icon name="plus"> </Icon>
        New
    </Tag>
    <Tag
        v-else-if="status == 'reported'"
        severity="warn"
    >
        <Icon name="times"> </Icon>
        Reported
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
    status: 'passed' | 'failed' | 'new' | 'reported' | 'approved';
}>();
</script>
