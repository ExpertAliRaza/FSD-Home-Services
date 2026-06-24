import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { AdminPage } from '../pages/admin/AdminPage';
import { Login } from '../pages/auth/Login';
import { BecomeWorker } from '../pages/public/BecomeWorker';
import { Contact } from '../pages/public/Contact';
import { Home } from '../pages/public/Home';
import { RequestService } from '../pages/public/RequestService';
import { ServiceDetail } from '../pages/public/ServiceDetail';
import { Services } from '../pages/public/Services';
import { WorkerDirectory } from '../pages/public/WorkerDirectory';

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/services', element: <Services /> },
      { path: '/services/:slug', element: <ServiceDetail /> },
      { path: '/workers', element: <WorkerDirectory /> },
      { path: '/become-a-worker', element: <BecomeWorker /> },
      { path: '/request-service', element: <RequestService /> },
      { path: '/contact', element: <Contact /> },
      { path: '/login', element: <Login /> },
      { path: '/admin', element: <AdminPage /> }
    ]
  }
]);
