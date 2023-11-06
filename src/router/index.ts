import { createRouter, createWebHistory } from 'vue-router';
import PostsView from '@/views/PostsView.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            redirect: { name: 'home' }
        },
        {
            path: '/vue-filter-table/',
            name: 'home',
            component: PostsView
        },
        {
            path: '/vue-filter-table/:id',
            name: 'home',
            component: PostsView
        },
        {
            path: '/:pathMatch(.*)*',
            name: 'not-found',
            component: PostsView
        }
    ]
});

router.beforeEach(async (to, from, next) => {
    if (to.name === 'not-found') {
        next();
    } else {
        next();
    }
});

export default router;
