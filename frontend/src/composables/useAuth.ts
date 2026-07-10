import { computed, ref } from 'vue';
import { showError } from '../errors';
import { api } from '../api';
import type { User } from '@/types';

const user = ref<User | null>(null);
const token = ref<string | null>(null);
const isLoading = ref(false);
const showLoginModal = ref(false);

export function useAuth() {
    const isAuthenticated = computed(() => !!token.value);

    function checkPermission(permissionPrefix: string): boolean {
        if (!user.value) return false;
        if (user.value.is_admin) return true;
        return !!user.value.permissions?.some(p => p.startsWith(permissionPrefix));
    }

    function hasToken(): boolean {
        return !!localStorage.getItem('accessToken');
    }

    async function login(email: string, password: string) {
        isLoading.value = true;
        try {
            const data = await api.auth.create({
                strategy: 'local',
                email,
                password,
            });

            token.value = data.accessToken;
            user.value = data.user;
            
            if (data.accessToken) {
                localStorage.setItem('accessToken', data.accessToken);
            }
            
            showLoginModal.value = false;
            window.location.reload();
        } catch (error) {
            console.error('Login error:', error);
            showError(error instanceof Error ? error.message : 'Authentication failed', 'Login Error');
            throw error;
        } finally {
            isLoading.value = false;
        }
    }

    function logout() {
        token.value = null;
        user.value = null;
        localStorage.removeItem('accessToken');
        window.location.reload();
    }

    async function restoreSession() {
        const savedToken = localStorage.getItem('accessToken');
        if (!savedToken) {
            return;
        }

        isLoading.value = true;
        try {
            const data = await api.auth.create({
                strategy: 'jwt',
                accessToken: savedToken,
            });
            token.value = data.accessToken;
            user.value = data.user;
            
            if (data.accessToken) {
                localStorage.setItem('accessToken', data.accessToken);
            }
        } catch (error) {
            console.error('Session restore error:', error);
            logout();
        } finally {
            isLoading.value = false;
        }
    }

    function openLogin() {
        showLoginModal.value = true;
    }

    function closeLogin() {
        showLoginModal.value = false;
    }

    return {
        user,
        token,
        isAuthenticated,
        isLoading,
        showLoginModal,
        checkPermission,
        hasToken,
        login,
        logout,
        restoreSession,
        openLogin,
        closeLogin,
    };
}
