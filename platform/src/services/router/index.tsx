import NotFound from '@/app/(app)/pages/404';
import React, { lazy, Suspense } from 'react';
import { RouteObject, createBrowserRouter, RouterProvider } from 'react-router-dom'
const AppRoutes: RouteObject[] = [
  {
    path: '/',
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        {/* <Home /> */}
      </Suspense>
    ),
  },
  {
    path: '/about',
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        {/* <About /> */}
      </Suspense>
    ),
  },
  {
    path: '*',
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <NotFound />
      </Suspense>
    ),
  },
]