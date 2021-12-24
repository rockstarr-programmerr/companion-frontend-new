<template>
  <v-container>
    EventDetail
    <h1>{{ pk }}</h1>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class EventDetail extends Vue {
  @Prop(Number) readonly pk!: number
}
</script>

<style scoped lang="scss">

</style>
