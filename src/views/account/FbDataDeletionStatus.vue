<template>
  <v-container>
    <h1 class="text-h5 font-weight-bold mb-6">
      Trạng thái xóa tài khoản
    </h1>

    <v-skeleton-loader
      v-if="loading"
      type="paragraph"
    ></v-skeleton-loader>

    <div v-else>
      <p>Mã xác nhận: {{ status.confirmation_code }}</p>
      <p>Trạng thái: {{ getStatusText(status.status) }}</p>
      <p>Thời gian yêu cầu: {{ status.issued_at }}</p>
      <p>Thời gian hết hạn: {{ status.expires }}</p>
    </div>

    <router-link :to="{ name: 'DashBoard' }">
      Về trang chủ
    </router-link>
  </v-container>
</template>

<script lang="ts">
import { Api } from '@/api'
import { FbDataDeletionStatusRes } from '@/interfaces/api/account'
import { unexpectedExc } from '@/utils'
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class FbDataDeletionStatus extends Vue {
  loading = true

  status: FbDataDeletionStatusRes = {
    confirmation_code: '',
    status: '',
    issued_at: '',
    expires: ''
  }

  created (): void {
    this.loading = true

    const code = (this.$route.query.code || '') as string
    Api.account.getFbDataDeletionStatus(code)
      .then(data => {
        this.status = data
      })
      .catch(unexpectedExc)
      .finally(() => {
        this.loading = false
      })
  }

  getStatusText (status: string): string {
    const mapper: { [index: string]: string } = {
      pending: 'Đang xử lý',
      success: 'Thành công',
      fail: 'Thất bại'
    }
    return mapper[status] || ''
  }
}
</script>

<style scoped lang="scss">

</style>
