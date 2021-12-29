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

    <h1 class="text-h5 font-weight-bold mb-6">
      Chia sẻ chuyến đi
    </h1>

    <v-skeleton-loader
      v-if="loading"
      type="card"
    ></v-skeleton-loader>

    <div v-else-if="event !== null">
      <div>
        <h2 class="text-center text-body-1 font-weight-bold">
          Sử dụng QR code
        </h2>
        <v-img
          :src="event.qr_code"
          max-width="250"
          max-height="250"
          class="mx-auto"
        >
          <template #placeholder>
            <v-row
              class="fill-height ma-0"
              justify="center"
              align="center"
            >
              <v-progress-circular
                indeterminate
                color="primary"
              ></v-progress-circular>
            </v-row>
          </template>
        </v-img>
      </div>

      <div class="mt-4">
        <h2 class="text-center text-body-1 font-weight-bold">
          Hoặc liên kết
        </h2>

        <div
          v-ripple
          class="mt-4"
          @click="copyJoinLink"
        >
          <v-text-field
            :value="joinWithQrUrl"
            outlined
            disabled
            append-icon="mdi-clipboard-multiple-outline"
            class="join-with-qr"
            hide-details
          ></v-text-field>
        </div>
      </div>

      <div class="mt-8 font-italic">
        <p>
          Người dùng quét mã QR hoặc bấm vào liên kết trên sẽ tự động được thêm vào chuyến đi của bạn.
        </p>
        <p>
          Bạn có thể vô hiệu hoá liên kết đã chia sẻ bằng cách
          <a
            href="#"
            @click="resetQrCode"
            class="font-weight-bold"
          >
            làm mới liên kết.
          </a>
          <v-progress-circular
            v-if="resetting"
            indeterminate
            color="primary"
            width="2"
            size="18"
            class="ml-2"
          ></v-progress-circular>
        </p>
      </div>
    </div>
  </v-container>
</template>

<script lang="ts">
import { Event } from '@/interfaces/event'
import { unexpectedExc } from '@/utils'
import { Vue, Component, Prop } from 'vue-property-decorator'
import { mapState, mapMutations } from 'vuex'

@Component({
  computed: {
    ...mapState('event', {
      event: 'currentEvent'
    })
  },
  methods: {
    ...mapMutations('message', {
      showSucces: 'SHOW_SUCCESS'
    })
  }
})
export default class EventShare extends Vue {
  // eslint-disable-next-line no-undef
  [index: string]: unknown

  @Prop(Number) readonly pk!: number

  /**
   * Setup
   */
  loading = true
  event!: Event
  showSucces!: CallableFunction

  created (): void {
    this.setupEvent()
  }

  setupEvent (): void {
    this.$store.dispatch('event/getEventDetail', this.pk)
      .catch(unexpectedExc)
      .finally(() => {
        this.loading = false
      })
  }

  get joinWithQrUrl (): string {
    if (this.event === null) return ''
    const host = process.env.VUE_APP_WEB_ROOT
    return `${host}/qr/${this.event.join_token}`
  }

  /**
   * Join with link
   */
  copyJoinLink (): void {
    navigator.clipboard.writeText(this.joinWithQrUrl)
    this.showSucces('Link copied.')
  }

  /**
   * Reset QR code
   */
  resetting = false

  resetQrCode (): void {
    if (this.resetting) return
    this.resetting = true

    this.$store.dispatch('event/resetQrCode')
      .then(() => {
        this.showSucces('Làm mới liên kết thành công.')
      })
      .catch(unexpectedExc)
      .finally(() => {
        this.resetting = false
      })
  }
}
</script>

<style scoped lang="scss">
.join-with-qr {
  & ::v-deep input {
    color: black;
    font-size: 15px;
  }
  & ::v-deep .v-icon.v-icon--disabled {
    color: black !important;
  }
}
</style>
