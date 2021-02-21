<template>
  <v-app-bar
      app
      color="#263238"
      dark
      elevate-on-scroll
      flat
  >
    <Logo/>

    <v-spacer v-if="$vuetify.breakpoint.xsOnly"></v-spacer>
    <div v-if="!$vuetify.breakpoint.xsOnly">
      <v-btn
          v-for="link in links"
          :key="link.text"
          :to="link.route"
          text>
        <span class="mr-2">{{ link.text }}</span>
        <v-icon>{{ link.icon }}</v-icon>
      </v-btn>
    </div>
    <v-menu offset-y v-if="$vuetify.breakpoint.xsOnly">
      <template v-slot:activator="{ on }">
        <v-btn text v-on="on">
          <v-icon>mdi-menu</v-icon>
        </v-btn>
      </template>
      <v-list flat>
        <v-list-item v-for="link in links" :key="link.text" router :to="link.route">
          <v-list-item-icon>
            <v-icon>{{ link.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-title>{{ link.text }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script>
import Logo from './Logo';
export default {
  name: "Navbar",
  components: {
    Logo
  },
  data() {
    return {
      links: [
        {icon: 'mdi-home', text: 'Accueil', route: '/'},
        {icon: 'mdi-calendar-month-outline', text: 'Agenda', route: '/agenda'},
        {icon: 'mdi-lifebuoy', text: 'Aide', route: '/help'},
        {icon: 'mdi-bug', text: 'Signaler un problème', route: '/bug'}
      ]
    }
  }
}
</script>

<style scoped>
</style>