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

    <v-skeleton-loader
      v-if="loading"
      type="card@2"
    ></v-skeleton-loader>

    <div v-else-if="event !== null">
      <v-row>
        <v-col cols="10">
          <h1 class="text-h5 font-weight-bold">
            {{ event.name }}
          </h1>
        </v-col>
        <v-col cols="2">
          <v-menu
            left
            nudge-left="42"
          >
            <template #activator="{ on, attrs }">
              <v-btn
                icon
                v-on="on"
                v-bind="attrs"
              >
                <v-icon>
                  mdi-dots-vertical
                </v-icon>
              </v-btn>
            </template>
            <v-list
              dense
            >
              <v-list-item
                v-for="item of menuItems"
                :key="item.text"
              >
                <v-list-item-icon>
                  <v-icon>
                    mdi-{{ item.icon }}
                  </v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ item.text }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-col>
      </v-row>

      <v-sheet
        color="#F4F5F7"
        class="pa-2 mt-2"
      >
        <v-card
          flat
          class="info-card"
        >
          <v-card-title>
            Tình hình thu chi
          </v-card-title>

          <v-card-text>
            <v-skeleton-loader
              v-if="loadingChartInfo"
              type="card"
            ></v-skeleton-loader>

            <v-row v-else-if="chartInfo !== null">
              <v-col
                v-if="chartHasData"
                cols="3"
                class="left-col"
              >
                <v-row no-gutters>
                  <v-col cols="6" class="px-1">
                    <div class="fund-bar">
                      <div
                        :style="{
                          backgroundColor: 'white',
                          height: (100 - fundChartBarHeight) + '%'
                        }"
                      ></div>
                    </div>
                  </v-col>
                  <v-col cols="6" class="px-1">
                    <div class="expense-bar">
                      <div
                        :style="{
                          backgroundColor: 'white',
                          height: (100 - expenseChartBarHeight) + '%'
                        }"
                      ></div>
                    </div>
                  </v-col>
                </v-row>
              </v-col>

              <v-col
                :cols="chartHasData ? 9 : 12"
                class="right-col"
              >
                <div class="right-col-top">
                  <v-row
                    no-gutters
                    justify="space-between"
                  >
                    <v-col cols="auto">
                      <v-icon>
                        mdi-circle-small
                      </v-icon>
                      Quỹ
                    </v-col>
                    <v-col cols="auto green--text font-weight-bold">
                      {{ chartInfo.total_fund.toLocaleString() }} đ
                    </v-col>
                  </v-row>

                  <v-row
                    no-gutters
                    justify="space-between"
                  >
                    <v-col cols="auto">
                      <v-icon>
                        mdi-circle-small
                      </v-icon>
                      Chi
                    </v-col>
                    <v-col cols="auto red--text font-weight-bold">
                      {{ chartInfo.total_expense.toLocaleString() }} đ
                    </v-col>
                  </v-row>

                  <v-divider class="my-1"></v-divider>

                  <div
                    class="text-right font-weight-bold"
                    :class="budgetBalance >= 0 ? 'green--text' : 'red--text'"
                  >
                    {{ budgetBalance.toLocaleString() }} đ
                  </div>
                </div>

                <div class="right-col-bottom">
                  <v-row
                    no-gutters
                    justify="space-between"
                  >
                    <v-col cols="auto">
                      Trung bình chi
                    </v-col>
                    <v-col cols="auto font-weight-bold">
                      {{ averageExpense.toLocaleString() }} đ
                    </v-col>
                  </v-row>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-sheet>
    </div>

    <v-menu
      v-model="fabOpen"
      top
      nudge-top="60"
      content-class="fab-menu"
    >
      <template #activator="{ on, attrs }">
        <v-btn
          fab
          dark
          bottom
          right
          fixed
          color="primary"
          v-on="on"
          v-bind="attrs"
        >
          <v-icon>
            {{ fabOpen ? 'mdi-close' : 'mdi-plus'}}
          </v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item
          v-for="item of fabItems"
          :key="item.text"
          @click="onClickFabItem(item.dialogName)"
        >
          <v-list-item-content>
            <v-list-item-title>
              <v-sheet
                :color="item.color"
                rounded
                dark
                class="py-2 px-4"
              >
                {{ item.text }}
              </v-sheet>
            </v-list-item-title>
          </v-list-item-content>
          <v-list-item-icon>
            <v-btn
              fab
              small
              dark
              :color="item.color"
            >
              <v-icon>
                mdi-{{ item.icon }}
              </v-icon>
            </v-btn>
          </v-list-item-icon>
        </v-list-item>
      </v-list>
    </v-menu>

    <v-dialog
      v-if="event !== null"
      v-model="fundDialog"
      fullscreen
    >
      <v-card class="fab-card">
        <v-card-title>
          Thêm khoản góp
        </v-card-title>
        <v-card-text>
          <v-form>
            <v-select
              v-model="fundFrom"
              :items="event.members"
              item-text="nickname"
              item-value="url"
              label="Người góp *"
              outlined
              :error-messages="fundFromErrs"
              :error-count="fundFromErrs.length"
            ></v-select>
            <v-text-field
              v-model="fundAmount"
              label="Số tiền *"
              outlined
              :error-messages="fundAmountErrs"
              :error-count="fundAmountErrs.length"
            ></v-text-field>
            <v-textarea
              v-model="fundDescription"
              label="Nội dung"
              outlined
              :error-messages="fundDescriptionErrs"
              :error-count="fundDescriptionErrs.length"
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-row>
            <v-col cols="6">
              <v-btn
                outlined
                block
                depressed
                @click="fundDialog = false"
              >
                Hủy
              </v-btn>
            </v-col>
            <v-col cols="6">
              <v-btn
                color="primary"
                block
                depressed
                :loading="addingToFund"
                :disabled="!enableAddFundBtn"
                @click="addToFund"
              >
                OK
              </v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-if="event !== null"
      v-model="expenseDialog"
      fullscreen
    >
      <v-card class="fab-card">
        <v-card-title>
          Thêm khoản chi
        </v-card-title>
        <v-card-text>
          <v-form>
            <v-checkbox
              v-model="expenseFromFund"
              label="Trích quỹ"
            ></v-checkbox>
            <v-select
              v-if="!expenseFromFund"
              v-model="expenseFrom"
              :items="event.members"
              item-text="nickname"
              item-value="url"
              label="Người chi *"
              outlined
              :error-messages="expenseFromErrs"
              :error-count="expenseFromErrs.length"
            ></v-select>
            <v-text-field
              v-model="expenseAmount"
              label="Số tiền *"
              outlined
              :error-messages="expenseAmountErrs"
              :error-count="expenseAmountErrs.length"
            ></v-text-field>
            <v-textarea
              v-model="expenseDescription"
              label="Nội dung"
              outlined
              :error-messages="expenseDescriptionErrs"
              :error-count="expenseDescriptionErrs.length"
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-row>
            <v-col cols="6">
              <v-btn
                outlined
                block
                depressed
                @click="expenseDialog = false"
              >
                Hủy
              </v-btn>
            </v-col>
            <v-col cols="6">
              <v-btn
                color="primary"
                block
                depressed
                :loading="addingExpense"
                :disabled="!enableAddExpenseBtn"
                @click="addExpense"
              >
                OK
              </v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-if="event !== null"
      v-model="transferDialog"
      fullscreen
    >
      <v-card class="fab-card">
        <v-card-title>
          Thêm chuyển khoản
        </v-card-title>
        <v-card-text>
          <v-form>
            <v-select
              v-model="transferFrom"
              :items="transferFromItems"
              item-text="nickname"
              item-value="url"
              label="Người chuyển *"
              outlined
              :error-messages="transferFromErrs"
              :error-count="transferFromErrs.length"
              :hint="transferFrom === 'special_value_for_fund_to_user' ? 'Chuyển từ quỹ đến người nhận.' : ''"
              :persistent-hint="transferFrom === 'special_value_for_fund_to_user'"
            >
              <template #item="{ item }">
                <span v-if="item.url === 'special_value_for_fund_to_user'">
                  <v-chip color="primary">
                    {{ item.nickname }}
                  </v-chip>
                </span>
                <span v-else>
                  {{ item.nickname }}
                </span>
              </template>
              <template #selection="{ item }">
                <span v-if="item.url === 'special_value_for_fund_to_user'">
                  <v-chip color="primary">
                    {{ item.nickname }}
                  </v-chip>
                </span>
                <span v-else>
                  {{ item.nickname }}
                </span>
              </template>
            </v-select>
            <v-select
              v-model="transferTo"
              :items="transferToItems"
              item-text="nickname"
              item-value="url"
              label="Người nhận *"
              outlined
              :error-messages="transferToErrs"
              :error-count="transferToErrs.length"
            ></v-select>
            <v-text-field
              v-model="transferAmount"
              label="Số tiền *"
              outlined
              :error-messages="transferAmountErrs"
              :error-count="transferAmountErrs.length"
            ></v-text-field>
            <v-textarea
              v-model="transferDescription"
              label="Nội dung"
              outlined
              :error-messages="transferDescriptionErrs"
              :error-count="transferDescriptionErrs.length"
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-row>
            <v-col cols="6">
              <v-btn
                outlined
                block
                depressed
                @click="transferDialog = false"
              >
                Hủy
              </v-btn>
            </v-col>
            <v-col cols="6">
              <v-btn
                color="primary"
                block
                depressed
                :loading="addingTransfer"
                :disabled="!enableAddTransferBtn"
                @click="addTransfer"
              >
                OK
              </v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import { TransactionCreateReq } from '@/interfaces/api/transaction'
