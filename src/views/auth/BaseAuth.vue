<template>
  <v-container>
    <div>
      <v-img
        :src="require('@/assets/logo.png')"
        width="100"
        height="100"
        max-width="100"
        max-height="100"
        class="mx-auto"
      >
        <template #placeholder>
          <v-row
            class="fill-height ma-0"
            justify="center"
            align="center"
          >
            <v-progress-circular
              indeterminate
              color="primary"
            ></v-progress-circular>
          </v-row>
        </template>
      </v-img>
      <h1 class="text-center text-h3">
        Companion
      </h1>
    </div>
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
