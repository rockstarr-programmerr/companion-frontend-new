<template>
  <v-container>
    <div>
      <v-btn
        icon
        @click="$router.back()"
      >
        <v-icon>
          mdi-arrow-left-thin
        </v-icon>
      </v-btn>
    </div>

    <h1 class="text-h5 font-weight-bold mb-6">
      Thay ảnh đại diện
    </h1>

    <v-file-input
      v-model="avatar"
      label="Avatar"
      prepend-icon="mdi-camera"
      outlined
      :error-messages="avatarErrs"
      :error-count="avatarErrs.length"
    ></v-file-input>

    <v-btn
      color="primary"
      block
      depressed
      large
      :loading="updating"
      @click="update"
    >
      Lưu
    </v-btn>
  </v-container>
</template>

<script lang="ts">
import { UpdateProfileReq } from '@/interfaces/api/account'
import { User } from '@/interfaces/user'
import { unexpectedExc } from '@/utils'
import { assertErrCode, status } from '@/utils/status-codes'
import { Vue, Component } from 'vue-property-decorator'
import { mapState, mapMutations } from 'vuex'

@Component({
  computed: {
    ...mapState('account', {
      user: 'loggedInUser'
    })
  },
  methods: {
    ...mapMutations('message', {
      showSuccess: 'SHOW_SUCCESS'
    })
  }
})
export default class MyInfoChangeAvatar extends Vue {
  // eslint-disable-next-line no-undef
  [index: string]: unknown

  /**
   * Setup
   */
  loading = true
  user!: User

  created (): void {
    if (this.user.avatar !== null) {
      Vue.axios.get(this.user.avatar, {
        // @ts-expect-error this is our custom config
        noAuthorization: true
      })
        .then(res => {
          if (this.user.avatar !== null) {
            const parts = this.user.avatar.split('/')
            const avatarName = parts[parts.length - 1]
            const file = new File([res.data], avatarName)
            this.avatar = file
            this.originalAvatar = file
          }
        })
    }
  }

  /**
   * Change name
   */
  avatar: File | null = null
  avatarErrs: string[] = []
  originalAvatar: File | null = null

  updating = false
  showSuccess!: CallableFunction

  update (): void {
    if (this.updating) return
    this.updating = true

    if (this.avatar === this.originalAvatar) {
      this.$router.push({ name: 'MyInfo' })
      return
    }

    const payload: UpdateProfileReq = {
      avatar: this.avatar
    }
    this.$store.dispatch('account/updateProfile', payload)
      .then(() => {
        this.showSuccess('Cập nhật thành công.')
        this.$router.push({ name: 'MyInfo' })
      })
      .catch(err => {
        if (assertErrCode(err, status.HTTP_400_BAD_REQUEST)) {
          const data = err.response.data
          this.avatarErrs = data.avatar || []
        } else {
          unexpectedExc(err)
        }
      })
      .finally(() => {
        this.updating = false
      })
  }
}
</script>

<style scoped lang="scss">

</style>
