<template>
  <v-container>
    <div>
      <v-btn
        icon
        @click="$router.back()"
      >
        <v-icon>
          mdi-arrow-left-thin
        </v-icon>
      </v-btn>
    </div>

    <h1 class="text-h5 font-weight-bold mb-4">
      Chốt sổ (dự kiến)
    </h1>

    <v-skeleton-loader
      v-if="loading"
      type="paragraph"
    ></v-skeleton-loader>

    <div v-else-if="settlements.length === 0">
      Không có giao dịch nào cần thực hiện.
    </div>

    <div v-else>
      <div class="mb-4">
        Dưới đây là những giao dịch dự kiến để chốt sổ.
      </div>

      <v-sheet
        color="#F4F5F7"
        class="pa-2 mt-2"
      >
        <v-list>
          <v-list-item
            v-for="(settlement, index) of settlements"
            :key="index"
          >
            <v-list-item-content class="text-body-2">
              {{ settlement.from_user.nickname }} trả
              {{ settlement.to_user.nickname }}
              {{ settlement.amount.toLocaleString() }} đ
            </v-list-item-content>
          </v-list-item>
        </v-list>

        <v-pagination
          v-if="paginationLength > 1"
          v-model="page"
          :length="paginationLength"
          class="mt-4"
          @next="nextPage"
          @previous="previousPage"
        ></v-pagination>
      </v-sheet>

      <v-btn
        block
        tile
        depressed
        color="primary"
        class="mt-3"
        @click="settleConfirmDialog = true"
      >
        Chốt
      </v-btn>
    </div>

    <BaseDialogConfirm
      v-model="settleConfirmDialog"
      :loading="settling"
      @confirm="settle"
      @cancel="settleConfirmDialog = false"
    >
      <p>Sau khi chốt sổ, bạn sẽ không thể thêm giao dịch mới.</p>
    </BaseDialogConfirm>
  </v-container>
</template>

<script lang="ts">
import { Api } from '@/api'
import { PaginatedRes } from '@/interfaces/api/common'
import { Settlement } from '@/interfaces/event'
import { unexpectedExc } from '@/utils'
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { mapMutations } from 'vuex'
import BaseDialogConfirm from '@/components/BaseDialogConfirm.vue'

@Component({
  methods: {
    ...mapMutations('message', {
      showSuccess: 'SHOW_SUCCESS'
    })
  },
  components: {
    BaseDialogConfirm
  }
})
export default class SettlePreview extends Vue {
  @Prop(Number) readonly pk!: number

  /**
   * Setup
   */
  loading = true
  settlements: Settlement[] = []

  created (): void {
    this.setupSettlements()
  }

  setupSettlements (): void {
    Api.event.getPreviewSettlements(this.pk)
      .then(data => {
        this.settlements = data.results || []
        delete data.results
        this.pagination = data
      })
      .catch(unexpectedExc)
      .finally(() => {
        this.loading = false
      })
  }

  /**
   * Pagination
   */
  page = 1
  pagination!: PaginatedRes
  itemsPerPage = 10

  get paginationLength (): number {
    return Math.ceil(this.pagination.count / this.itemsPerPage)
  }

  @Watch('page')
  onPageChange (pageNum: number): void {
    const offset = (pageNum - 1) * this.itemsPerPage
    const params = {
      event: this.pk,
      limit: this.itemsPerPage,
      offset
    }

    this.loading = true
    Api.event.getPreviewSettlements(this.pk, params)
      .catch(unexpectedExc)
      .finally(() => {
        this.loading = false
      })
  }

  nextPage (): void {
    if (this.pagination.next !== null) {
      this.loading = true
      Vue.axios.get(this.pagination.next)
        .catch(unexpectedExc)
        .finally(() => {
          this.loading = false
        })
    }
  }

  previousPage (): void {
    if (this.pagination.previous !== null) {
      this.loading = true
      Vue.axios.get(this.pagination.previous)
        .catch(unexpectedExc)
        .finally(() => {
          this.loading = false
        })
    }
  }

  /**
   * Settle
   */
  settleConfirmDialog = false
  settling = false
  showSuccess!: CallableFunction

  settle (): void {
    if (this.settling) return
    this.settling = true

    Api.event.settle(this.pk)
      .then(() => {
        this.showSuccess('Chốt sổ thành công.')
        this.$router.push({
          name: 'EventDetail',
          params: {
            pk: this.pk.toString()
          }
        })
      })
      .catch(unexpectedExc)
      .finally(() => {
        this.settling = false
      })
  }
}
</script>

<style scoped lang="scss">

</style>
