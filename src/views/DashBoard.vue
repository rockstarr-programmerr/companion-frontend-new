<template>
  <v-container>
    <v-row
      justify="space-between"
      align="center"
      class="py-9"
    >
      <v-col cols="8">
        <h1 class="text-h5 font-weight-bold">
          Xin chào, {{ user.nickname }}
        </h1>
      </v-col>
      <v-col cols="4" class="text-right">
        <v-btn
          icon
          :to="{ name: 'Notifications' }"
        >
          <v-icon>
            mdi-bell-outline
          </v-icon>
          <v-badge
            v-if="eventInvitations.length > 0"
            color="red"
            :content="eventInvitations.length"
            offset-x="10"
            offset-y="-8"
          ></v-badge>
        </v-btn>
        <v-btn
          icon
        >
          <v-icon>
            mdi-cog-outline
          </v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <v-skeleton-loader
      v-if="loading"
      type="list-item-two-line@3"
      tile
    ></v-skeleton-loader>

    <div
      v-else-if="events.length === 0"
      class="mt-15 text-center"
    >
      <div class="text-body-1 font-weight-bold">
        Bạn chưa có chuyến đi nào.
      </div>
      <v-btn
        color="primary"
        depressed
        block
        tile
        large
        class="mt-15"
        :to="{ name: 'EventCreate' }"
      >
        Tạo ngay
      </v-btn>
    </div>

    <div v-else>
      <v-row
        justify="space-between"
        align="center"
      >
        <v-col
          cols="auto"
          class="text-body-2 font-weight-bold"
        >
          Những chuyến đi bạn đang tham gia
        </v-col>
        <v-col cols="auto">
          <v-btn
            icon
            large
            :to="{ name: 'EventCreate' }"
          >
            <v-icon>
              mdi-plus
            </v-icon>
          </v-btn>
        </v-col>
      </v-row>

      <v-list>
        <v-list-item
          v-for="event of events"
          :key="event.pk"
          class="list-item mb-3"
          :to="{
            name: 'EventDetail',
            params: {
              pk: event.pk.toString()
            }
          }"
        >
          <v-list-item-content>
            <v-list-item-title>
              <v-row
                justify="space-between"
                align="center"
              >
                <v-col
                  cols="auto"
                  class="text-body-1 font-weight-bold"
                >
                  {{ event.name }}
                </v-col>
                <v-col
                  cols="auto"
                >
                  <BaseAvatar
                    v-for="member of getTruncatedMembers(event)"
                    :key="member.pk"
                    :user="member"
                    class="ml-2"
                    size="36"
                  ></BaseAvatar>
                  <v-avatar
                    v-if="getRemainingMembersCount(event) > 0"
                    size="36"
                    color="white"
                    class="ml-2"
                  >
                    <span class="text-body-2 font-weight-bold">
                      +{{ getRemainingMembersCount(event) }}
                    </span>
                  </v-avatar>
                </v-col>
              </v-row>
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </div>
  </v-container>
</template>

<script lang="ts">
import { Event } from '@/interfaces/event'
import { EventInvitation, User } from '@/interfaces/user'
import { unexpectedExc } from '@/utils'
import { Vue, Component } from 'vue-property-decorator'
import { mapState } from 'vuex'
import BaseAvatar from '@/components/BaseAvatar.vue'

@Component({
  computed: {
    ...mapState('account', {
      user: 'loggedInUser',
      eventInvitations: 'eventInvitations'
    }),
    ...mapState('event', [
      'events'
    ])
  },
  components: {
    BaseAvatar
  }
})
export default class DashBoard extends Vue {
  /**
   * Setup
   */
  events!: Event[]
  user!: User
  eventInvitations!: EventInvitation[]
  loading = true

  created (): void {
    this.setupEvents()
    this.setupNotifications()
  }

  setupEvents (): void {
    this.$store.dispatch('event/getEvents')
      .catch(unexpectedExc)
      .finally(() => {
        this.loading = false
      })
  }

  setupNotifications (): void {
    this.$store.dispatch('account/getEventInvitations')
      .catch(unexpectedExc)
  }

  /**
   * List item display
   */
  getTruncatedMembers (event: Event): Event['members'] {
    return event.members.slice(0, 3)
  }

  getRemainingMembersCount (event: Event): number {
    const truncatedMembers = this.getTruncatedMembers(event)
    return event.members.length - truncatedMembers.length
  }
}
</script>

<style scoped lang="scss">
.list-item {
  background-color: #F7F7FF;
}
</style>
