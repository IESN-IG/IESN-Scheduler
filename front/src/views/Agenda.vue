<template>
  <v-container fluid class="text-center">
    <v-scroll-y-reverse-transition>
      <v-alert v-if="loadingError" text :type="errorInfo.type" class="mb-5">
        {{ errorInfo.text }}
      </v-alert>
    </v-scroll-y-reverse-transition>
    <v-layout row wrap justify-center>
      <v-col sm="5" xl="4" md="4">
        <v-select
            v-model="selection.bloc"
            :items="data.blocsOption"
            label="Choix du bloc"
            hide-details
            outlined
            dense
            @change="getGroups"
        ></v-select>
      </v-col>
      <v-col sm="5" xl="4" md="4">
        <v-select
            v-model="selection.group"
            :items="data.groups"
            label="Choix du groupe"
            hide-details
            outlined
            dense
            :disabled="!selection.bloc || this.data.groups.length === 0"
            @change="getEvents"
        ></v-select>
      </v-col>
    </v-layout>
    <v-skeleton-loader
        :loading="calendarLoading"
        :boilerplate="boilerplate"
        type="date-picker-days@3"
    >
      <v-sheet height="64">
        <v-toolbar flat color="white">
          <v-btn fab text small color="grey darken-2" @click="prev">
            <v-icon small>mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn fab text small color="grey darken-2" @click="next">
            <v-icon small>mdi-chevron-right</v-icon>
          </v-btn>
          <v-toolbar-title v-if="$refs.calendar">
            {{ $refs.calendar.title }}
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-menu bottom right>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                  outlined
                  color="grey darken-2"
                  v-bind="attrs"
                  v-on="on"
              >
                <span>{{ typeToLabel[type] }}</span>
                <v-icon right>mdi-menu-down</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="type = 'day'">
                <v-list-item-title>Jour</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'week'">
                <v-list-item-title>Semaine</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'month'">
                <v-list-item-title>Mois</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-toolbar>
      </v-sheet>
      <v-calendar
          ref="calendar"
          v-model="focus"
          color="primary"
          :events="data.events"
          :event-color="getEventColor"
          :type="type"
          :weekdays="weekdays"
          @click:event="showEvent"
          @click:more="viewDay"
          @click:date="viewDay"
          locale="fr"
      ></v-calendar>
      <v-sheet height="64">
        <v-toolbar flat color="white">
          <v-btn outlined class="mr-4" color="grey darken-2" @click="setToday">
            Aujourd'hui
          </v-btn>
          <v-spacer></v-spacer>
        </v-toolbar>
      </v-sheet>
      <v-menu
          v-model="selection.open"
          :close-on-content-click="false"
          :activator="selection.element"
          offset-x
      >
        <v-card
            color="grey lighten-4"
            min-width="350px"
            flat
        >
          <v-toolbar
              :color="selection.event.color"
              dark
          >
            <v-toolbar-title v-html="selection.event.name"></v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn
                text
                @click="selection.open = false"
            >
              <v-icon>mdi-close-thick</v-icon>
            </v-btn>
          </v-toolbar>
          <v-card-text>
            <span v-html="selection.event.details"></span>
          </v-card-text>
        </v-card>
      </v-menu>
    </v-skeleton-loader>
  </v-container>
</template>

<script>
import axios from "axios";
export default {
  name: "agenda",
  metaInfo() {
    return {
      title: 'Agenda',
      meta: [
        {
          property: 'og:title',
          content: 'Agenda - IESN Scheduler',
        }
      ],
    }
  },
  data: () => ({
    focus: '',
    type: 'month',
    typeToLabel: {
      month: 'Mois',
      week: 'Semaine',
      day: 'Jour',
    },
    calendarLoading: true,
    boilerplate: true,
    selection: {
      event: {},
      element: null,
      open: false,
      bloc: '',
      group: ''
    },
    data: {
      events: [],
      blocsOption: [{
        text: "Bloc 1",
        value: 1,
      }, {
        text: "Bloc 2",
        value: 2,
      }, {
        text: "Bloc 3",
        value: 3,
      },],
      groups: []
    },
    weekdays: [1, 2, 3, 4, 5, 6, 0],
    loadingError: false,
    errorInfo: {
      type: '',
      text: ''
    }
  }),
  methods: {
    async getGroups() {
      this.selection.group = '';
      this.calendarLoading = true;
      this.boilerplate = true;
      this.loadingError = false;
      axios.get(`${process.env.VUE_APP_API_URL}/api/groups/${this.selection.bloc}`)
          .then(result => {
            this.data.groups = result.data;
          })
        .catch(() => {
            this.loadingError = true;
            this.errorInfo = {
              text: "Une erreur s'est produite lors de la récupération des informations, veuillez rafraîchir la page ou réessayer plus tard.",
              type: "error"
            }
        })
    },
    getEvents() {
      this.boilerplate = false;
      this.calendarLoading = true;
      this.loadingError = false;
      axios.get(`${process.env.VUE_APP_API_URL}/api/calendar/${this.selection.group}`)
          .then(result => {
            if(result.data.length === 0){
              this.loadingError = true;
              this.boilerplate = true;
              this.errorInfo = {
                text: "Aucune information n'est disponible pour ce groupe.",
                type: "warning"
              }
            }else{
              this.data.events = result.data;
              this.calendarLoading = false;
            }
          })
          .catch(() => {
            this.loadingError = true;
            this.boilerplate = true;
            this.errorInfo = {
              text: "Une erreur s'est produite lors de la récupération des informations, veuillez rafraîchir la page ou réessayer plus tard.",
              type: "error"
            }
          })
    },
    viewDay({date}) {
      this.focus = date
      this.type = 'day'
    },
    getEventColor(event) {
      return event.color
    },
    setToday() {
      this.focus = ''
    },
    prev() {
      this.$refs.calendar.prev()
    },
    next() {
      this.$refs.calendar.next()
    },
    showEvent({nativeEvent, event}) {
      const open = () => {
        this.selection.event = event
        this.selection.element = nativeEvent.target
        setTimeout(() => this.selection.open = true, 10)
      }
      if (this.selection.open) {
        this.selection.open = false
        setTimeout(open, 10)
      } else {
        open()
      }
      nativeEvent.stopPropagation()
    }
  },
}
</script>

<style scoped>
</style>