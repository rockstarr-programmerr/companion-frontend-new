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
      type="card"
    ></v-skeleton-loader>

    <div v-else-if="event !== null">
      <v-row>
        <v-col cols="10">
          <h1 class="text-h5 font-weight-bold">
            {{ event.name }}
          </h1>
          <div class="text-caption">
            {{ formatDatetime(event.create_time, false) }}
          </div>
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
                @click="item.onClick"
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
        <!-- Hiển thị khi event đã chốt sổ -->
        <v-card
          v-if="event.is_settled"
          flat
          class="info-card mb-2"
        >
          <v-card-title>
            Chuyến đi đã chốt sổ
          </v-card-title>
          <v-card-text>
            <v-skeleton-loader
              v-if="loadingSettlements"
              type="paragraph"
            ></v-skeleton-loader>

            <div v-else-if="settlements.length === 0">
              Không có giao dịch nào.
            </div>

            <v-list v-else>
              <v-list-item
                v-for="(settlement, index) of settlements"
                :key="index"
                class="px-0"
              >
                <v-list-item-content>
                  {{ settlement.from_user.nickname }} trả
                  {{ settlement.to_user.nickname }}
                  <strong>{{ settlement.amount.toLocaleString() }} đ</strong>
                </v-list-item-content>
                <v-list-item-action>
                  <div
                    @click.capture.stop="
                      settlement.is_paid ?
                      prepareUnpaySettle(settlement) :
                      preparePaySettle(settlement)
                    "
                  >
                    <v-checkbox :input-value="settlement.is_paid"></v-checkbox>
                  </div>
                </v-list-item-action>
              </v-list-item>
            </v-list>

            <v-pagination
              v-if="settlementsPaginationLength > 1"
              v-model="settlementPage"
              :length="settlementsPaginationLength"
              class="mt-4"
              @next="nextPageSettlement"
              @previous="previousPageSettlement"
            ></v-pagination>
          </v-card-text>
        </v-card>

        <!-- Tình hình thu chi -->
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

        <!-- Giao dịch gần đây -->
        <v-card
          flat
          class="info-card mt-2"
        >
          <v-card-title>
            <v-row justify="space-between">
              <v-col cols="auto">
                Gần đây
              </v-col>
              <v-col cols="auto">
                <router-link
                  :to="{
                    name: 'TransactionHistory'
                  }"
                  class="text-body-2 font-weight-bold no-decoration"
                >
                  Chi tiết
                  <v-icon>
                    mdi-chevron-right
                  </v-icon>
                </router-link>
              </v-col>
            </v-row>
          </v-card-title>
          <v-card-text>
            <v-skeleton-loader
              v-if="loadingRecentTransactions"
              type="paragraph"
            ></v-skeleton-loader>
            <div v-else-if="displayedRecentTransactions.length === 0">
              Chưa có giao dịch nào.
            </div>
            <v-list
              v-else
              dense
            >
              <v-list-item
                v-for="(display, index) of displayedRecentTransactions"
                :key="index"
                class="recent-transactions-item"
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
                    {{ display.created }} <br>
                    {{ display.description }}
                  </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  {{ display.amount }}
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>

        <!-- Hiển thị khi event chưa chốt sổ -->
        <v-btn
          v-if="!event.is_settled"
          block
          depressed
          color="white"
          class="mt-2"
          large
          :to="{
            name: 'SettlePreview',
            params: {
              pk: event.pk.toString()
            }
          }"
        >
          <v-icon left>
            mdi-calculator
          </v-icon>
          Chốt sổ
        </v-btn>
      </v-sheet>
    </div>

    <!-- Fab and dialogs -->
    <v-menu
      v-if="event !== null && !event.is_settled"
      v-model="fabOpen"
      top
      nudge-top="60"
      content-class="fab-menu"
      :transition="fabOpen ? 'scroll-y-reverse-transition' : 'scroll-y-transition'"
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
            <v-list-item-title class="elevation-4">
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
      v-if="event !== null && !event.is_settled"
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
      v-if="event !== null && !event.is_settled"
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
      v-if="event !== null && !event.is_settled"
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

    <!-- Settlement confirm dialog -->
    <BaseDialogConfirm
      v-model="paySettleConfirmDialog"
      :loading="updatingSettlement"
      @confirm="paySettlement"
      @cancel="paySettleConfirmDialog = false"
    >
      <div v-if="settlementToUpdate !== null">
        <strong>{{ settlementToUpdate.from_user.nickname }}</strong>
        đã thanh toán cho
        <strong>{{ settlementToUpdate.to_user.nickname }}</strong>
        số tiền
        <strong>{{ settlementToUpdate.amount.toLocaleString() }} đ</strong>
      </div>
    </BaseDialogConfirm>

    <BaseDialogConfirm
      v-model="unpaySettleConfirmDialog"
      :loading="updatingSettlement"
      @confirm="unpaySettlement"
      @cancel="unpaySettleConfirmDialog = false"
    >
      <div v-if="settlementToUpdate !== null">
        <strong>{{ settlementToUpdate.from_user.nickname }}</strong>
        CHƯA thanh toán cho
        <strong>{{ settlementToUpdate.to_user.nickname }}</strong>
        số tiền
        <strong>{{ settlementToUpdate.amount.toLocaleString() }} đ</strong>
      </div>
    </BaseDialogConfirm>
  </v-container>
