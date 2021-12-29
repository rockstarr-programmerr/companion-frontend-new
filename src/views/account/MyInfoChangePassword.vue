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
      Đổi mật khẩu
    </h1>

    <v-text-field
      v-model="currentPassword"
      label="Mật khẩu hiện tại"
      outlined
      :error-messages="currentPasswordErrs"
      :error-count="currentPasswordErrs.length"
      :type="showCurrentPassword ? 'text' : 'password'"
      :append-icon="showCurrentPassword ? 'mdi-eye-off' : 'mdi-eye'"
      @click:append="showCurrentPassword = !showCurrentPassword"
    ></v-text-field>

    <v-text-field
      v-model="newPassword"
      label="Mật khẩu mới"
      outlined
      :error-messages="newPasswordErrs"
      :error-count="newPasswordErrs.length"
      :type="showNewPassword ? 'text' : 'password'"
      :append-icon="showNewPassword ? 'mdi-eye-off' : 'mdi-eye'"
      @click:append="showNewPassword = !showNewPassword"
    ></v-text-field>

    <v-btn
      color="primary"
      block
      depressed
      large
      :loading="loading"
      @click="changePassword"
    >
      Lưu
    </v-btn>
  </v-container>
</template>

<script lang="ts">
import { Api } from '@/api'
import { ChangePasswordReq } from '@/interfaces/api/account'
import { User } from '@/interfaces/user'
import { unexpectedExc } from '@/utils'
import { assertErrCode, status } from '@/utils/status-codes'
import { Vue, Component } from 'vue-property-decorator'
import { mapMutations, mapState } from 'vuex'

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
export default class MyInfoChangePassword extends Vue {
  // eslint-disable-next-line no-undef
  [index: string]: unknown

  /**
   * Setup
   */
  user!: User

  /**
   * Change name
   */
  newPassword = ''
  newPasswordErrs: string[] = []
  showNewPassword = false

  currentPassword = ''
  currentPasswordErrs: string[] = []
  showCurrentPassword = false

  loading = false
  showSuccess!: CallableFunction

  changePassword (): void {
    if (this.loading) return
    this.loading = true

    const payload: ChangePasswordReq = {
      new_password: this.newPassword,
      current_password: this.currentPassword
    }

    Api.account.changePassword(payload)
      .then(() => {
        this.showSuccess('Đổi mật khẩu thành công.')
        this.$router.push({ name: 'MyInfo' })
      })
      .catch(err => {
        const data = err.response.data
        if (assertErrCode(err, status.HTTP_400_BAD_REQUEST)) {
          this.currentPasswordErrs = data.current_password || []
          this.newPasswordErrs = data.new_password || []
        } else if (assertErrCode(err, status.HTTP_403_FORBIDDEN)) {
          this.currentPasswordErrs = data.detail
          this.newPasswordErrs = data.new_password || []
        } else {
          unexpectedExc(err)
        }
      })
      .finally(() => {
        this.loading = false
      })
  }
}
</script>

<style scoped lang="scss">

</style>