import { Event, EventChartInfo } from '@/interfaces/event'
import { User } from '@/interfaces/user'
import { unexpectedExc } from '@/utils'
import { assertErrCode, status } from '@/utils/status-codes'
import { Vue, Component, Prop } from 'vue-property-decorator'
import { mapState } from 'vuex'

@Component({
  computed: {
    ...mapState('event', {
      event: 'currentEvent'
    })
  }
})
export default class EventDetail extends Vue {
  // eslint-disable-next-line no-undef
  [index: string]: unknown

  @Prop(Number) readonly pk!: number

  /**
   * Setup
   */
  event!: Event
  loading = true

  created (): void {
    this.setupEvent()
  }

  setupEvent (): void {
    this.$store.dispatch('event/getEventDetail', this.pk)
      .then(() => {
        this.setupChartInfo()
      })
      .catch(unexpectedExc)
      .finally(() => {
        this.loading = false
      })
  }

  get membersCount (): number {
    return this.event.members.length
  }

  /**
   * Menu items (three dots vertical)
   */
  menuItems = [
    {
      icon: 'pencil-outline',
      text: 'Chỉnh sửa'
    },
    {
      icon: 'share-variant-outline',
      text: 'Chia sẻ'
    },
    {
      icon: 'calculator',
      text: 'Chốt sổ'
    }
  ]

