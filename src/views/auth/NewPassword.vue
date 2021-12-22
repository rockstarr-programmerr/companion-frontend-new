<template>
  <BaseAuth>
    <v-card class="mt-5">
      <v-card-title>
        Choose your new password
      </v-card-title>
      <v-card-subtitle>
        Don't forget it this time :)
      </v-card-subtitle>
      <v-card-text>
        <v-form v-on:keydown.enter.native="submit">
          <v-text-field
            v-model="password"
            label="New password"
            autofocus
            :error-messages="passwordErrs"
            :error-count="passwordErrs.length"
            :type="show ? 'text' : 'password'"
            :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append="show = !show"
            v-on:keydown.enter.native.prevent
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          :loading="loading"
          min-width="110"
          @click="submit"
        >
          Submit
        </v-btn>
      </v-card-actions>
    </v-card>
  </BaseAuth>
</template>

<script lang="ts">
import { Api } from '@/api'
import { snakeCaseToCamelCase } from '@/utils'
import { assertErrCode, status } from '@/utils/status-codes'
import { Vue, Component } from 'vue-property-decorator'
import { mapMutations } from 'vuex'
import BaseAuth from './BaseAuth.vue'

@Component({
  methods: {
    ...mapMutations('message', {
      showMessage: 'SHOW_MESSAGE'
    })
  },
  components: {
    BaseAuth
  }
})
export default class NewPassword extends Vue {
  // eslint-disable-next-line no-undef
  [index: string]: unknown

  token = ''
  uid = ''
  showMessage!: CallableFunction

  created (): void {
    this.token = (this.$route.query.token as string) || ''
    this.uid = (this.$route.query.uid as string) || ''
  }

  password = ''
  passwordErrs: string[] = []
  loading = false
  show = false

  submit (): void {
    if (this.loading) return
    this.loading = true

    Api.account.resetPassword({
      uid: this.uid,
      token: this.token,
      password: this.password
    })
      .then(() => {
        this.showMessage('Password reset completed. You can login with your new password.')
        this.$router.push({ name: 'Login' })
      })
      .catch(err => {
        if (assertErrCode(err, status.HTTP_400_BAD_REQUEST)) {
          const data = err.response.data
          Object.entries(data).forEach(([field, errMsgs]) => {
            const attr = `${snakeCaseToCamelCase(field)}Errs`
            this[attr] = errMsgs
          })
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
