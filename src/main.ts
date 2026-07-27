import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { initializeApi } from './api/client';
import './style.css';
import 'material-symbols/outlined.css';

async function bootstrap() {
  await initializeApi();
  createApp(App).use(router).mount('#app');
}
bootstrap();

// Disable default right click globally (custom context menus will still trigger via Vue)
document.addEventListener('contextmenu', e => e.preventDefault());
