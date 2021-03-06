import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import VueParticlesBg from "particles-bg-vue";
import { createProvider } from './vue-apollo';
import VueTilt from 'vue-tilt.js';

Vue.config.productionTip = false;
Vue.use(VueParticlesBg);
Vue.use(VueTilt);

new Vue({
    router,
    apolloProvider: createProvider(),
    render: (h) => h(App)
}).$mount("#app");
