<template>
  <v-container>
    <div>
      <h1>
        Companion
      </h1>
    </div>

    <template v-if="!sent">
      <div class="my-5 text-body-2">
        Chúng tôi sẽ gửi bạn email hướng dẫn đặt lại mật khẩu.
      </div>

      <v-text-field
        v-model="email"
        label="Email"
        autofocus
        outlined
        v-on:keydown.native.enter.prevent
        :error-messages="emailErrs"
        :error-count="emailErrs.length"
      ></v-text-field>

      <v-btn
        color="primary"
        min-width="110"
        block
        depressed
        large
        :loading="loading"
        @click="submit"
      >
        Gửi
      </v-btn>
    </template>

    <div
      v-else
      class="mt-5 text-body-2"
    >
      <p>Vui lòng kiểm tra email để xem hướng dẫn chi tiết.</p>
      <p>
        Không nhận được email nào?
        Hãy kiểm tra hòm thư rác, hoặc
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
            Gửi lại
          </span>
        </a>
      </p>
    </div>
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
      showSuccess: 'SHOW_SUCCESS'
    })
  }
})
export default class ResetPassword extends Vue {
  // eslint-disable-next-line no-undef
  [index: string]: unknown

  email = ''
  emailErrs: string[] = []
  loading = false
  sent = false
  showSuccess!: CallableFunction

  submit (): void {
    if (this.loading) return
    this.loading = true

    Api.account.emailResetPasswordLink({
      email: this.email
    })
      .then(() => {
        this.sent = true
        this.showSuccess('Gửi email thành công.')
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
