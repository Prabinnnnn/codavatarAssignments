import { createRoot } from 'react-dom/client';
import App from './App.jsx';

// We only need ONE root in 99% of React apps
createRoot(document.getElementById('root')).render(
  <App />
);