import { Route, Routes, Navigate } from 'react-router-dom';
import { publicRoutes } from "../routes/route";
import { STATS_ROUTES } from '../const/const';


const AppRouter = () => {

    return (
        <Routes>
            {publicRoutes.map(({ path, Component }) => (
                <Route key={path} path={path} element={<Component />} />
            ))}
            <Route path="*" element={<Navigate to={STATS_ROUTES} replace />} />
        </Routes>
    )
}
export default AppRouter;