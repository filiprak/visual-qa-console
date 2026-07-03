import './styles.css';
import 'primeicons/primeicons.css';
import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import BaseTheme from '@primeuix/themes/aura';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import { definePreset } from '@primeuix/themes';
import App from './App.vue';
import router from './router';
import { showError } from './errors';

const app = createApp(App);
const Theme = definePreset(BaseTheme, {
    semantic: {
        borderRadius: {
            none: '0px',
            xs: '0px',
            sm: '0px',
            md: '0px',
            lg: '0px',
            xl: '0px',
        },
    },
});

app.use(router);
app.use(PrimeVue, {
    theme: {
        preset: Theme,
        options: {
            darkModeSelector: '.dark',
        },
    },
});

app.use(ToastService);
app.use(ConfirmationService);

app.config.errorHandler = (err, instance, info) => {
    console.error(err);
    showError(err instanceof Error ? [err.name, err.message].join(': ') : String(err), 'Application Error');
};
window.addEventListener('unhandledrejection', (e) => {
    const err = e.reason;
    console.error(err);
    showError(err instanceof Error ? [err.name, err.message].join(': ') : String(err), 'Application Error');
});
app.mount('#app');
