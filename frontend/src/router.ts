import { createRouter, createWebHistory } from 'vue-router';
import Home from './routes/Home.vue';
import NotFound from './routes/NotFound.vue';

export default createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', component: Home },
        { path: '/:pathMatch(.*)*', component: NotFound },
    ],
});
