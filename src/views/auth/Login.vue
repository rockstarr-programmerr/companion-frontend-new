<template>
  <BaseAuth>
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
        <a
          class="register-link"
          @click="goToRegister"
        >
          Đăng ký
        </a>
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
        :loading="loadingFacebook"
        @click="loginWithFacebook"
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
  </BaseAuth>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { LoginReq, LoginWithFacebookReq, LoginWithGoogleReq } from '@/interfaces/api/account'
import { snakeCaseToCamelCase, unexpectedExc } from '@/utils'
import { assertErrCode, status } from '@/utils/status-codes'
import BaseAuth from './BaseAuth.vue'

@Component({
  components: {
    BaseAuth
  }
})
export default class Login extends Vue {
  // eslint-disable-next-line no-undef
  [index: string]: unknown

  created (): void {
    // @ts-expect-error don't care
    window.fbAsyncInit = function() {
      // @ts-expect-error don't care
      window.FB.init({
        appId      : '710116979896420',
        cookie     : true,
        xfbml      : true,
        version    : 'v12.0'
      });

      // @ts-expect-error don't care
      window.FB.AppEvents.logPageView();

    };

    (function(d, s, id){
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {return;}
      js = d.createElement(s); js.id = id;
      // @ts-expect-error don't care
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      // @ts-expect-error don't care
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  }

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
        const params = new URLSearchParams(location.search)
        const next = params.get('next')
        if (next !== null) {
          this.$router.push(next)
        } else {
          this.$router.push({ name: 'DashBoard' })
        }
      })
  }

  goToRegister (): void {
    const params = new URLSearchParams(location.search)
    const next = params.get('next')
    if (next !== null) {
      this.$router.push({
        name: 'Register',
        query: { next }
      })
    } else {
      this.$router.push({ name: 'Register' })
    }
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

  /**
   * Login with facebook
   */
  loadingFacebook = false

  loginWithFacebook (): void {
    if (this.loadingFacebook) return
    this.loadingFacebook = true

    // @ts-expect-error don't care
    window.FB.login(res => {
      if (res.status === 'connected') {
        const payload: LoginWithFacebookReq = {
          access_token: res.authResponse.accessToken,
          expires_in: res.authResponse.expiresIn
        }
        this.$store.dispatch('account/loginWithFacebook', payload)
          .catch(unexpectedExc)
          .then(() => {
            this.loginSuccess()
          })
          .finally(() => {
            this.loadingFacebook = false
          })
      }
    }, {scope: 'public_profile,email'})
  }
}
</script>

<style scoped lang="scss">
.register-link {
  text-decoration: underline;
}
</style>
