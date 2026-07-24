import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { AdminPage } from '../pages/admin/AdminPage';
import { Login } from '../pages/auth/Login';
import { About } from '../pages/public/About';
import { AppError } from '../pages/public/AppError';
import { BecomeWorker } from '../pages/public/BecomeWorker';
import { CommissionPolicy } from '../pages/public/CommissionPolicy';
import { Contact } from '../pages/public/Contact';
import { Home } from '../pages/public/Home';
import { NotFound } from '../pages/public/NotFound';
import { Privacy } from '../pages/public/Privacy';
import { RequestService } from '../pages/public/RequestService';
import { Review } from '../pages/public/Review';
import { ServiceDetail } from '../pages/public/ServiceDetail';
import { Services } from '../pages/public/Services';
import { Terms } from '../pages/public/Terms';
import { WorkerDirectory } from '../pages/public/WorkerDirectory';
import { WorkerProfile as PublicWorkerProfile } from '../pages/public/WorkerProfile';
import { WorkerVerificationPolicy } from '../pages/public/WorkerVerificationPolicy';
import { WorkerLayout } from '../pages/worker/WorkerLayout';
import { WorkerLogin } from '../pages/worker/WorkerLogin';
import {
  WorkerDocuments,
  WorkerEarnings,
  WorkerHome,
  WorkerJobs,
  WorkerLeads,
  WorkerNotifications,
  WorkerProfile,
  WorkerReviews,
  WorkerSettings
} from '../pages/worker/WorkerViews';

export const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <AppError />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/about', element: <About /> },
      { path: '/services', element: <Services /> },
      { path: '/services/:slug', element: <ServiceDetail /> },
      { path: '/workers', element: <WorkerDirectory /> },
      { path: '/workers/:workerId', element: <PublicWorkerProfile /> },
      { path: '/become-a-worker', element: <BecomeWorker /> },
      { path: '/request-service', element: <RequestService /> },
      { path: '/review/:token', element: <Review /> },
      { path: '/contact', element: <Contact /> },
      { path: '/privacy', element: <Privacy /> },
      { path: '/terms', element: <Terms /> },
      { path: '/commission-policy', element: <CommissionPolicy /> },
      { path: '/worker-verification-policy', element: <WorkerVerificationPolicy /> },
      { path: '/login', element: <Login /> },
      { path: '/admin', element: <AdminPage /> },
      { path: '/worker/login', element: <WorkerLogin /> },
      {
        path: '/worker',
        element: <WorkerLayout />,
        children: [
          { index: true, element: <WorkerHome /> },
          { path: 'leads', element: <WorkerLeads /> },
          { path: 'jobs', element: <WorkerJobs /> },
          { path: 'earnings', element: <WorkerEarnings /> },
          { path: 'reviews', element: <WorkerReviews /> },
          { path: 'notifications', element: <WorkerNotifications /> },
          { path: 'profile', element: <WorkerProfile /> },
          { path: 'documents', element: <WorkerDocuments /> },
          { path: 'settings', element: <WorkerSettings /> }
        ]
      },
      { path: '*', element: <NotFound /> }
    ]
  }
]);
