import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import {
  createBrowserRouter,
  RouterProvider
} from "react-router-dom";

import { register } from './serviceWorker';

import App from './App';
import AppV2 from './components/Event'
import Task from './components/Task'
import TaskV2 from './components/TaskV2'

// Pages
import { Calendar } from './pages/Calendar'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/test",
    element: <AppV2 />,
  },
  {
    path: "/task",
    element: <Task />,
  },
  {
    path: "/task-v2",
    element: <TaskV2 />,
  },
  {
    path: "/calendar",
    element: <Calendar />,
  }
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

register()
