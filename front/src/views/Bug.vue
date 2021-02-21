<template>
  <v-container fluid class="text-center">
    <h1 class="blue-grey--text text--lighten-1 font-weight-light">Signaler un problème</h1>
    <v-form ref="bugForm" v-model="validForm" @submit.prevent="sendBugForm">
      <v-text-field
          v-model="sectionClass"
          :rules="sectionClassRules"
          label="Année et groupe concernés"
          hint="L'année et le groupe avec lequel tu as rencontré le problème"
          required
      ></v-text-field>
      <v-text-field
          v-model="classeConcerned"
          label="Cours concerné(s) (optionnel)"
          hint="S'il s'agit d'un cours en trop c'est cool de le préciser"
      ></v-text-field>
      <v-text-field
          v-model="contact"
          label="Discord (optionnel)"
          hint="Pour te recontacter si j'ai besoin de + d'infos"
      ></v-text-field>
      <v-textarea
          v-model="bugDescription"
          label="Description du problème"
          hint="Quelques mots sur le problème pour le résoudre au plus vite"
          required
          :rules="bugDescriptionRules"
      >
      </v-textarea>
      <v-row justify="end" class="mt-5">
        <v-btn
            :disabled="!validForm"
            color="success"
            type="submit"
            depressed
        >
          <v-icon class="mr-2">mdi-send</v-icon>
          Envoyer
        </v-btn>
      </v-row>
    </v-form>
    <v-snackbar
        v-model="showToast"
        :color="toast.color"
        timeout="2000"
        text
    >
      <v-icon :color="toast.color">{{ toast.icon }}</v-icon>
      {{ toast.text }}
    </v-snackbar>
  </v-container>
</template>

<script>
import axios from 'axios';
export default {
  name: "bug",
  metaInfo() {
    return {
      title: 'Signaler un bug',
      meta: [
        {
          property: 'og:title',
          content: 'Signaler un problème - IESN Scheduler',
        }
      ]
    }
  },
  data() {
    return {
      validForm: true,
      showToast: false,
      sectionClass: '',
      contact: '',
      sectionClassRules: [val => !!val || 'Merci de renseigner ta section, année et ton groupe'],
      classeConcerned: '',
      bugDescription: '',
      bugDescriptionRules: [val => !!val || 'Merci de donner un minimum de renseignement sur le problème rencontré'],
      toast: {text: '', color: '', icon: ''}
    }
  },
  methods: {
    sendBugForm() {
      axios.post('https://iesn.thibaultclaude.be/api/discord/send',{
          section: this.sectionClass,
          classe: this.classeConcerned,
          contact: this.contact,
          description: this.bugDescription
      }).then(() => {
            this.toast = {
              text: "Message envoyé",
              color: 'success',
              icon: 'mdi-checkbox-marked-circle-outline'
            }
            this.showToast = true;
            this.$refs.bugForm.reset();
          })
          .catch(() => {
            this.toast = {
              text: "Une erreur est survenue lors de l'envoi du message",
              color: 'error',
              icon: 'mdi-alert-circle-outline'
            }
            this.showToast = true;
          });
    }
  }
}
</script>

<style scoped>
</style>