<template>
  <v-app>
    <Navbar/>
    <v-main>
      <v-alert
          prominent
          text icon="mdi-alert"
          color="warning"
          class="mb-5 text-center"
          v-if="isLastFridayOfMonth">
        <strong>Avertissement - Maintenance Henallux</strong>
        <br/>
        Aujourd'hui, comme tous les derniers vendredis du mois, a lieu une maintenance du système informatique Henallux.<br/>La
        génération de calendrier sera perturbée le temps de cette maintenance.
      </v-alert>

      <v-alert
          prominent
          text
          icon="mdi-calendar-sync-outline"
          color="info"
          class="mb-5 text-center">
        <strong>MàJ Horaire Henallux &bull; IESN Scheduler</strong>
        <br/>
        Une mise à jour a été déployée pour palier à la mise à jour des horaires Henallux (encore 😅). C'est possible que tu retrouves des cours en trop dans ton horaire.
        <br/>
        Si ça t'arrive, ça serait cool de m'envoyer un MP Discord (<strong>tiiBz#1337</strong>) ou <router-link to="/bug" class="text-decoration-none">via ce formulaire</router-link> pour que je règle ça au plus vite ! 😎
      </v-alert>
      <v-container fluid class="main-container">
        <router-view/>
      </v-container>
    </v-main>
    <Footer/>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  metaInfo() {
    return {
      title: 'IESN Scheduler',
      titleTemplate: '%s | IESN Scheduler',
      meta: [
        {
          property: 'og:url',
          content: 'https://iesn.thibaultclaude.be',
        },
        {
          property: 'og:description',
          content: 'Génération de calendrier personnalisé et visualisation d\'horaire pour la section IG de l\'IESN à Namur.',
        },
        {
          property: 'og:image',
          content: 'https://iesn.thibaultclaude.be/images/favicon.ico',
        }
      ]
    }
  },
  computed: {
    getLastDayOfMonth() {
      const today = new Date();
      return new Date(today.getFullYear(), today.getMonth() + 1, 0);
    },
    getLastFridayOfMonth() {
      let lastDayOfMonth = this.getLastDayOfMonth;
      while (lastDayOfMonth.getDay() !== 5) {
        lastDayOfMonth.setDate(lastDayOfMonth.getDate() - 1);
      }
      return lastDayOfMonth;
    },
    isLastFridayOfMonth() {
      const today = new Date();
      const lastFriday = this.getLastFridayOfMonth;
      return today.getDate() === lastFriday.getDate();
    }
  }
};
</script>

<style scoped>
.main-container {
  max-width: 1140px;
  width: 100%;
}
</style>