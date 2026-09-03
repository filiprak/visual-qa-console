<template>
    <div class="p-12 flex justify-center">
        <div class="max-w-[1600px] grow">
            <div class="flex justify-between items-center my-8">
                <div>
                    <h1 class="text-5xl font-semibold">Settings</h1>
                    <p class="text-muted-color mt-2">Configure console behaviour. Only administrators can view and
                        modify settings.</p>
                </div>
            </div>

            <div class="border border-surface rounded-xl p-6 bg-surface-0 dark:bg-surface-900 flex flex-col gap-6">
                <div>
                    <h2 class="text-2xl font-semibold">Report issue link</h2>
                    <p class="text-muted-color text-sm mt-1">
                        Custom base URL opened from the Testcase view via the "Report issue" button.
                        Query parameters are URL-encoded when the link is generated.
                        Parameter values may use template variables:
                        <code class="font-mono">{GROUP}</code>,
                        <code class="font-mono">{TEST}</code>,
                        <code class="font-mono">{BASELINE_URL}</code>,
                        <code class="font-mono">{DIFF_URL}</code>,
                        <code class="font-mono">{ACTUAL_URL}</code>.
                    </p>
                </div>

                <div v-if="loading"
                     class="flex flex-col gap-3">
                    <Skeleton width="40%"
                              height="20px" />
                    <Skeleton width="100%"
                              height="40px" />
                    <Skeleton width="100%"
                              height="40px" />
                </div>

                <template v-else>
                    <div class="flex flex-col gap-2">
                        <label for="base_url"
                               class="font-semibold">Base URL</label>
                        <InputText id="base_url"
                                   v-model="base_url"
                                   placeholder="https://jira.example.com/secure/CreateIssue!default.jspa"
                                   fluid
                                   :invalid="!!errors.base_url" />
                        <small class="text-red-500"
                               v-if="errors.base_url">{{ errors.base_url }}</small>
                        <small class="text-muted-color">Leave empty to fall back to the built-in issue link.</small>
                    </div>

                    <div class="flex flex-col gap-3">
                        <div class="flex justify-between items-center">
                            <span class="font-semibold">Query parameters</span>
                            <Button label="Add parameter"
                                    icon="pi pi-plus"
                                    severity="secondary"
                                    size="small"
                                    @click="addParam" />
                        </div>

                        <div v-if="!params.length"
                             class="text-sm text-muted-color italic border border-dashed border-surface rounded-lg p-4 text-center">
                            No query parameters. Click "Add parameter" to add one.
                        </div>

                        <div v-for="(param, index) in params"
                             :key="index"
                             class="flex gap-2 items-start">
                            <div class="flex flex-col gap-1 basis-[280px] shrink-0">
                                <InputText v-model="param.key"
                                           placeholder="param name, e.g. issue[title]"
                                           fluid
                                           :invalid="!!paramErrors[index]?.key" />
                                <small class="text-red-500"
                                       v-if="paramErrors[index]?.key">{{ paramErrors[index].key }}</small>
                            </div>
                            <div class="flex flex-col gap-1 grow">
                                <Textarea v-model="param.value"
                                          placeholder="value, e.g. Fix visual test {GROUP}/{TEST}&#10;&#10;Baseline: {BASELINE_URL}&#10;Diff: {DIFF_URL}&#10;Actual: {ACTUAL_URL}"
                                          :rows="10"
                                          autoResize
                                          fluid
                                          class="param-value-textarea" />
                            </div>
                            <Button icon="pi pi-trash"
                                    severity="danger"
                                    variant="outlined"
                                    v-tooltip.top="'Remove parameter'"
                                    @click="removeParam(index)" />
                        </div>
                        <small class="text-red-500"
                               v-if="errors.params">{{ errors.params }}</small>
                    </div>

                    <div class="border border-surface rounded-lg p-4 bg-emphasis flex flex-col gap-2">
                        <span class="font-semibold text-sm">Available template variables</span>
                        <div class="grid grid-cols-1 md:grid-cols-1 gap-0 text-sm">
                            <div><code class="font-mono font-semibold">{GROUP}</code> <span
                                      class="text-muted-color">— testcase group, e.g. portal.apps.auth.desktop</span>
                            </div>
                            <div><code class="font-mono font-semibold">{TEST}</code> <span
                                      class="text-muted-color">— testcase name, e.g. login flow</span></div>
                            <div><code class="font-mono font-semibold">{BASELINE_URL}</code> <span
                                      class="text-muted-color">— baseline screenshot URL</span></div>
                            <div><code class="font-mono font-semibold">{DIFF_URL}</code> <span
                                      class="text-muted-color">— diff screenshot URL</span></div>
                            <div><code class="font-mono font-semibold">{ACTUAL_URL}</code> <span
                                      class="text-muted-color">— actual (result) screenshot URL</span></div>
                        </div>
                    </div>

                    <div class="flex flex-col gap-2">
                        <span class="font-semibold text-sm">Live preview (example values, URL-encoded) — click to open</span>
                        <a v-if="previewUrl"
                           :href="previewUrl"
                           target="_blank"
                           rel="noopener noreferrer"
                           class="text-xs break-all bg-surface-100 dark:bg-surface-800 rounded-lg p-3 font-mono text-primary hover:underline block">{{ previewUrl }}</a>
                        <span v-else
                              class="text-sm text-muted-color italic">Enter a base URL to preview the generated
                            link.</span>
                    </div>

                    <div class="flex justify-end gap-3">
                        <Button label="Reset"
                                severity="secondary"
                                variant="outlined"
                                :disabled="saving"
                                @click="resetForm" />
                        <Button label="Save settings"
                                severity="primary"
                                :loading="saving"
                                @click="saveSettings" />
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, reactive, ref, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import vTooltip from 'primevue/tooltip';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Skeleton from 'primevue/skeleton';
import { useAuth } from '../composables/useAuth';
import { useRouter } from 'vue-router';
import { fetchReportIssueConfig, saveReportIssueConfig } from '../composables/useReportIssue';
import { buildReportIssueUrl } from '../utils/reportIssue';
import { showError } from '../errors';

