import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import {
  createBrowserRouter,
  RouterProvider
} from "react-router-dom";

import App from './App';
import AppV2 from './components/Event'

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppV2 />,
  },
]);

const root = ReactDOM.createRoot(
	document.getElementById('root') as HTMLElement
);
root.render(
	<React.StrictMode>
		<RouterProvider router={router} />
    {/* <App/> */}
	</React.StrictMode>
);

