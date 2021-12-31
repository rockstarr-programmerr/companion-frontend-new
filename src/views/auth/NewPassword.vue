<template>
  <v-container>
    <div>
      <h1>
        Companion
      </h1>
    </div>

    <div class="my-5">
      Hãy đặt lại mật khẩu mới.
    </div>

    <v-text-field
      v-model="password"
      label="New password"
      autofocus
      outlined
      :error-messages="passwordErrs"
      :error-count="passwordErrs.length"
      :type="show ? 'text' : 'password'"
      :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
      @click:append="show = !show"
      v-on:keydown.enter.native.prevent
    ></v-text-field>

    <v-btn
      color="primary"
      depressed
      block
      large
      :loading="loading"
      @click="submit"
    >
      Xác nhận
    </v-btn>
  </v-container>
</template>

<script lang="ts">
import { Api } from '@/api'
import { snakeCaseToCamelCase } from '@/utils'
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
export default class NewPassword extends Vue {
  // eslint-disable-next-line no-undef
  [index: string]: unknown

  token = ''
  uid = ''
  showSuccess!: CallableFunction

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
        this.showSuccess('Đặt lại mật khẩu thành công, hãy đăng nhập với mật khẩu mới.')
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