const toast = useToast();
const { user } = useAuth();
const router = useRouter();

watch(user, (u) => {
    if (u === null) return;
    if (!u.is_admin) {
        router.push('/');
    }
}, { immediate: true });

const loading = ref(true);
const saving = ref(false);

const base_url = ref('');
const params = ref<{ key: string; value: string }[]>([]);

const errors = reactive({
    base_url: '',
    params: '',
});
const paramErrors = ref<{ key?: string }[]>([]);

const previewUrl = computed(() => {
    return buildReportIssueUrl(
        { base_url: base_url.value, params: params.value },
        {
            group: 'portal.apps.auth.desktop',
            test: 'login flow',
            baselineUrl: 'https://example.com/login-flow.baseline.png',
            diffUrl: 'https://example.com/login-flow.diff.png',
            actualUrl: 'https://example.com/login-flow.png',
        },
    );
});

function addParam() {
    params.value.push({ key: '', value: '' });
    paramErrors.value.push({});
}

function removeParam(index: number) {
    params.value.splice(index, 1);
    paramErrors.value.splice(index, 1);
}

function validate(): boolean {
    let valid = true;
    errors.base_url = '';
    errors.params = '';
    paramErrors.value = params.value.map(() => ({}));

    const trimmedBase = base_url.value.trim();
    if (trimmedBase) {
        try {
            const url = new URL(trimmedBase);
            if (!['http:', 'https:'].includes(url.protocol)) {
                errors.base_url = 'Base URL must start with http:// or https://';
                valid = false;
            }
        } catch {
            errors.base_url = 'Base URL must be a valid http(s) URL';
            valid = false;
        }
    }

    const seen = new Set<string>();
    params.value.forEach((p, i) => {
        const key = p.key.trim();
        if (!key && (p.value.trim() || params.value.length)) {
            // Empty key with value is invalid; empty/empty row can be dropped on save but flag it
            paramErrors.value[i].key = 'Parameter name is required';
            valid = false;
        } else if (key) {
            if (seen.has(key)) {
                paramErrors.value[i].key = 'Parameter names must be unique';
                valid = false;
            }
            seen.add(key);
            if (key.length > 128) {
                paramErrors.value[i].key = 'Parameter name is too long (max 128)';
                valid = false;
            }
        }
        if ((p.value ?? '').length > 4096) {
            errors.params = 'Parameter values must be at most 4096 characters';
            valid = false;
        }
    });

    return valid;
}

async function loadSettings() {
    loading.value = true;
    try {
        const config = await fetchReportIssueConfig(true);
        base_url.value = config?.base_url ?? '';
        params.value = (config?.params ?? []).map((p) => ({ key: p.key, value: p.value }));
        paramErrors.value = params.value.map(() => ({}));
    } catch (e) {
        showError(e instanceof Error ? e.message : String(e), 'Failed to load settings');
    } finally {
        loading.value = false;
    }
}

async function resetForm() {
    await loadSettings();
}

async function saveSettings() {
    if (!validate()) return;

    saving.value = true;
    try {
        const cleanedParams = params.value
            .map((p) => ({ key: p.key.trim(), value: p.value ?? '' }))
            .filter((p) => p.key);
        await saveReportIssueConfig({
            base_url: base_url.value.trim(),
            params: cleanedParams,
        });
        toast.add({ severity: 'success', summary: 'Saved', detail: 'Report issue settings saved', life: 3000 });
        await loadSettings();
    } catch (e: any) {
        showError(e?.message ?? 'Failed to save settings', 'Save failed');
    } finally {
        saving.value = false;
    }
}

onBeforeMount(() => {
    loadSettings();
});
</script>
<style scoped>
.param-value-textarea {
    min-height: 96px;
    line-height: 1.5;
    white-space: pre-wrap;
}
</style>
