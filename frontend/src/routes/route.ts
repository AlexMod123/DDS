import { STATS_ROUTES, REFERENCE_ROUTES } from "../const/const"
import ReferenceManager from "../pages/ReferenceManager"
import Stats from "../pages/stats"

export const publicRoutes = [
    {
        path: STATS_ROUTES,
        Component: Stats
    },
    {
        path: REFERENCE_ROUTES,
        Component: ReferenceManager
    },
]