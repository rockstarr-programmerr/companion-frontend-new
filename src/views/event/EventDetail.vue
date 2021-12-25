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
  </v-container>
</template>

<script lang="ts">
import { Event, EventChartInfo } from '@/interfaces/event'
import { unexpectedExc } from '@/utils'
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
      this.chartInfo.total_fund !== 0 &&
      this.chartInfo.total_expense !== 0
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

    return percentage * 100
  }

  get expenseChartBarHeight (): number {
    if (this.chartInfo === null) return 0

    let percentage = this.chartInfo.total_expense / this.chartInfo.total_fund
    percentage = Math.min(percentage, 1)

    return percentage * 100
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
</style>