</template>

<script lang="ts">
import { PaginatedRes } from '@/interfaces/api/common'
import { SettlementDetailRes, SettlementListRes } from '@/interfaces/api/settlement'
import { TransactionCreateReq } from '@/interfaces/api/transaction'
import { Event, EventChartInfo } from '@/interfaces/event'
import { Transaction } from '@/interfaces/transaction'
import { User } from '@/interfaces/user'
import { formatDatetime, unexpectedExc } from '@/utils'
import { assertErrCode, status } from '@/utils/status-codes'
import { AxiosRequestConfig } from 'axios'
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { mapMutations, mapState } from 'vuex'
import BaseDialogConfirm from '@/components/BaseDialogConfirm.vue'

@Component({
  computed: {
    ...mapState('event', {
      event: 'currentEvent'
    })
  },
  methods: {
    ...mapMutations('message', {
      showSuccess: 'SHOW_SUCCESS'
    })
  },
  components: {
    BaseDialogConfirm
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
  formatDatetime = formatDatetime

  created (): void {
    this.setupEvent()
  }

  setupEvent (): void {
    this.$store.dispatch('event/getEventDetail', this.pk)
      .then(this.setupEventDetail)
      .catch(unexpectedExc)
      .finally(() => {
        this.loading = false
      })
  }

  setupEventDetail (): void {
    this.setupChartInfo()
    this.setupRecentTransactions()

    if (this.event.is_settled) {
      this.setupSettlements()
    }
  }

  get membersCount (): number {
    return this.event.members.length
  }

  /**
   * Menu items (three dots vertical)
   */
  get menuItems (): {
    icon: string;
    text: string;
    onClick: CallableFunction;
  }[] {
    const items = [
      {
        icon: 'pencil-outline',
        text: 'Chỉnh sửa',
        onClick: () => {
          this.$router.push({
            name: 'EventUpdate',
            params: {
              pk: this.event.pk.toString()
            }
          })
        }
      },
      {
        icon: 'share-variant-outline',
        text: 'Chia sẻ',
        onClick: () => {
          // TODO
        }
      },
      {
        icon: 'account-multiple-outline',
        text: 'Thành viên',
        onClick: () => {
          this.$router.push({
            name: 'EventMembers',
            params: {
              pk: this.event.pk.toString()
            }
          })
        }
      }
    ]

    if (!this.event.is_settled) {
      items.push({
        icon: 'calculator',
        text: 'Chốt sổ',
        onClick: () => {
          this.$router.push({
            name: 'SettlePreview',
            params: {
              pk: this.event.pk.toString()
            }
          })
        }
      })
    }

    return items
  }

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
        this.setupEventDetail()
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

  /**
   * Recent transactions
   */
  loadingRecentTransactions = false
  recentTransactions: Transaction[] = []

  setupRecentTransactions (): void {
    this.loadingRecentTransactions = true

    Vue.axios.get(this.event.transactions_url, {
      params: {
        limit: 5
      }
    })
      .then(res => {
        this.recentTransactions = res.data.results
      })
      .catch(unexpectedExc)
      .finally(() => {
        this.loadingRecentTransactions = false
      })
  }

  get displayedRecentTransactions (): {
    created: string;
    amount: string;
    description: string;
    icon: string;
    text: string;
    color: string;
  }[] {
    return this.recentTransactions.map(transaction => {
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

  /**
   * Chốt sổ
   */
  settlements: SettlementDetailRes[] = []
  loadingSettlements = false
  settlementsPagination: PaginatedRes | null = null
  itemsPerPage = 10
  settlementPage = 1

  get settlementsPaginationLength (): number {
    if (this.settlementsPagination !== null) {
      return Math.ceil(this.settlementsPagination.count / this.itemsPerPage)
    } else {
      return 0
    }
  }

  @Watch('settlementPage')
  onSettlementPageChange (pageNum: number): void {
    const offset = (pageNum - 1) * this.itemsPerPage
    const params = {
      limit: this.itemsPerPage,
      offset
    }
    this.setupSettlements(params)
  }

  nextPageSettlement (): void {
    if (this.settlementsPagination !== null && this.settlementsPagination.next !== null) {
      this.loading = true
      Vue.axios.get(this.settlementsPagination.next)
        .catch(unexpectedExc)
        .finally(() => {
          this.loading = false
        })
    }
  }

  previousPageSettlement (): void {
    if (this.settlementsPagination !== null && this.settlementsPagination.previous !== null) {
      this.loading = true
      Vue.axios.get(this.settlementsPagination.previous)
        .catch(unexpectedExc)
        .finally(() => {
          this.loading = false
        })
    }
  }

  setupSettlements (params?: AxiosRequestConfig['params']): void {
    this.loadingSettlements = true

    Vue.axios.get(this.event.settlements_url, { params })
      .then(res => {
        const data = (res.data as SettlementListRes)
        this.settlements = data.results || []
        delete data.results
        this.settlementsPagination = data
      })
      .catch(unexpectedExc)
      .finally(() => {
        this.loadingSettlements = false
      })
  }

  settlementToUpdate: SettlementDetailRes | null = null
  updatingSettlement = false
  paySettleConfirmDialog = false
  unpaySettleConfirmDialog = false
  showSuccess!: CallableFunction

  preparePaySettle (settlement: SettlementDetailRes): void {
    this.settlementToUpdate = settlement
    this.paySettleConfirmDialog = true
  }

  prepareUnpaySettle (settlement: SettlementDetailRes): void {
    this.settlementToUpdate = settlement
    this.unpaySettleConfirmDialog = true
  }

  paySettlement (): void {
    this.updateSettlement(true)
  }

  unpaySettlement (): void {
    this.updateSettlement(false)
  }

  updateSettlement (isPaid: boolean): void {
    if (this.updatingSettlement || this.settlementToUpdate === null) return
    this.updatingSettlement = true

    Vue.axios.patch(this.settlementToUpdate.url, {
      is_paid: isPaid
    })
      .then(() => {
        this.showSuccess('Cập nhật thành công.')
        this.paySettleConfirmDialog = false
        this.unpaySettleConfirmDialog = false
        // @ts-expect-error `settlementToUpdate` can't be null here
        const settlement = this.settlements.find(s => s.pk === this.settlementToUpdate.pk)
        if (settlement !== undefined) {
          settlement.is_paid = isPaid
        }
      })
      .catch(unexpectedExc)
      .finally(() => {
        this.updatingSettlement = false
      })
  }
}
</script>

<style scoped lang="scss">
.info-card ::v-deep .v-card__text {
  color: black;
}

$chart-card-height: 170px;

.right-col,
.left-col {
  height: $chart-card-height;
}

.left-col .row {
  height: 100%;
}

.right-col-bottom {
  margin-top: $chart-card-height - 120px;
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

  .v-list {
    background-color: transparent;
  }
}

.fab-card {
  opacity: 0.97;
}

.no-decoration {
  text-decoration: none;
}

.recent-transactions-item {
  padding: 0;

  [class^="v-list-item__"] {
    white-space: normal;
  }

  .v-list-item__action {
    font-size: 13px;
    font-weight: bold;
    align-self: start;
    margin-top: 0;
    margin-bottom: 0;
    padding: 5px 0;
  }
}
</style>
