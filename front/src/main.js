import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify';
import VueMeta from 'vue-meta';

Vue.use(VueMeta);
Vue.config.productionTip = false

Vue.component('Navbar', (resolve) => {
  import('@/components/Navbar')
      .then((AsyncComponent) => {
          resolve(AsyncComponent.default);
      });
});
Vue.component('Footer', (resolve) => {
  import('@/components/Footer')
      .then((AsyncComponent) => {
          resolve(AsyncComponent.default);
      });
});
Vue.component('Logo', (resolve) => {
  import('@/components/Logo')
      .then((AsyncComponent) => {
          resolve(AsyncComponent.default);
      });
});

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
