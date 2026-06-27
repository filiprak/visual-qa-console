import './styles.css';
import 'primeicons/primeicons.css';
import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import ThemePreset from '@primeuix/themes/aura';
import App from './App.vue';
import router from './router';

const app = createApp(App)

app.use(router);
app.use(PrimeVue, {
    theme: {
        preset: ThemePreset,
        options: {
            darkModeSelector: '.dark',
        },
    }
});
app.mount('#app');
