<template>
  <v-container>
    <v-row
      justify="space-between"
      align="center"
      class="py-9"
    >
      <v-col cols="auto">
        <h1 class="text-h5 font-weight-bold">
          Good day, {{ user.nickname }}
        </h1>
      </v-col>
      <v-col cols="auto">
        <v-btn
          icon
        >
          <v-icon>
            mdi-bell-outline
          </v-icon>
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
        You don't have any trip.
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
        New trip
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
          Your trips
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
          class="list-item"
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
import { User } from '@/interfaces/user'
import { unexpectedExc } from '@/utils'
import { Vue, Component } from 'vue-property-decorator'
import { mapState } from 'vuex'
import BaseAvatar from '@/components/BaseAvatar.vue'

@Component({
  computed: {
    ...mapState('account', {
      user: 'loggedInUser'
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
  loading = true

  created (): void {
    this.setupEvents()
  }

  setupEvents (): void {
    this.$store.dispatch('event/getEvents')
      .catch(unexpectedExc)
      .finally(() => {
        this.loading = false
      })
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
