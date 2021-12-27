<template>
  <v-dialog
    v-model="localValue"
    width="500"
  >
    <v-card>
      <v-card-title>
        Xác nhận
      </v-card-title>
      <v-card-text>
        <slot></slot>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          text
          @click="$emit('cancel')"
        >
          Hủy
        </v-btn>
        <v-btn
          color="primary"
          depressed
          :loading="loading"
          @click="$emit('confirm')"
        >
          OK
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class BaseDialogConfirm extends Vue {
  @Prop(Boolean) readonly value!: boolean
  @Prop(Boolean) readonly loading!: boolean

  get localValue (): boolean {
    return this.value
  }

  set localValue (value: boolean) {
    this.$emit('input', value)
  }
}
</script>

<style scoped lang="scss">

</style>
