<template>
    <div class="p-12 flex justify-center">
        <div class="max-w-[1600px] grow">
            <div class="flex justify-between items-center my-8">
                <div>
                    <h1 class="text-5xl font-semibold">Manage users</h1>
                    <p class="text-muted-color mt-2">Manage console users, administrator statuses, and granular access
                        permissions.</p>
                </div>
                <Button label="Add User"
                        icon="pi pi-user-plus"
                        severity="primary"
                        @click="openAddDialog" />
            </div>

            <!-- Toolbar & Filter -->
            <div
                 class="flex justify-between items-center w-full mb-6 p-4 bg-surface-0 dark:bg-surface-900 border border-surface">
                <IconField class="w-full max-w-md">
                    <InputIcon>
                        <Icon name="search" />
                    </InputIcon>
                    <InputText v-model="text_filter"
                               type="text"
                               fluid
                               placeholder="Search users by name..." />
                </IconField>
            </div>

            <!-- Table Header -->
            <div class="flex gap-3 items-center p-4 text-muted-color font-semibold border-b border-surface">
                <div class="basis-[50px]">Avatar</div>
                <div class="basis-[300px]">Name / Email</div>
                <div class="basis-[180px]">Role</div>
                <div class="grow-2 min-w-[300px]">Permissions</div>
                <div class="basis-[160px] text-right">Actions</div>
            </div>

            <!-- Paginated List -->
            <DataPaginated :service="api.users"
                           :query="queryFilter"
                           :sort="{ name: 1 }">
                <template #list="{ items }">
                    <div class="mb-3">
                        <div v-for="user in items"
                             class="flex gap-3 items-center p-4 hover:bg-emphasis border-b border-surface cursor-pointer"
                             @click="openEditDialog(user)"
                             :key="user.id">
                            <!-- Avatar placeholder -->
                            <div class="basis-[50px]">
                                <div
                                     class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-950/40 text-primary flex items-center justify-center font-bold text-lg border border-primary-200 dark:border-primary-900/60">
                                    {{ user.name.charAt(0).toUpperCase() }}
                                </div>
                            </div>
                            <!-- Name / Email -->
                            <div class="basis-[300px]">
                                <div class="font-semibold text-color-emphasis truncate">{{ user.name }}</div>
                                <div class="text-muted-color text-sm truncate">{{ user.email }}</div>
                            </div>
                            <!-- Role -->
                            <div class="basis-[180px]">
                                <Tag v-if="user.is_admin"
                                     value="Admin"
                                     severity="success"
                                     icon="pi pi-shield" />
                                <Tag v-else
                                     value="User"
                                     severity="secondary"
                                     icon="pi pi-user" />
                            </div>
                            <!-- Permissions -->
                            <div class="grow-1 min-w-[300px] flex flex-wrap gap-1">
                                <span v-if="user.permissions && user.permissions.length"
                                      class="font-semibold">
                                    {{ user.permissions.length }} permissions
                                </span>
                                <span v-else
                                      class="text-xs text-muted-color italic">No permissions assigned</span>
                            </div>
                            <!-- Actions -->
                            <div class="basis-[160px] flex justify-end gap-2">
                                <Button icon="pi pi-pencil"
                                        severity="secondary"
                                        variant="outlined"
                                        v-tooltip.top="'Edit User'"
                                        @click.stop.prevent="openEditDialog(user)" />
                                <LoadingButton icon-only
                                               icon="trash"
                                               severity="danger"
                                               variant="outlined"
                                               v-tooltip.top="'Delete User'"
                                               @click.stop.prevent="onDelete(user)" />
                            </div>
                        </div>
                    </div>
                </template>
            </DataPaginated>

            <!-- Add / Edit Dialog -->
            <Dialog v-model:visible="dialogVisible"
                    modal
                    :header="isEditMode ? 'Edit User Details' : 'Create New User'"
                    :style="{ width: '50rem' }"
                    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
                <div class="flex flex-col gap-6 py-2">
                    <!-- General Details -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label for="name"
                                   class="font-semibold">Full Name</label>
                            <InputText id="name"
                                       v-model="form.name"
                                       placeholder="John Doe"
                                       :invalid="!!errors.name"
                                       autocomplete="new-username"
                                       fluid />
                            <small class="text-red-500"
                                   v-if="errors.name">{{ errors.name }}</small>
                        </div>
                        <div class="flex flex-col gap-2">
                            <label for="email"
                                   class="font-semibold">Email Address</label>
                            <InputText id="email"
                                       type="email"
                                       v-model="form.email"
                                       placeholder="john@example.com"
                                       autocomplete="new-username"
                                       :invalid="!!errors.email"
                                       fluid />
                            <small class="text-red-500"
                                   v-if="errors.email">{{ errors.email }}</small>
                        </div>
                    </div>

                    <div class="flex flex-col gap-2">
                        <label for="password"
                               class="font-semibold">
                            Password
                            <span v-if="isEditMode"
                                  class="text-xs font-normal text-muted-color">(Leave empty to keep current
                                password)</span>
                        </label>
                        <InputText id="password"
                                   type="password"
                                   v-model="form.password"
                                   placeholder="••••••••"
                                   autocomplete="new-password"
                                   :invalid="!!errors.password"
                                   fluid />
                        <small class="text-red-500"
                               v-if="errors.password">{{ errors.password }}</small>
                    </div>

                    <!-- Administrator Status -->
                    <div
                         class="flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-950/40 border border-surface rounded-xl">
                        <div class="flex flex-col gap-1">
                            <span class="font-semibold">Administrator Status</span>
                            <span class="text-sm text-muted-color">Grant full admin privileges and bypass granular
                                permissions.</span>
                        </div>
                        <ToggleSwitch v-model="form.is_admin" />
                    </div>

                    <!-- Granular Permissions Selection -->
                    <div v-if="!form.is_admin"
                         class="flex flex-col gap-3">
                        <span class="font-semibold">Granular Permissions</span>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 border border-surface rounded-xl p-4">
                            <div v-for="opt in permissionOptions"
                                 :key="opt.value"
                                 class="flex items-start gap-3 p-2 hover:bg-emphasis rounded-lg cursor-pointer"
                                 @click="togglePermission(opt.value)">
                                <Checkbox :modelValue="form.permissions"
                                          :value="opt.value"
                                          @click.stop />
                                <div class="flex flex-col">
                                    <span class="font-medium text-sm text-color-emphasis">{{ opt.label }}</span>
                                    <span class="text-xs text-muted-color">{{ opt.description }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <template #footer>
                    <div class="flex justify-end gap-3 mt-4">
                        <Button label="Cancel"
                                severity="secondary"
                                variant="outlined"
                                @click="dialogVisible = false" />
                        <Button :label="isEditMode ? 'Save Changes' : 'Create User'"
                                severity="primary"
                                :loading="saving"
                                @click="saveUser" />
                    </div>
                </template>
            </Dialog>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import vTooltip from 'primevue/tooltip';
import Dialog from 'primevue/dialog';
import Checkbox from 'primevue/checkbox';
import ToggleSwitch from 'primevue/toggleswitch';
import { api } from '../api';
import DataPaginated from '../components/DataPaginated.vue';
import LoadingButton from '../components/LoadingButton.vue';
import Icon from '../components/Icon.vue';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import { useDebounce } from '../composables/useDebounce';
import { useDialog } from '../composables/useDialog';
import type { User } from '@/types';

const toast = useToast();
const { confirmDialog } = useDialog();

// Search & Filter
const text_filter = ref('');
const text_filter_d = useDebounce(text_filter);

const queryFilter = computed(() => {
    if (!text_filter_d.value) return {};
    return {
        name: {
            $like: `%${text_filter_d.value}%`,
        },
    };
});

// Dialog and Saving state
const dialogVisible = ref(false);
const isEditMode = ref(false);
const saving = ref(false);
const selectedUserId = ref<number | null>(null);

// Form
const form = reactive({
    name: '',
    email: '',
    password: '',
    is_admin: false,
    permissions: [] as string[],
});

const errors = reactive({
    name: '',
    email: '',
    password: '',
});

// Available permissions list
const permissionOptions = [
    { value: 'users.create', label: 'Create Users', description: 'Create new user accounts' },
    { value: 'users.patch', label: 'Edit Users', description: 'Modify details and permissions of users' },
    { value: 'users.delete', label: 'Delete Users', description: 'Permanently remove user accounts' },
    { value: 'review.create', label: 'Create Reviews', description: 'Approve or reject test cases' },
    { value: 'pipelines.delete', label: 'Delete Pipelines', description: 'Delete regression pipeline runs' },
    { value: 'baselines.delete', label: 'Delete Baselines', description: 'Delete baseline screenshots' },
];

function togglePermission(perm: string) {
    const idx = form.permissions.indexOf(perm);
    if (idx >= 0) {
        form.permissions.splice(idx, 1);
    } else {
        form.permissions.push(perm);
    }
}

// Reset form and errors
function resetForm() {
    form.name = '';
    form.email = '';
    form.password = '';
    form.is_admin = false;
    form.permissions = [];

    errors.name = '';
    errors.email = '';
    errors.password = '';
}

// Validation
function validateForm(): boolean {
    let isValid = true;
    errors.name = '';
    errors.email = '';
    errors.password = '';

    if (!form.name || form.name.trim().length < 2) {
        errors.name = 'Full Name is required and must be at least 2 characters.';
        isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email || !emailRegex.test(form.email)) {
        errors.email = 'A valid email address is required.';
        isValid = false;
    }

    if (!isEditMode.value) {
        if (!form.password || form.password.length < 4) {
            errors.password = 'Password is required and must be at least 4 characters.';
            isValid = false;
        }
    } else if (form.password && form.password.length < 4) {
        errors.password = 'Password must be at least 4 characters if changed.';
        isValid = false;
    }

    return isValid;
}

// Actions
function openAddDialog() {
    isEditMode.value = false;
    selectedUserId.value = null;
    resetForm();
    dialogVisible.value = true;
}

function openEditDialog(user: User) {
    isEditMode.value = true;
    selectedUserId.value = user.id;
    resetForm();

    form.name = user.name;
    form.email = user.email;
    form.is_admin = !!user.is_admin;
    form.permissions = [...(user.permissions || [])];

    dialogVisible.value = true;
}

async function saveUser() {
    if (!validateForm()) return;

    saving.value = true;
    try {
        const payload: any = {
            name: form.name.trim(),
            email: form.email.trim().toLowerCase(),
            is_admin: form.is_admin,
            permissions: form.is_admin ? [] : form.permissions,
        };

        if (form.password) {
            payload.password = form.password;
        }

        if (isEditMode.value && selectedUserId.value !== null) {
            await api.users.patch(selectedUserId.value, payload);
            toast.add({ severity: 'success', summary: 'Success', detail: 'User updated successfully', life: 3000 });
        } else {
            await api.users.create(payload);
            toast.add({ severity: 'success', summary: 'Success', detail: 'User created successfully', life: 3000 });
        }

        dialogVisible.value = false;
    } finally {
        saving.value = false;
    }
}

async function onDelete(user: User) {
    const confirmation = await confirmDialog({
        header: 'Delete User Account',
        message: `Are you sure you want to permanently delete the user account for "${user.name}"? This action cannot be undone.`,
        acceptLabel: 'Delete',
        severity: 'danger',
    });

    if (!confirmation.confirmed) return;

    await api.users.remove(user.id);
    toast.add({ severity: 'success', summary: 'Deleted', detail: 'User account removed successfully', life: 3000 });

}
</script>
