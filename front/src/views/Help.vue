<template>
  <v-container fluid class="text-center">
    <v-alert prominent text icon="mdi-alert" color="warning" class="mb-5"><strong>Attention !</strong>
      <br/>
      Le calendrier Google se met automatiquement à jour une seule fois par jour (restriction Google)<br/>
      Le calendrier Outlook se met automatiquement à jour toutes les 3 heures en général (restriction Outlook)
    </v-alert>
    <v-expansion-panels accordion focusable flat hover>
      <v-expansion-panel
          v-for="(tuto, i) in tutos"
          :key="i">
        <v-expansion-panel-header>
          <div>
            <v-icon class="mr-2">{{ tuto.icon }}</v-icon>
            <span>{{ tuto.title }}</span>
          </div>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-card class="mt-5" flat>
            <v-card flat class="mt-5">
              <v-tabs v-model="tuto.tab" centered center-active show-arrows>
                <v-tab
                    v-for="(dTuto, i) in tuto.data"
                    :key="i">
                  Étape {{ i + 1 }}
                </v-tab>
              </v-tabs>
              <v-tabs-items v-model="tuto.tab">
                <v-tab-item
                    v-for="(dataTuto, i) in tuto.data"
                    :key="i"
                >
                  <v-card flat>
                    <v-card-text>
                      <v-row align="center" justify="center">
                        <v-img :src="dataTuto.img.src" :max-width="dataTuto.img.width" :max-height="dataTuto.img.height"
                               class="img-fluid"/>
                      </v-row>
                      <v-row class="row-text-tuto mt-5" align="center" justify="center"><span
                          v-html="dataTuto.text"></span></v-row>
                    </v-card-text>
                  </v-card>
                </v-tab-item>
              </v-tabs-items>
            </v-card>
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
</template>

<script>
export default {
  name: "help",
  metaInfo() {
    return {
      title: 'Aide',
      meta: [
        {
          property: 'og:title',
          content: 'Aide - IESN Scheduler',
        }
      ]
    }
  },
  data() {
    return {
      tabGoogle: null,
      tabOutlook: null,
      tabIOS: null,
      tutos: [
        {
          icon: 'mdi-google',
          title: 'Ajouter à GAgenda',
          tab: null,
          data: [{
            text: 'Une fois que tu as choisi les groupes et classes voulus, génère le lien et copie le.',
            img: {
              src: '/images/URL.png',
              width: '453',
              height: '158'
            }
          }, {
            text: "Pour s'abonner au calendrier sur Gmail, rends toi sur ce lien : <a href='https://calendar.google.com/'>https://calendar.google.com/</a>. Crée ensuite un agenda à partir de l'URL via la sidebar de gauche.",
            img: {
              src: '/images/agendaGoogle.png',
              width: '528',
              height: '214'
            }
          }, {
            text: 'Puis colle l\'URL générée au préalable dans le champ "URL de l\'agenda" et valide.',
            img: {
              src: '/images/agendaGoogle2.png',
              width: '463',
              height: '228'
            }
          }]
        }, {
          icon: 'mdi-microsoft-outlook',
          title: 'Ajouter à Outlook',
          tab: null,
          data: [{
            text: 'Une fois que tu as choisi les groupes et classes voulus, génère le lien et copie le.',
            img: {
              src: '/images/URL.png',
              width: '453',
              height: '158'
            }
          }, {
            text: "Pour s'abonner au calendrier sur Outlook, rends toi sur ce lien : <a href='https://outlook.live.com/calendar/view/month'>https://outlook.live.com/calendar/view/month</a> et choisi d'importer un calendrier via la sidebar de gauche.",
            img: {
              src: '/images/agendaOutlook.png',
              width: '229',
              height: '350'
            }
          }, {
            text: 'Sélectionne "à partir du web" puis colle l\'URL générée au préalable dans le champ "Lien vers le calendrier" et valide.',
            img: {
              src: '/images/agendaOutlook2.png',
              width: '938',
              height: '665'
            }
          }]
        }, {
          icon: 'mdi-apple-ios',
          title: 'Ajouter à iOS',
          tab: null,
          data: [{
            text: 'Une fois que tu as choisi les groupes et classes voulus, génère le lien et copie le.',
            img: {
              src: '/images/URL.png',
              width: '453',
              height: '158'
            }
          }, {
            text: "Pour s'abonner au calendrier depuis un appareil sous iOS, va dans les paramètres puis dans la section \"Comptes et mots de passe\". Puis clique sur \"Ajouter un compte\".",
            img: {
              src: '/images/agendaIOS.png',
              width: '480',
              height: '816'
            }
          }, {
            text: 'Choisi ensuite l\'option "Autre"',
            img: {
              src: '/images/agendaIOS2.png',
              width: '480',
              height: '813'
            }
          }, {
            text: 'Puis l\'option "Ajouter un cal. avec abonnement"',
            img: {
              src: '/images/agendaIOS3.png',
              width: '480',
              height: '812'
            }
          }, {
            text: 'Colle l\'URL générée au préalable dans le champ "Serveur" et fait "Suivant"',
            img: {
              src: '/images/agendaIOS4.png',
              width: '481',
              height: '811'
            }
          }, {
            text: 'Inutile de préciser un nom d\'utilisateur ou mot de passe, tu peux faire "Enregistrer" directement',
            img: {
              src: '/images/agendaIOS5.png',
              width: '479',
              height: '817'
            }
          }]
        }
      ]
    }
  }
}
</script>

<style scoped>
.row-text-tuto {
  background-color: #80808042;
  color: black;
  padding: 5px;
  max-width: 100%;
  margin: auto;
}
.img-fluid {
  flex: 0 1 auto;
}
</style>