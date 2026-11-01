import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {installDevtoolsGuard} from './utils/devtoolsGuard';
import './index.css';

// Production only, so local development keeps DevTools available
if (import.meta.env.PROD) installDevtoolsGuard();

createRoot(document.getElementById('root')!).render(<App />);
