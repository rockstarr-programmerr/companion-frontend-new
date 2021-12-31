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
        autofocus
        outlined
        :error-messages="emailErrs"
        :error-count="emailErrs.length"
      ></v-text-field>
      <v-text-field
        v-model="password"
        label="Password"
        outlined
        :type="showPassword ? 'text' : 'password'"
        :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
        @click:append="showPassword = !showPassword"
        :error-messages="passwordErrs"
        :error-count="passwordErrs.length"
      ></v-text-field>
    </div>

    <div>
      Đã có tài khoản?
      <router-link :to="{ name: 'Login' }" class="ml-1">
        Đăng nhập
      </router-link>
    </div>

    <v-btn
      @click="register"
      block
      depressed
      large
      color="primary"
      :loading="loading"
      class="mt-6"
    >
      Đăng ký
    </v-btn>
  </v-container>
</template>

<script lang="ts">
import { Api } from '@/api'
import { RegisterUserReq } from '@/interfaces/api/account'
import { unexpectedExc } from '@/utils'
import { assertErrCode, status } from '@/utils/status-codes'
import { Vue, Component } from 'vue-property-decorator'
import { mapMutations } from 'vuex'

@Component({
  methods: {
    ...mapMutations('message', {
      showSuccess: 'SHOW_SUCCESS'
    })
  }
})
export default class Register extends Vue {
  // eslint-disable-next-line no-undef
  [key: string]: unknown

  email = ''
  password = ''
  showPassword = false
  loading = false
  showSuccess!: CallableFunction

  emailErrs: string[] = []
  passwordErrs: string[] = []

  async register (): Promise<void> {
    if (this.loading) return
    this.loading = true
    this.resetValidation()

    const payload: RegisterUserReq = {
      email: this.email,
      password: this.password
    }

    try {
      await Api.account.register(payload)
      await this.$store.dispatch('account/login', payload)
      await this.$store.dispatch('account/getInfo')
      this.showSuccess('Chào bạn đến với Companion 😊')
      this.$router.push({ name: 'DashBoard' })
    } catch (error) {
      if (assertErrCode(error, status.HTTP_400_BAD_REQUEST)) {
        const data = error.response.data
        Object.entries(data).forEach(([field, errMsgs]) => {
          const attr = `${field}Errs`
          this[attr] = errMsgs
        })
      } else {
        unexpectedExc(error)
      }
    } finally {
      this.loading = false
    }
  }

  resetValidation (): void {
    this.emailErrs = []
    this.passwordErrs = []
  }
}
</script>

<style scoped lang="scss">

</style>
