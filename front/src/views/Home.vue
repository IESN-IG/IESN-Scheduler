<template>
  <v-container fluid class="text-center">
    <h1 class="blue-grey--text text--lighten-1 font-weight-light">Utilisation du site</h1>
    <p id="pAccroche">
      Hello ! 😄
      <v-col sm="5" xl="6" md="6" class="margin-auto">
        Pour générer ton calendrier (.ics) perso, rien de plus simple : indique le(s) groupe(s) que tu suis ainsi que
        les cours présents dans ton PAE puis génère le lien et utilise le pour créer un calendrier Google !
      </v-col>
    </p>
    <v-row justify="center" align="center">
      <v-col sm="5" xl="6" md="6">
        <v-row align="center" justify="center" class="mb-1">
          <v-icon x-large color="blue">mdi-autorenew</v-icon>
          <h3>Mise à jour automatique</h3></v-row>
        Horaire toujours à jour sur PC, tablette etc sans passer par le portail !
      </v-col>
      <v-col sm="5" xl="6" md="6">
        <v-row align="center" justify="center" class="mb-1">
          <v-icon x-large color="teal">mdi-pencil-outline</v-icon>
          <h3>100% Personnalisable</h3></v-row>
        Possibilité de choisir uniquement les cours de votre PAE !
      </v-col>
    </v-row>
    <v-alert text type="info" class="mt-5 mb-5">Besoin d'aide ? Consulte la page
      <router-link to="/help" class="text-decoration-none">Help</router-link>
      !
    </v-alert>
    <v-alert v-if="loadingError" text type="error" class="mt-5 mb-5">Une erreur s'est produite lors de la récupération des
      informations, veuillez rafraîchir la page ou réessayer plus tard.
    </v-alert>
    <v-skeleton-loader
        :loading="Object.keys(data).length === 0"
        type="list-item@3"
    >
      <v-expansion-panels accordion focusable flat hover v-model="showAccordion" :disabled="loadingError">
        <v-expansion-panel v-for="(bloc, i) in data" v-bind:key="i" :disabled="bloc.groups.length === 0">
          <v-expansion-panel-header>Bloc {{ i.charAt(4) }}</v-expansion-panel-header>
          <v-expansion-panel-content>
              <v-select
                  multiple
                  chips
                  deletable-chips
                  persistent-hint
                  hint="Choisis ton/tes groupes"
                  v-model="selection[`${i}`].groups"
                  label="Groupe"
                  :items="bloc.groups"
                  prepend-inner-icon="mdi-account-group"
                  clearable
              >
              </v-select>
              <v-autocomplete
                  multiple
                  chips
                  :small-chips="selection[`${i}`].classes.length > 5"
                  deletable-chips
                  persistent-hint
                  hint="Choisis ton/tes cours"
                  v-model="selection[`${i}`].classes"
                  label="Cours"
                  :items="bloc.classes"
                  prepend-inner-icon="mdi-school-outline"
                  class="mt-5"
                  clearable
                  @input="searchInput=null"
                  :search-input.sync="searchInput"
                  :disabled="selection[`${i}`].groups.length === 0"
              >
                <v-list-item
                    slot="prepend-item"
                    ripple
                    @click="toggleCours(i)"
                    v-if="!searchInput"
                >
                  <v-list-item-action>
                    <v-icon>{{ iconSelected(selection[`${i}`].classes, bloc.classes) }}</v-icon>
                  </v-list-item-action>
                  <v-list-item-title>{{ labelSelect(selection[`${i}`].classes, bloc.classes) }}</v-list-item-title>
                </v-list-item>
                <v-divider
                    slot="prepend-item"
                    class="mt-2"
                    v-if="!searchInput"
                />
              </v-autocomplete>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-skeleton-loader>
      <v-row justify="end" class="mt-5">
        <v-btn
            color="primary"
            class="mr-4"
            depressed
            @click="generateURL"
            :disabled="!checkGroupsNotEmpty || loadingError"
        >
          <v-icon>mdi-link-variant</v-icon>
          Générer le lien
        </v-btn>
        <v-btn
            color="orange lighten-2"
            class="mr-4"
            depressed
            @click="clearData"
            :disabled="noDataSelected || loadingError"
        >
          <v-icon>mdi-cached</v-icon>
          Reset
        </v-btn>
      </v-row>
    <v-scroll-y-reverse-transition>
      <v-row justify="center" align="center" v-if="urlGenerated">
        <v-col sm="9" xl="11" md="11">
          <v-text-field id="urlGenerated" v-model="urlGenerated" readonly persistent-hint hint="URL Générée"
                        prepend-inner-icon="mdi-link-variant" full-width>
          </v-text-field>
        </v-col>
        <v-col cols="auto">
          <v-tooltip bottom v-model="showConfirmTiptool">
            <template v-slot:activator="{ on: tooltipSuccess }">
              <v-tooltip right>
                <template v-slot:activator="{ on: attrs }">
                  <v-btn v-bind="attrs"
                         v-on="{...tooltipSuccess, ...attrs}"
                         @click="confirmCopyTooltip"
                         text>
                    <v-icon>mdi-content-copy</v-icon>
                  </v-btn>
                </template>
                <span>Clique ici pour copier Gilles</span>
              </v-tooltip>
            </template>
            <span>URL Copiée !</span>
          </v-tooltip>
        </v-col>
      </v-row>
    </v-scroll-y-reverse-transition>

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
  name: "home",
  metaInfo() {
    return {
      title: 'Accueil',
      meta: [
        {
          property: 'og:title',
          content: 'Accueil - IESN Scheduler',
        }
      ]
    }
  },
  data() {
    return {
      showAccordion: null,
      selection: {
        bloc1: {
          groups: [],
          classes: []
        },
        bloc2: {
          groups: [],
          classes: []
        },
        bloc3: {
          groups: [],
          classes: []
        }
      },
      data: { },
      loadingError: false,
      urlGenerated: "",
      showConfirmTiptool: false,
      showToast: false,
      toast: {text: '', color: '', icon: ''},
      searchInput: null
    }
  },
  async created() {
    try{
      this.data = (await axios.get(process.env.VUE_APP_API_URL + '/section/IG')).data;
    }catch(e){
      console.log("err", e)
      this.loadingError = true;
    }
  },
  computed: {
    selectedAllOptions() {
      return (selectedArray, fullArray) => {
        return selectedArray.length === fullArray.length
      }
    },
    selectedSomeOptions() {
      return (selectedArray, fullArray) => {
        return selectedArray.length > 0 && !this.selectedAllOptions(selectedArray, fullArray)
      }
    },
    iconSelected() {
      return (selectedArray, fullArray) => {
        if (this.selectedAllOptions(selectedArray, fullArray)) return 'mdi-close-box'
        if (this.selectedSomeOptions(selectedArray, fullArray)) return 'mdi-minus-box'
        return 'mdi-checkbox-blank-outline'
      }
    },
    labelSelect() {
      return (selectedArray, fullArray) => {
        if (!this.selectedAllOptions(selectedArray, fullArray))
          return "Tout sélectionner"
        else
          return "Tout désélectionner"
      }
    },
    checkGroupsNotEmpty() {
      return this.selection.bloc1.groups.length !== 0 || this.selection.bloc2.groups.length !== 0 || this.selection.bloc3.groups.length !== 0;
    },
    noDataSelected(){
      return !this.checkGroupsNotEmpty && this.selection.bloc1.classes.length === 0 && this.selection.bloc2.classes.length === 0 && this.selection.bloc3.classes.length === 0
    },
    getFullParamsURL() {
      return (obj) => {
        /*
        Parcours des cours sélectionnés pour la génération des String pour les paramètres URL
            - A revoir ?
        */
        let paramCrs1 = `${obj.allClassesBloc1 ? 'crs1[]=all' : obj.classes.bloc1.map(crs => `crs1[]=${crs}`).join('&')}`;
        let paramCrs2 = `${obj.allClassesBloc2 ? 'crs2[]=all' : obj.classes.bloc2.map(crs => `crs2[]=${crs}`).join('&')}`;
        let paramCrs3 = `${obj.allClassesBloc3 ? 'crs3[]=all' : obj.classes.bloc3.map(crs => `crs3[]=${crs}`).join('&')}`;
        /*
            Concatenation des paramètres précédemment créés
                - A revoir?
         */
        let paramCrsFull = (paramCrs1 && paramCrs1.length > 0) ? '&' + paramCrs1 : '';
        paramCrsFull += (paramCrs2 && paramCrs2.length > 0) ? '&' + paramCrs2 : '';
        paramCrsFull += (paramCrs3 && paramCrs3.length > 0) ? '&' + paramCrs3 : '';
        return paramCrsFull
      }
    }
  },
  methods: {
    toggleCours(bloc) {
      this.$nextTick(() => {
        if (this.selectedAllOptions(this.selection[bloc].classes, this.data[bloc].classes.filter(cours => cours.value))) {
          this.selection[bloc].classes = []
        } else {
          this.selection[bloc].classes = this.data[bloc].classes.filter(cours => cours.value).map(cours => cours.value).slice()
        }
      })
    },
    confirmCopyTooltip() {
      this.showConfirmTiptool = true;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(this.urlGenerated);
      } else {
        const input = document.getElementById('urlGenerated');
        input.focus();
        input.select();
        document.execCommand('copy');
      }
      setTimeout(() => {
        this.showConfirmTiptool = false
      }, 1000);
    },
    clearData(){
      this.selection = {
        bloc1: {
          groups: [],
          classes: []
        },
        bloc2: {
          groups: [],
          classes: []
        },
        bloc3: {
          groups: [],
          classes: []
        }
      };
      this.urlGenerated = null;
    },
    generateURL() {
      this.showAccordion = false;
      if (!this.checkGroupsNotEmpty) {
        this.toast = {
          text: "Aucun groupe n'a été sélectionné",
          color: 'error',
          icon: 'mdi-alert-circle-outline'
        }
        this.showToast = true;
        this.urlGenerated = '';
      } else {
        const mergedGroups = this.selection.bloc1.groups.concat(this.selection.bloc2.groups).concat(this.selection.bloc3.groups)
        let generatedObject = {
          classes: {
            bloc1: this.selection.bloc1.classes,
            bloc2: this.selection.bloc2.classes,
            bloc3: this.selection.bloc3.classes
          },
          groups: mergedGroups,
          allClassesBloc1: this.selection.bloc1.classes.length === this.data.bloc1.classes.filter(cours => cours.value).length,
          allClassesBloc2: this.selection.bloc2.classes.length === this.data.bloc2.classes.filter(cours => cours.value).length,
          allClassesBloc3: this.selection.bloc3.classes.length === this.data.bloc3.classes.filter(cours => cours.value).length
        }
        const fullParams = this.getFullParamsURL(generatedObject);
        this.urlGenerated = `${process.env.VUE_APP_API_URL}/calendar?${generatedObject.groups.map(group => `grp[]=${group}`).join('&')}${fullParams}`;
        this.toast = {
          text: "URL générée avec succès",
          color: 'success',
          icon: 'mdi-checkbox-marked-circle-outline'
        }
        this.showToast = true;
      }
    }
  }
}
</script>

<style scoped>
.margin-auto {
  margin: auto;
}
#pAccroche {
  margin-top: 15px;
}
.v-icon {
  margin-right: 5px;
}
</style>