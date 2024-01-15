import './assets/main.css'

import { createApp } from 'vue'
import { createI18n } from 'vue-i18n';
import App from './App.vue'

import en from '@/assets/i18n/en.json';
import de from '@/assets/i18n/de.json';
import jp from '@/assets/i18n/jp.json';
import * as bootstrap from 'bootstrap'

const i18n = createI18n({
    legacy: false, // must set to false to use Composition API
    locale: 'en', // set default language
    messages: {
        en,
        de,
        jp
    }
});

const app = createApp(App);
app.use(i18n);
app.mount('#app');
