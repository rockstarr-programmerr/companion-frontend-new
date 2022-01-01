<template>
  <v-container>
    <v-row
      justify="space-between"
      align="center"
      class="pt-7 pb-4"
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
            v-if="pendingEventInvitationsCount > 0"
            color="red"
            :content="pendingEventInvitationsCount"
            offset-x="10"
            offset-y="-8"
          ></v-badge>
        </v-btn>
        <v-btn
          icon
          :to="{ name: 'MyInfo' }"
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
      class="mt-10 text-center"
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
        class="mt-10"
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

      <v-pagination
        v-if="paginationLength > 1"
        v-model="page"
        :length="paginationLength"
        class="mt-2"
        @next="nextPage"
        @previous="previousPage"
      ></v-pagination>
    </div>
  </v-container>
</template>

<script lang="ts">
import { Event } from '@/interfaces/event'
import { EventInvitation, User } from '@/interfaces/user'
import { unexpectedExc } from '@/utils'
import { Vue, Component, Watch } from 'vue-property-decorator'
import { mapState } from 'vuex'
import BaseAvatar from '@/components/BaseAvatar.vue'
import { PaginatedRes } from '@/interfaces/api/common'
import { AxiosRequestConfig } from 'axios'

@Component({
  computed: {
    ...mapState('account', {
      user: 'loggedInUser',
      eventInvitations: 'eventInvitations'
    }),
    ...mapState('event', [
      'events',
      'pagination'
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

  setupEvents (url?: string, params?: AxiosRequestConfig['params']): void {
    this.loading = true

    this.$store.dispatch('event/getEvents', { params, url })
      .catch(unexpectedExc)
      .finally(() => {
        this.loading = false
      })
  }

  setupNotifications (): void {
    this.$store.dispatch('account/getEventInvitations')
      .catch(unexpectedExc)
  }

  get pendingEventInvitationsCount (): number {
    return this.eventInvitations.filter(invitation => invitation.status === 'pending').length
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
      limit: this.itemsPerPage,
      offset
    }
    this.setupEvents(undefined, params)
  }

  nextPage (): void {
    if (this.pagination.next !== null) {
      this.setupEvents(this.pagination.next)
    }
  }

  previousPage (): void {
    if (this.pagination.previous !== null) {
      this.setupEvents(this.pagination.previous)
    }
  }
}
</script>

<style scoped lang="scss">
.list-item {
  background-color: #F7F7FF;
}
</style>
