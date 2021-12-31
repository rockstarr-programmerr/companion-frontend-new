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
        autofocus
        :error-messages="emailErrs"
        :error-count="emailErrs.length"
      ></v-text-field>
      <v-text-field
        v-model="password"
        label="Mật khẩu"
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
        <router-link :to="{ name: 'ResetPassword' }">
          Quên mật khẩu?
        </router-link>
      </v-col>
      <v-col cols="auto">
        <router-link :to="{ name: 'Register' }">
          Đăng ký
        </router-link>
      </v-col>
    </v-row>

    <v-btn
      depressed
      block
      large
      color="primary"
      min-width="110"
      :loading="loading"
      class="mt-6"
      @click="login"
    >
      Đăng nhập
    </v-btn>

    <v-row
      class="mt-4"
      align="center"
    >
      <v-col cols="5">
        <v-divider></v-divider>
      </v-col>
      <v-col cols="2" class="text-center">
        Hoặc
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
        Đăng nhập bằng facebook
      </v-btn>
      <v-btn
        block
        large
        color="white"
        class="mt-4"
        :loading="loadingGoogle"
        @click="loginWithGoogle"
      >
        <v-icon left>
          mdi-google
        </v-icon>
        Đăng nhập bằng google
      </v-btn>
    </div>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { LoginReq, LoginWithGoogleReq } from '@/interfaces/api/account'
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

    try {
      await this.$store.dispatch('account/login', payload)
      this.loginSuccess()
    } catch (error) {
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
    } finally {
      this.loading = false
    }
  }

  loginSuccess (): void {
    this.$store.dispatch('account/getInfo')
      .then(() => {
        this.$router.push({ name: 'DashBoard' })
      })
  }

  /**
   * Login with google
   */
  loadingGoogle = false

  async loginWithGoogle (): Promise<void> {
    // @ts-expect-error don't care
    if (this.loadingGoogle || !this.$gAuth.isInit) return
    this.loadingGoogle = true

    try {
      // @ts-expect-error don't care
      const googleUser = await this.$gAuth.signIn()
      const auth = googleUser.getAuthResponse()

      const payload: LoginWithGoogleReq = {
        access_token: auth.access_token,
        expires_in: auth.expires_in
      }
      await this.$store.dispatch('account/loginWithGoogle', payload)

      this.loginSuccess()
    } catch (error) {
      unexpectedExc(error)
    } finally {
      this.loadingGoogle = false
    }
  }
}
</script>

<style scoped lang="scss">

</style>
