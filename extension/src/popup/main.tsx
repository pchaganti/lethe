import { render } from 'preact';
import Popup from './index';

console.log('[Lethe] Popup main.tsx loading');

const app = document.getElementById('app');
if (app) {
  console.log('[Lethe] App element found, rendering popup');
  render(<Popup />, app);
} else {
  console.error('[Lethe] #app element not found!');
}
