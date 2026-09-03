import { createRouter, createWebHistory } from 'vue-router';
import Pipelines from './routes/Pipelines.vue';
import NotFound from './routes/NotFound.vue';
import PipelineDetails from './routes/PipelineDetails.vue';
import Baselines from './routes/Baselines.vue';
import Users from './routes/Users.vue';
import Settings from './routes/Settings.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', component: Pipelines },
        { path: '/baselines', component: Baselines },
        { path: '/pipelines/:id', component: PipelineDetails },
        { path: '/users', component: Users },
        { path: '/settings', component: Settings },
        { path: '/:pathMatch(.*)*', component: NotFound },
    ],
});

import { useAuth } from './composables/useAuth';

router.beforeEach((to) => {
    if (to.path === '/users') {
        const { user, checkPermission, hasToken } = useAuth();
        
        if (!hasToken()) {
            return { path: '/' };
        }
        
        if (user.value) {
            if (!checkPermission('users.')) {
                return { path: '/' };
            }
        }
    }

    if (to.path === '/settings') {
        const { user, hasToken } = useAuth();

        if (!hasToken()) {
            return { path: '/' };
        }

        if (user.value) {
            if (!user.value.is_admin) {
                return { path: '/' };
            }
        }
    }
});

export default router;
