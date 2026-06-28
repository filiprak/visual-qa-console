import './styles.css';
import 'primeicons/primeicons.css';
import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import ThemePreset from '@primeuix/themes/aura';
import ToastService from 'primevue/toastservice';
import App from './App.vue';
import router from './router';
import { showError } from './errors';

const app = createApp(App);

app.use(router);
app.use(PrimeVue, {
    theme: {
        preset: ThemePreset,
        options: {
            darkModeSelector: '.dark',
        },
    },
});
app.use(ToastService);
app.config.errorHandler = (err, instance, info) => {
    console.error(err);

    showError(
        err instanceof Error ? [err.name, err.message].join(': ') : String(err),
        "Application Error"
    );
};
app.mount('#app');
