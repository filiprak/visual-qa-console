import type { ToastServiceMethods } from 'primevue/toastservice';

let toast: ToastServiceMethods | null = null;

export function registerToast(instance: ToastServiceMethods) {
    toast = instance;
}

export function showError(message: string, summary = 'Error') {
    toast?.add({
        severity: 'error',
        summary,
        detail: message,
        life: 5000,
    });
}
