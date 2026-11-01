import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {installDevtoolsGuard} from './utils/devtoolsGuard';
import './index.css';

// On everywhere; set VITE_ALLOW_DEVTOOLS="true" in .env to debug locally
if (import.meta.env.VITE_ALLOW_DEVTOOLS !== 'true') installDevtoolsGuard();

createRoot(document.getElementById('root')!).render(<App />);
