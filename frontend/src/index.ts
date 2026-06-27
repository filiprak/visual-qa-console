import './styles.css';
import 'primeicons/primeicons.css';
import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import ThemePreset from '@primeuix/themes/nora';
import App from './App.vue';

const app = createApp(App)
app.use(PrimeVue, {
    theme: {
        preset: ThemePreset,

    }
});
app.mount('#app');
