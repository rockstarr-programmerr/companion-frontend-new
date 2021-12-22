<template>
  <BaseAuth>
    <v-card class="mt-5">
      <v-card-subtitle>
        We'll send you instruction to reset your password.
      </v-card-subtitle>

      <template v-if="!sent">
        <v-card-text>
          <v-form v-on:keydown.native.enter="submit">
            <v-text-field
              v-model="email"
              label="Email"
              autofocus
              v-on:keydown.native.enter.prevent
              :error-messages="emailErrs"
              :error-count="emailErrs.length"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            min-width="110"
            :loading="loading"
            @click="submit"
          >
            Send
          </v-btn>
        </v-card-actions>
      </template>

      <v-card-text v-else>
        <p>Done, check your email for instructions.</p>
        <p>
          Didn't receive?
          Check your spam inbox, or
          <a
            href="#"
            @click="submit"
            class="ml-1"
          >
            <v-progress-circular
              v-if="loading"
              indeterminate
              color="primary"
              width="2"
              size="18"
            ></v-progress-circular>
            <span v-else>
              Resend
            </span>
          </a>
        </p>
      </v-card-text>
    </v-card>
  </BaseAuth>
</template>

<script lang="ts">
import { Api } from '@/api'
import { snakeCaseToCamelCase, unexpectedExc } from '@/utils'
import { assertErrCode, status } from '@/utils/status-codes'
import { Vue, Component } from 'vue-property-decorator'
import BaseAuth from './BaseAuth.vue'

@Component({
  components: {
    BaseAuth
  }
})
export default class ResetPassword extends Vue {
  // eslint-disable-next-line no-undef
  [index: string]: unknown

  email = ''
  emailErrs: string[] = []
  loading = false
  sent = false

  submit (): void {
    if (this.loading) return
    this.loading = true

    Api.account.emailResetPasswordLink({
      email: this.email
    })
      .then(() => {
        this.sent = true
      })
      .catch(err => {
        if (assertErrCode(err, status.HTTP_400_BAD_REQUEST)) {
          const data = err.response.data
          Object.entries(data).forEach(([field, errMsgs]) => {
            const attr = `${snakeCaseToCamelCase(field)}Errs`
            this[attr] = errMsgs
          })
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