  /**
   * Chart info (Tình hình thu chi)
   */
  chartInfo: EventChartInfo | null = null
  loadingChartInfo = false

  setupChartInfo (): void {
    this.loadingChartInfo = true

    Vue.axios.get(this.event.extra_action_urls.chart_info)
      .then(res => {
        this.chartInfo = res.data
      })
      .catch(unexpectedExc)
      .finally(() => {
        this.loadingChartInfo = false
      })
  }

  get chartHasData (): boolean {
    return (
      this.chartInfo !== null &&
      (
        this.chartInfo.total_fund !== 0 ||
        this.chartInfo.total_expense !== 0
      )
    )
  }

  get budgetBalance (): number {
    if (this.chartInfo === null) return 0
    return this.chartInfo.total_fund - this.chartInfo.total_expense
  }

  get averageExpense (): number {
    if (this.chartInfo === null) return 0
    return Math.floor(
      this.chartInfo.total_expense / this.membersCount
    )
  }

  get fundChartBarHeight (): number {
    if (this.chartInfo === null) return 0

    let percentage = this.chartInfo.total_fund / this.chartInfo.total_expense
    percentage = Math.min(percentage, 1)
    percentage = Math.max(percentage, 0.01)

    return percentage * 100
  }

  get expenseChartBarHeight (): number {
    if (this.chartInfo === null) return 0

    let percentage = this.chartInfo.total_expense / this.chartInfo.total_fund
    percentage = Math.min(percentage, 1)
    percentage = Math.max(percentage, 0.01)

    return percentage * 100
  }

