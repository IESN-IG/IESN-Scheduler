<template>
  <v-footer padless app absolute>
    <v-row
        justify="center"
        no-gutters
    >
      <v-btn
          color="grey"
          text
          rounded
          class="my-2"
          href="https://github.com/IESN-IG/IESN-Scheduler"
          target="_blank"
      >
        <v-icon>mdi-github</v-icon>
      </v-btn>
      <v-col
          class="py-4 text-center grey--text"
          cols="12"
      >
        Support : contact@thibaultclaude.be | Discord : <strong>tiiBz</strong>#1337
      </v-col>
    </v-row>
  </v-footer>
</template>

<script>
export default {
  name: "Footer"
}
</script>

<style scoped>
</style>