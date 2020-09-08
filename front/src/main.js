import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import VueRouter from 'vue-router';
import home from '@/components/home';
import help from '@/components/help';
import agenda from '@/components/agenda';
import error404 from '@/components/error404';
import titleMixin from './mixins/title';


const routes = [
  { path: '/', component: home },
  { path: '/help', component: help },
  { path: '/agenda', component: agenda },
  { path: '/404', component: error404 },
  { path: '*', redirect: '/404' }
]

const router = new VueRouter({
  routes,
  mode: "history" // Virer le #
})

Vue.mixin(titleMixin);
Vue.use(VueRouter);
Vue.config.productionTip = false

new Vue({
  vuetify,
  router,
  render: h => h(App)
}).$mount('#app')
