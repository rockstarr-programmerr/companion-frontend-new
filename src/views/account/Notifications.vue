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

    <h1 class="text-h5 font-weight-bold">
      Thông báo của bạn
    </h1>

    <div class="mt-6">
      <v-skeleton-loader
        v-if="loading"
        type="card@2"
      ></v-skeleton-loader>

      <div v-else-if="eventInvitations.length === 0">
        Không có thông báo nào.
      </div>

      <v-card
        v-else
        v-for="(invitation, index) of eventInvitations"
        :key="invitation.pk"
        color="#EEEEEE"
        tile
        outlined
        class="mb-2"
      >
        <v-card-text>
          <v-list-item class="px-0">
            <v-list-item-avatar>
              <BaseAvatar
                :user="invitation.event.creator"
              ></BaseAvatar>
            </v-list-item-avatar>
            <v-list-item-content class="d-block">
              <strong>{{ invitation.event.creator.nickname }}</strong>
              muốn mời bạn tham gia chuyến đi
              <strong>{{ invitation.event.name }}</strong>.
            </v-list-item-content>
          </v-list-item>
        </v-card-text>
        <v-card-actions>
          <v-row v-if="invitation.status === 'pending'">
            <v-col cols="6">
              <v-btn
                color="primary"
                depressed
                tile
                block
                :loading="acceptings[index]"
                @click="acceptEventInvitation(invitation)"
              >
                Chấp nhận
              </v-btn>
            </v-col>
            <v-col cols="6">
              <v-btn
                depressed
                tile
                block
                :loading="declinings[index]"
                @click="declineEventInvitation(invitation)"
              >
                Từ chối
              </v-btn>
            </v-col>
          </v-row>
          <div v-else-if="invitation.status === 'accepted'">
            <router-link
              :to="{
                name: 'EventDetail',
                params: {
                  pk: invitation.event.pk.toString()
                }
              }"
            >
              Xem chuyến đi
            </router-link>
          </div>
          <v-chip v-else>
            Đã từ chối
          </v-chip>
        </v-card-actions>
      </v-card>
    </div>
  </v-container>
</template>

<script lang="ts">
import { EventInvitation, User } from '@/interfaces/user'
import { unexpectedExc } from '@/utils'
import { Vue, Component } from 'vue-property-decorator'
import { mapMutations, mapState } from 'vuex'
import BaseAvatar from '@/components/BaseAvatar.vue'

@Component({
  computed: {
    ...mapState('account', {
      user: 'loggedInUser',
      eventInvitations: 'eventInvitations'
    })
  },
  methods: {
    ...mapMutations('message', {
      showSucces: 'SHOW_SUCCESS'
    })
  },
  components: {
    BaseAvatar
  }
})
export default class Notifications extends Vue {
  /**
   * Setup
   */
  user!: User
  eventInvitations!: EventInvitation[]
  loading = true

  created (): void {
    this.setupNotifications()
  }

  setupNotifications (): void {
    this.$store.dispatch('account/getEventInvitations')
      .then(() => {
        this.eventInvitations.forEach(invitation => {
          this.acceptings[invitation.pk] = false
          this.declinings[invitation.pk] = false
        })
      })
      .catch(unexpectedExc)
      .finally(() => {
        this.loading = false
      })
  }

  /**
   * Accept / decline event invitation
   */
  acceptings: { [index: number]: boolean } = {}
  declinings: { [index: number]: boolean } = {}
  showSucces!: CallableFunction

  acceptEventInvitation (invitation: EventInvitation): void {
    if (this.acceptings[invitation.pk]) return
    this.acceptings[invitation.pk] = true

    this.$store.dispatch('account/acceptEventInvitation', invitation)
      .then(() => {
        this.showSucces('Tham gia chuyến đi thành công.')
      })
      .catch(unexpectedExc)
      .finally(() => {
        this.acceptings[invitation.pk] = false
      })
  }

  declineEventInvitation (invitation: EventInvitation): void {
    if (this.declinings[invitation.pk]) return
    this.declinings[invitation.pk] = true

    this.$store.dispatch('account/declineEventInvitation', invitation)
      .then(() => {
        this.showSucces('Từ chối tham gia chuyến đi thành công.')
      })
      .catch(unexpectedExc)
      .finally(() => {
        this.declinings[invitation.pk] = false
      })
  }
}
</script>

<style scoped lang="scss">

</style>
