// Load fonts.
import 'typeface-quicksand';
import 'typeface-crimson-text';

import {createRoot} from 'react-dom/client';

import './index.css';

import {App} from './components/App';

const rootDiv = document.getElementById('root');
if (!rootDiv) {
  throw new Error('Root element not found');
}

const root = createRoot(rootDiv);
root.render(<App />);
