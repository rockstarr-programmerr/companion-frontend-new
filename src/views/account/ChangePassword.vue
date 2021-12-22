<template>
  <v-container class="container-sm">
    <v-breadcrumbs :items="breadcrumbs"></v-breadcrumbs>

    <h1>Change password</h1>
    <v-divider></v-divider>

    <v-card class="mt-5">
      <v-card-text>
        <v-form v-on:keyup.enter.native="changePassword">
          <v-text-field
            v-model="currentPassword"
            label="Current password"
            :type="showCurrentPassword ? 'text' : 'password'"
            :append-icon="showCurrentPassword ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append="showCurrentPassword = !showCurrentPassword"
            :error-messages="currentPasswordErrs"
            :error-count="currentPasswordErrs.length"
          ></v-text-field>

          <v-text-field
            v-model="newPassword"
            label="New password"
            :type="showNewPassword ? 'text' : 'password'"
            :append-icon="showNewPassword ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append="showNewPassword = !showNewPassword"
            :error-messages="newPasswordErrs"
            :error-count="newPasswordErrs.length"
          ></v-text-field>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-btn
          color="primary"
          :loading="loading"
          @click="changePassword"
          min-width="110"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { Api } from '@/api'
import { snakeCaseToCamelCase, unexpectedExc } from '@/utils'
import { assertErrCode, status } from '@/utils/status-codes'
import { Vue, Component } from 'vue-property-decorator'
import { mapMutations } from 'vuex'

@Component({
  methods: {
    ...mapMutations('message', {
      showMessage: 'SHOW_MESSAGE'
    })
  }
})
export default class ChangePassword extends Vue {
  // eslint-disable-next-line no-undef
  [key: string]: unknown

  breadcrumbs = [
    { text: 'Home', to: { name: 'Home' }, exact: true },
    { text: 'Profile', to: { name: 'MyInfo' }, exact: true },
    { text: 'Change password', to: { name: 'ChangePassword' }, exact: true }
  ]

  currentPassword = ''
  newPassword = ''

  currentPasswordErrs: string[] = []
  newPasswordErrs: string[] = []

  showCurrentPassword = false
  showNewPassword = false
  loading = false
  showMessage!: CallableFunction

  changePassword (): void {
    if (this.loading) return
    this.loading = true

    Api.account.changePassword({
      current_password: this.currentPassword,
      new_password: this.newPassword
    })
      .then(() => {
        this.showMessage('Password changed.')
        this.$router.push({ name: 'MyInfo' })
      })
      .catch(err => {
        if (assertErrCode(err, status.HTTP_400_BAD_REQUEST)) {
          const data = err.response.data
          Object.entries(data).forEach(([field, errMsgs]) => {
            const attr = `${snakeCaseToCamelCase(field)}Errs`
            this[attr] = errMsgs
          })
        } else if (assertErrCode(err, status.HTTP_403_FORBIDDEN)) {
          this.currentPasswordErrs = [err.response.data.detail]
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
