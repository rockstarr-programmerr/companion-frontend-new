<template>
  <v-container class="container-xs">
    <v-img
      :src="require('@/assets/cover.png')"
      width="50%"
      class="mx-auto"
    ></v-img>
    <v-divider></v-divider>
    <slot></slot>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class BaseAuth extends Vue {

}
</script>

<style scoped lang="scss">

</style>