  /**
   * Floating action button
   */
  fabOpen = false

  fabItems = [
    {
      icon: 'currency-usd',
      text: 'Thêm chuyển khoản',
      color: '#2A369C',
      dialogName: 'transferDialog'
    },
    {
      icon: 'piggy-bank',
      text: 'Thêm khoản góp',
      color: '#69AC61',
      dialogName: 'fundDialog'
    },
    {
      icon: 'hand-coin',
      text: 'Thêm khoản chi',
      color: '#EB623D',
      dialogName: 'expenseDialog'
    }
  ]

  onClickFabItem (dialogName: string): void {
    this[dialogName] = true
  }

  /**
   * Thêm khoản góp
   */
  fundDialog = false
  addingToFund = false

  fundFrom: User['url'] | null = null
  fundAmount: number | null = null
  fundDescription = ''

  fundFromErrs: string[] = []
  fundAmountErrs: string[] = []
  fundDescriptionErrs: string[] = []

  get enableAddFundBtn (): boolean {
    return this.fundFrom !== null && this.fundAmount !== null
  }

  addToFund (): void {
    const payload: TransactionCreateReq = {
      event: this.event.url,
      transaction_type: 'user_to_fund',
      from_user: this.fundFrom,
      to_user: null,
      amount: this.fundAmount,
      description: this.fundDescription
    }

    const successHandler = () => {
      this.fundDialog = false
      this.fundFrom = null
      // this.fundAmount = null // NOTE: don't reset `fundAmount` for convenience: most of the time every one pay to fund the same amount
      this.fundDescription = ''
      this.fundFromErrs = []
      this.fundAmountErrs = []
      this.fundDescriptionErrs = []
    }

    // @ts-expect-error don't care
    const badRequestHandler = err => {
      const data = err.response.data
      Object.entries(data).forEach(([field, errMsgs]) => {
        let attr = ''
        if (field === 'from_user') attr = 'fundFromErrs'
        else if (field === 'amount') attr = 'fundAmountErrs'
        else if (field === 'description') attr = 'fundDescriptionErrs'
        if (attr !== '') {
          this[attr] = errMsgs
        }
      })
    }

    this.addTransaction('addingToFund', payload, successHandler, badRequestHandler)
  }

  addTransaction (
    loadingAttr: string,
    payload: TransactionCreateReq,
    successHandler: CallableFunction,
    badRequestHandler: CallableFunction
  ): void {
    if (this[loadingAttr]) return
    this[loadingAttr] = true

    this.$store.dispatch('transaction/createTransaction', payload)
      .then(() => {
        successHandler()
        this.setupChartInfo()
      })
      .catch(err => {
        if (assertErrCode(err, status.HTTP_400_BAD_REQUEST)) {
          badRequestHandler(err)
        } else {
          unexpectedExc(err)
        }
      })
      .finally(() => {
        this[loadingAttr] = false
      })
  }

  /**
   * Thêm khoản chi
   */
  expenseDialog = false
  addingExpense = false
  expenseFromFund = true

  expenseFrom: User['url'] | null = null
  expenseAmount: number | null = null
  expenseDescription = ''

  expenseFromErrs: string[] = []
  expenseAmountErrs: string[] = []
  expenseDescriptionErrs: string[] = []

  get enableAddExpenseBtn (): boolean {
    return (
      this.expenseFromFund || this.expenseFrom !== null
    ) && this.expenseAmount != null
  }

