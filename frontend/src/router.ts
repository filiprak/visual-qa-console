import { createRouter, createWebHistory } from 'vue-router';
import Pipelines from './routes/Pipelines.vue';
import NotFound from './routes/NotFound.vue';
import PipelineDetails from './routes/PipelineDetails.vue';
import Baselines from './routes/Baselines.vue';

export default createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', component: Pipelines },
        { path: '/baselines', component: Baselines },
        { path: '/pipelines/:id', component: PipelineDetails },
        { path: '/:pathMatch(.*)*', component: NotFound },
    ],
});
