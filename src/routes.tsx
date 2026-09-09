import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';
import { HomePage } from './pages/HomePage';
import { CollectionPage } from './pages/CollectionPage';
import { ProductPage } from './pages/ProductPage';
import { useParams } from 'react-router-dom';
import { InstagramPage } from './pages/InstagramPage';
import { AccountPage } from './pages/AccountPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { RouteErrorPage } from './pages/RouteErrorPage';

/**
 * Remount ProductPage when the id changes.
 *
 * Router keeps one instance alive across param changes, so without this the
 * next product inherits the previous one's size, fit, quantity and gallery
 * index — and the inherited stitching surcharge shows a wrong price and
 * reaches the cart.
 */
const KeyedProductPage: React.FC = () => {
  const { id } = useParams();
  return <ProductPage key={id} />;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'collections', element: <CollectionPage /> },
      { path: 'collections/:category', element: <CollectionPage /> },
      { path: 'product/:id', element: <KeyedProductPage /> },
      { path: 'instagram', element: <InstagramPage /> },
      { path: 'account', element: <AccountPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
