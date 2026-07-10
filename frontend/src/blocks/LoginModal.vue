<template>
    <Dialog
        v-model:visible="showLoginModal"
        modal
        header="Sign In"
        :style="{ width: '30rem' }"
    >
        <form @submit.prevent="handleLogin" class="flex flex-col gap-4 py-4">
            <div class="flex flex-col gap-2">
                <label for="email" class="font-semibold">Email</label>
                <InputText
                    id="email"
                    v-model="email"
                    type="email"
                    required
                    autofocus
                    placeholder="Enter your email"
                />
            </div>
            <div class="flex flex-col gap-2">
                <label for="password" class="font-semibold">Password</label>
                <Password
                    id="password"
                    v-model="password"
                    :feedback="false"
                    toggleMask
                    required
                    placeholder="Enter your password"
                    inputClass="w-full"
                />
            </div>
            
            <div class="flex justify-end mt-4">
                <Button
                    type="submit"
                    label="Sign In"
                    :loading="isLoading"
                />
            </div>
        </form>
    </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import { useAuth } from '../composables/useAuth';

const { showLoginModal, login, isLoading } = useAuth();

const email = ref('');
const password = ref('');

async function handleLogin() {
    try {
        await login(email.value, password.value);
        if (!showLoginModal.value) {
            // Clear form on successful login
            email.value = '';
            password.value = '';
        }
    } catch (e) {
        // Error is handled in composable
    }
}
</script>
