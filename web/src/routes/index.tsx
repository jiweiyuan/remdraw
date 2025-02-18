import NotFound from '@/pages/not-found';
import {lazy, Suspense} from 'react';
import {Navigate, Outlet, useRoutes} from 'react-router-dom';
import VerifyPage from "@/pages/auth/verify";


const DashboardLayout = lazy(
  () => import('@/components/layout/dashboard-layout')
);
const SignInPage = lazy(() => import('@/pages/auth/signin'));
const SignUpPage = lazy(() => import('@/pages/auth/signup'));
const DashboardPage = lazy(() => import('@/pages/dashboard'));
const WhiteboardPage = lazy(() => import('@/pages/whiteboard'));
const ReviewPage = lazy(() => import('@/pages/review'));
const ReviewFrame = lazy(() => import('@/pages/review/frame'));
const LandingPage = lazy(() => import('@/pages/landing-page'));

// ----------------------------------------------------------------------

export default function AppRouter() {
  const dashboardRoutes = [
    {
      path: '/',
      element: (
        <DashboardLayout>
          <Suspense>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      ),
      children: [
        {
          path: "/dashboard",
          element: <DashboardPage/>,

        },
        {
          path: 'scene/:sceneId',
          element: <WhiteboardPage />,
        },
        {
          path: 'draw',
          element: <WhiteboardPage />,
        },
        {
          path: 'review/frame',
          element: <ReviewFrame />,
        },
        {
          path: 'review',
          element: <ReviewPage />
        },
      ]
    }
  ];

  const publicRoutes = [
    {
      path: '/',
      element: <LandingPage />,
    },
    {
      path: '/login',
      element: <SignInPage />,
    },
    {
      path: '/signup',
      element: <SignUpPage />,
    },
    {
      path: '/verify',
      element: <VerifyPage />,
    },
    {
      path: '/404',
      element: <NotFound />
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />
    }
  ];

  return useRoutes([...publicRoutes, ...dashboardRoutes]);
}