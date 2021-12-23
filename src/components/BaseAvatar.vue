<template>
  <v-avatar
    :color="imgSrc !== null ? 'white' : backgroundColor"
    v-bind="$attrs"
  >
    <v-img
      v-if="imgSrc !== null"
      :src="imgSrc"
      :alt="localUser.nickname"
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
    <span
      v-else
      class="white--text"
      :style="{ fontSize }"
    >
      {{ localUser.nickname.charAt(0) }}
    </span>
  </v-avatar>
</template>

<script lang="ts">
import { User } from '@/interfaces/user'
import { Vue, Component, Prop } from 'vue-property-decorator'
import { mapState } from 'vuex'

@Component({
  computed: {
    ...mapState('account', [
      'loggedInUser'
    ])
  }
})
export default class BaseAvatar extends Vue {
  @Prop() readonly user!: User | undefined
  @Prop({ type: String, default: 'secondary' }) readonly backgroundColor!: string

  loggedInUser!: User

  get localUser (): User {
    return this.user || this.loggedInUser
  }

  get imgSize (): number {
    return parseInt(this.$attrs.size || '48')
  }

  get imgSrc (): string | null {
    if (this.imgSize > 64) {
      return this.localUser.avatar
    } else {
      return this.localUser.avatar_thumbnail
    }
  }

  get fontSize (): string {
    const imgSize = this.imgSize * 0.5
    return imgSize.toString() + 'px'
  }
}
</script>

<style scoped lang="scss">

</style>
