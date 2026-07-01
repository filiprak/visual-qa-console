import { createRouter, createWebHistory } from 'vue-router';
import Home from './routes/Home.vue';
import NotFound from './routes/NotFound.vue';
import PipelineDetails from './routes/PipelineDetails.vue';
import Baselines from './routes/Baselines.vue';

export default createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', component: Home },
        { path: '/baselines', component: Baselines },
        { path: '/pipelines/:id', component: PipelineDetails },
        { path: '/:pathMatch(.*)*', component: NotFound },
    ],
});
