import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AppRoutes from './routes/AppRoutes';
import useEcomStore from './store/ecom-store';

const App = () => {
  const hasHydrated = useEcomStore((state) => state.hasHydrated);

  if (!hasHydrated) return <div>Loading...</div>;

  return (
    <>
      <ToastContainer position="top-center" />
      <AppRoutes />
    </>
  );
};

export default App;