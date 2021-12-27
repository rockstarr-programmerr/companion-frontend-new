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
      Lịch sử giao dịch
    </h1>

    <v-skeleton-loader
      v-if="loading"
      type="paragraph"
    ></v-skeleton-loader>

    <div v-else-if="transactions.length === 0">
      Chưa có giao dịch nào.
    </div>

    <div v-else>
      <v-sheet
        color="#F4F5F7"
        class="pa-2 mt-2"
      >
        <v-list dense>
          <v-list-item
            v-for="(display, index) of displayedTransactions"
            :key="index"
          >
            <v-list-item-icon>
              <v-icon :color="display.color">
                mdi-{{ display.icon }}
              </v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>
                {{ display.text }}
              </v-list-item-title>
              <v-list-item-subtitle class="text-caption">
                {{ display.created }}
              </v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              {{ display.amount }}
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-sheet>

      <v-pagination
        v-model="page"
        :length="paginationLength"
        class="mt-4"
        @next="nextPage"
        @previous="previousPage"
      ></v-pagination>
    </div>
  </v-container>
</template>

<script lang="ts">
import { PaginatedRes } from '@/interfaces/api/common'
import { Event } from '@/interfaces/event'
import { Transaction } from '@/interfaces/transaction'
import { formatDatetime, unexpectedExc } from '@/utils'
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { mapState } from 'vuex'

@Component({
  computed: {
    ...mapState('transaction', [
      'transactions',
      'pagination'
    ])
  }
})
export default class TransactionHistory extends Vue {
  @Prop(Number) readonly pk!: number

  /**
   * Setup
   */
  loading = true
  event: Event | null = null
  transactions!: Transaction[]

  created (): void {
    this.setupTransactions()
  }

  setupTransactions (): void {
    this.$store.dispatch('transaction/getTransactions', {
      params: {
        event: this.pk
      }
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
    this.$store.dispatch('transaction/getTransactions', { params })
  }

  nextPage (): void {
    if (this.pagination.next !== null) {
      this.$store.dispatch('transaction/getTransactions', {
        url: this.pagination.next
      })
    }
  }

  previousPage (): void {
    if (this.pagination.previous !== null) {
      this.$store.dispatch('transaction/getTransactions', {
        url: this.pagination.previous
      })
    }
  }

  /**
   * Display transactions
   */
  get displayedTransactions (): {
    created: string;
    amount: string;
    description: string;
    icon: string;
    text: string;
    color: string;
  }[] {
    return this.transactions.map(transaction => {
      let icon = ''
      let text = ''
      let color = ''

      switch (transaction.transaction_type) {
        case 'user_to_user':
          icon = 'currency-usd'
          color = '#2A369C'
          // @ts-expect-error transaction of type "user_to_user" must have from_user and to_user
          text = `${transaction.from_user.nickname} trả ${transaction.to_user.nickname}`
          break;

        case 'user_to_fund':
          icon = 'piggy-bank'
          color = '#69AC61'
          // @ts-expect-error transaction of type "user_to_fund" must have from_user
          text = `${transaction.from_user.nickname} góp quỹ`
          break;

        case 'fund_to_user':
          icon = 'currency-usd'
          color = '#2A369C'
          // @ts-expect-error transaction of type "fund_to_user" must have to_user
          text = `${transaction.to_user.nickname} nhận của quỹ`
          break;

        case 'user_expense':
          icon = 'hand-coin'
          color = '#EB623D'
          // @ts-expect-error transaction of type "user_expense" must have from_user
          text = `${transaction.from_user.nickname} chi`
          break;

        case 'fund_expense':
          icon = 'hand-coin'
          color = '#EB623D'
          text = 'Quỹ chi trả'
          break;

        default:
          break;
      }

      const displayed = {
        created: formatDatetime(transaction.create_time),
        amount: transaction.amount.toLocaleString() + ' đ',
        description: transaction.description,
        icon,
        text,
        color
      }

      return displayed
    })
  }
}
</script>

<style scoped lang="scss">

</style>
