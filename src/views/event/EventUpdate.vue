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

    <h1 class="test-h5 font-weight-bold">
      Chỉnh sửa chuyến đi
    </h1>

    <div
      v-if="event !== null"
      class="mt-6"
    >
      <v-form>
        <v-text-field
          v-model="payload.name"
          label="Tên chuyến đi"
          outlined
          :error-messages="errMsgs.name"
          :error-count="errMsgs.name.length"
        ></v-text-field>
      </v-form>

      <v-btn
        color="primary"
        block
        depressed
        large
        :loading="updating"
        @click="updateEvent"
      >
        Lưu
      </v-btn>
    </div>
  </v-container>
</template>

<script lang="ts">
import { EventUpdateReq, EventUpdateReqErrs } from '@/interfaces/api/event'
import { Event } from '@/interfaces/event'
import { unexpectedExc } from '@/utils'
import { assertErrCode, status } from '@/utils/status-codes'
import { Vue, Component, Prop } from 'vue-property-decorator'
import { mapMutations, mapState } from 'vuex'

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
export default class EventUpdate extends Vue {
  // eslint-disable-next-line no-undef
  [index: string]: unknown

  @Prop(Number) readonly pk!: number

  /**
   * Setup
   */
  loading = true
  event!: Event

  created (): void {
    this.setupEvent()
  }

  setupEvent (): void {
    this.$store.dispatch('event/getEventDetail', this.pk)
      .then(() => {
        this.payload.name = this.event.name
      })
      .catch(unexpectedExc)
      .finally(() => {
        this.loading = false
      })
  }

  /**
   * Update event
   */
  payload: EventUpdateReq = {
    name: ''
  }

  errMsgs: EventUpdateReqErrs = {
    name: []
  }

  updating = false
  showSucces!: CallableFunction

  updateEvent (): void {
    if (this.updating) return
    this.updating = true

    this.$store.dispatch('event/updateEvent', {
      pk: this.pk,
      body: this.payload
    })
      .then(() => {
        this.showSucces('Chỉnh sửa chuyến đi thành công.')
        this.$router.push({
          name: 'EventDetail',
          params: {
            pk: this.pk.toString()
          }
        })
      })
      .catch(err => {
        const data = err.response.data
        if (assertErrCode(err, status.HTTP_400_BAD_REQUEST)) {
          this.errMsgs = data
        } else {
          unexpectedExc(err)
        }
      })
      .finally(() => {
        this.updating = false
      })
  }
}
</script>

<style scoped lang="scss">

</style>
