import { type RouteConfig, index, route } from '@react-router/dev/routes'

export default [
    route('login', 'routes/login.tsx'),
    index('routes/home.tsx'),
    route('search', 'routes/search.tsx'),
    route('discover', 'routes/discover.tsx'),
    route('my-list', 'routes/my-list.tsx'),
    route('settings', 'routes/settings.tsx'),
    route('detail/:type/:id', 'routes/detail.$type.$id.tsx'),
    route('watch/:type/:id', 'routes/watch.$type.$id.tsx'),
] satisfies RouteConfig
