import { createRouter, createWebHistory } from 'vue-router';
import Home from './routes/Home.vue';
import NotFound from './routes/NotFound.vue';
import PipelineDetails from './routes/PipelineDetails.vue';

export default createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', component: Home },
        { path: '/pipelines/:id', component: PipelineDetails },
        { path: '/:pathMatch(.*)*', component: NotFound },
    ],
});
