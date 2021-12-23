<template>
  <v-container>
    <div>
      <h1>
        Companion
      </h1>
    </div>

    <div class="mt-10">
      <v-text-field
        v-model="email"
        label="Email"
        outlined
        :error-messages="emailErrs"
        :error-count="emailErrs.length"
      ></v-text-field>
      <v-text-field
        v-model="password"
        label="password"
        outlined
        :error-messages="passwordErrs"
        :error-count="passwordErrs.length"
        :type="showPassword ? 'text' : 'password'"
        :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
        @click:append="showPassword = !showPassword"
      ></v-text-field>
    </div>

    <div
      v-if="errorMsg !== ''"
      class="error--text mb-3"
    >
      {{ errorMsg }}
    </div>

    <v-row justify="space-between">
      <v-col cols="auto">
        <a href="#">Forgot password?</a> <!-- TODO -->
      </v-col>
      <v-col cols="auto">
        <a href="#">Register</a> <!-- TODO -->
      </v-col>
    </v-row>

    <v-btn
      depressed
      block
      color="primary"
      min-width="110"
      :loading="loading"
      class="mt-6"
      @click="login"
    >
      Login
    </v-btn>

    <v-row
      class="mt-4"
      align="center"
    >
      <v-col cols="5">
        <v-divider></v-divider>
      </v-col>
      <v-col cols="2" class="text-center">
        Or
      </v-col>
      <v-col cols="5">
        <v-divider></v-divider>
      </v-col>
    </v-row>

    <div class="mt-6">
      <v-btn
        color="#385790"
        block
        large
        dark
      >
        <v-icon left>
          mdi-facebook
        </v-icon>
        Login with facebook
      </v-btn>
      <v-btn
        block
        large
        color="white"
        class="mt-4"
      >
        <v-icon left>
          mdi-google
        </v-icon>
        Login with google
      </v-btn>
    </div>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { LoginReq } from '@/interfaces/api/account'
import { snakeCaseToCamelCase, unexpectedExc } from '@/utils'
import { assertErrCode, status } from '@/utils/status-codes'

@Component
export default class Login extends Vue {
  // eslint-disable-next-line no-undef
  [index: string]: unknown

  email = ''
  password = ''
  emailErrs: string[] = []
  passwordErrs: string[] = []
  showPassword = false
  loading = false
  errorMsg = ''

  async login (): Promise<void> {
    this.errorMsg = ''
    if (this.loading) return
    this.loading = true

    const payload: LoginReq = {
      email: this.email,
      password: this.password
    }

    const promises = [
      this.$store.dispatch('account/login', payload),
      this.$store.dispatch('account/getInfo')
    ]

    Promise.all(promises)
      .then(() => {
        this.$router.push({ name: 'DashBoard' })
      })
      .catch(error => {
        if (assertErrCode(error, status.HTTP_401_UNAUTHORIZED)) {
          this.errorMsg = error.response.data.detail
        } else if (assertErrCode(error, status.HTTP_400_BAD_REQUEST)) {
          const data = error.response.data
          Object.entries(data).forEach(([field, errMsgs]) => {
            const attr = `${snakeCaseToCamelCase(field)}Errs`
            this[attr] = errMsgs
          })
        } else {
          unexpectedExc(error)
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