  addExpense (): void {
    const transactionType = this.expenseFromFund ? 'fund_expense' : 'user_expense'

    const payload: TransactionCreateReq = {
      event: this.event.url,
      transaction_type: transactionType,
      from_user: transactionType === 'fund_expense' ? null : this.expenseFrom,
      to_user: null,
      amount: this.expenseAmount,
      description: this.expenseDescription
    }

    const successHandler = () => {
      this.expenseDialog = false
      this.expenseFrom = null
      this.expenseAmount = null
      this.expenseDescription = ''
      this.expenseFromErrs = []
      this.expenseAmountErrs = []
      this.expenseDescriptionErrs = []
    }

    // @ts-expect-error don't care
    const badRequestHandler = err => {
      const data = err.response.data
      Object.entries(data).forEach(([field, errMsgs]) => {
        let attr = ''
        if (field === 'from_user') attr = 'expenseFromErrs'
        else if (field === 'amount') attr = 'expenseAmountErrs'
        else if (field === 'description') attr = 'expenseDescriptionErrs'
        if (attr !== '') {
          this[attr] = errMsgs
        }
      })
    }

    this.addTransaction('addingExpense', payload, successHandler, badRequestHandler)
  }

  /**
   * Thêm chuyển khoản
   */
  transferDialog = false
  addingTransfer = false

  transferFrom: User['url'] | null = null
  transferTo: User['url'] | null = null
  transferAmount: number | null = null
  transferDescription = ''

  transferFromErrs: string[] = []
  transferToErrs: string[] = []
  transferAmountErrs: string[] = []
  transferDescriptionErrs: string[] = []

  get transferFromItems (): User[] {
    const items = this.event.members.filter(member => this.transferTo === null || this.transferTo !== member.url)
    const specialItem = {
      url: 'special_value_for_fund_to_user',
      nickname: 'Quỹ'
    }
    // @ts-expect-error `specialItem` don't have all attr of `User` but that's fine, `url` and `nickname` is all we need
    items.push(specialItem)
    return items
  }

  get transferToItems (): User[] {
    return this.event.members.filter(member => this.transferFrom === null || this.transferFrom !== member.url)
  }

  get enableAddTransferBtn (): boolean {
    return (
      this.transferFrom !== null &&
      this.transferTo !== null &&
      this.transferAmount !== null
    )
  }

  addTransfer (): void {
    const transactionType = this.transferFrom === 'special_value_for_fund_to_user' ? 'fund_to_user' : 'user_to_user'

    const payload: TransactionCreateReq = {
      event: this.event.url,
      transaction_type: transactionType,
      from_user: transactionType === 'fund_to_user' ? null : this.transferFrom,
      to_user: this.transferTo,
      amount: this.transferAmount,
      description: this.transferDescription
    }

    const successHandler = () => {
      this.transferDialog = false
      this.transferFrom = null
      this.transferTo = null
      this.transferAmount = null
      this.transferDescription = ''
      this.transferFromErrs = []
      this.transferToErrs = []
      this.transferAmountErrs = []
      this.transferDescriptionErrs = []
    }

    // @ts-expect-error don't care
    const badRequestHandler = err => {
      const data = err.response.data
      Object.entries(data).forEach(([field, errMsgs]) => {
        let attr = ''
        if (field === 'from_user') attr = 'transferFromErrs'
        if (field === 'to_user') attr = 'transferToErrs'
        else if (field === 'amount') attr = 'transferAmountErrs'
        else if (field === 'description') attr = 'transferDescriptionErrs'
        if (attr !== '') {
          this[attr] = errMsgs
        }
      })
    }

    this.addTransaction('addingTransfer', payload, successHandler, badRequestHandler)
  }
}
</script>

<style scoped lang="scss">
.info-card ::v-deep .v-card__text {
  color: black;
}

.right-col,
.left-col {
  height: 230px;
}

.left-col .row {
  height: 100%;
}

.right-col-bottom {
  margin-top: 110px;
}

.fund-bar {
  background-color: green;
  height: 100%;
}

.expense-bar {
  background-color: red;
  height: 100%;
}

.fab-menu {
  box-shadow: unset;
}

.fab-card {
  opacity: 0.97;
}
</style>
