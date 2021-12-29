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
      Thành viên
    </h1>

    <v-sheet
      color="#F4F5F7"
      class="pa-2 mt-2"
    >
      <v-card flat>
        <v-card-title>
          Thành viên đã tham gia
        </v-card-title>

        <v-card-text>
          <v-skeleton-loader
            v-if="loadingEvent"
            type="paragraph"
          ></v-skeleton-loader>

          <div v-else-if="event.members.length === 0">
            Chưa có thành viên nào.
          </div>

          <div v-else>
            <v-list>
              <v-list-item
                v-for="member of event.members"
                :key="member.pk"
                class="px-0"
              >
                <v-list-item-avatar>
                  <BaseAvatar :user="member"></BaseAvatar>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ member.nickname }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ member.email }}
                  </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-icon>
                  <v-menu
                    left
                    nudge-left="40"
                  >
                    <template #activator="{ on, attrs }">
                      <v-btn
                        icon
                        v-on="on"
                        v-bind="attrs"
                        :disabled="member.pk === loggedInUser.pk"
                      >
                        <v-icon>
                          mdi-dots-vertical
                        </v-icon>
                      </v-btn>
                    </template>
                    <v-list dense>
                      <v-list-item @click="prepareRemove(member)">
                        <v-list-item-icon>
                          <v-icon>
                            mdi-account-remove-outline
                          </v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                          <v-list-item-title>
                            Xóa khỏi chuyến đi
                          </v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </v-list-item-icon>
              </v-list-item>
            </v-list>
          </div>
        </v-card-text>
      </v-card>

      <v-card
        flat
        class="mt-2"
      >
        <v-card-title>
          Mời thêm
        </v-card-title>

        <v-card-text>
          <v-autocomplete
            ref="searchInput"
            v-model="chosenUser"
            :items="autocompleteItems"
            :search-input.sync="text"
            :loading="searching && fetchedUsers.length === 0"
            placeholder="Nhập email để tìm kiếm"
            prepend-inner-icon="mdi-magnify"
            outlined
            clearable
            hide-details
          >
            <template #item="{ item }">
              <v-list-item-avatar>
                <BaseAvatar
                  :user="item.value"
                  size="36"
                ></BaseAvatar>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>
                  {{ item.value.email }}
                </v-list-item-title>
              </v-list-item-content>
            </template>
          </v-autocomplete>
        </v-card-text>
      </v-card>

      <v-card
        flat
        class="mt-2"
      >
        <v-card-title>
          Lời mời đã gửi
        </v-card-title>

        <v-card-text>
          <v-skeleton-loader
            v-if="loadingInvitations"
            type="paragraph"
          ></v-skeleton-loader>

          <div v-else-if="invitations.length === 0">
            Không có lời mời nào.
          </div>

          <v-list v-else>
            <v-list-item
              v-for="invitation of invitations"
              :key="invitation.pk"
              class="px-0"
            >
              <v-list-item-avatar>
                <BaseAvatar :user="invitation.user"></BaseAvatar>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>
                  {{ invitation.user.nickname }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ invitation.user.email }}
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-icon>
                <v-menu
                  left
                  nudge-left="40"
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
                  <v-list dense>
                    <v-list-item>
                      <v-list-item-icon>
                        <v-icon>
                          mdi-delete-outline
                        </v-icon>
                      </v-list-item-icon>
                      <v-list-item-content>
                        <v-list-item-title>
                          Hủy lời mời
                        </v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </v-list-item-icon>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-sheet>

    <BaseDialogConfirm
      v-model="confirmRemoveDialog"
      :loading="removing"
      @confirm="removeMember"
      @cancel="confirmRemoveDialog = false"
    >
      Xóa <strong v-if="memberToRemove !== null">{{ memberToRemove.nickname }}</strong>
      khỏi chuyến đi?
    </BaseDialogConfirm>
  </v-container>
</template>

<script lang="ts">
import { Event, EventInviteMembersReq } from '@/interfaces/event'
import { debounce, unexpectedExc } from '@/utils'
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { mapState, mapMutations } from 'vuex'
import { User } from '@/interfaces/user'
import { EventInivitationsListRes, EventInvitationDetailRes, RemoveMembersReq } from '@/interfaces/api/event'
import BaseAvatar from '@/components/BaseAvatar.vue'
import BaseDialogConfirm from '@/components/BaseDialogConfirm.vue'
import { AxiosRequestConfig } from 'axios'
import { Api } from '@/api'
import { SearchUserDetailRes, SearchUsersReq } from '@/interfaces/api/account'

@Component({
  computed: {
    ...mapState('event', {
      event: 'currentEvent'
    }),
    ...mapState('account', [
      'loggedInUser'
    ])
  },
  methods: {
    ...mapMutations('message', {
      showSucces: 'SHOW_SUCCESS'
    })
  },
  components: {
    BaseAvatar,
    BaseDialogConfirm
  }
})
export default class EventMembers extends Vue {
  @Prop(Number) readonly pk!: number

  /**
   * Setup
   */
  loadingEvent = true
  event!: Event
  loggedInUser!: User
  showSucces!: CallableFunction

  created (): void {
    this.setupEvent()
  }

  setupEvent (): void {
    this.$store.dispatch('event/getEventDetail', this.pk)
      .then(() => {
        this.setupInvitations()
      })
      .catch(unexpectedExc)
      .finally(() => {
        this.loadingEvent = false
      })
  }

  /**
   * Remove member
   */
  removing = false
  memberToRemove: User | null = null
  confirmRemoveDialog = false

  prepareRemove (member: User): void {
    this.memberToRemove = member
    this.confirmRemoveDialog = true
  }

  removeMember (): void {
    if (this.removing || this.memberToRemove === null) return
    this.removing = true

    const payload: RemoveMembersReq = {
      member_pks: [this.memberToRemove.pk]
    }
    this.$store.dispatch('event/removeMembers', payload)
      .then(() => {
        this.showSucces('Xóa thành viên thành công.')
        this.confirmRemoveDialog = false
      })
      .catch(unexpectedExc)
      .finally(() => {
        this.removing = false
      })
  }

  /**
   * Invitations
   */
  loadingInvitations = true
  invitations: EventInvitationDetailRes[] = []

  setupInvitations (): void {
    const params: AxiosRequestConfig['params'] = {
      status__in: 'pending'
    }

    Vue.axios.get(this.event.invitations_url, { params })
      .then(res => {
        const data: EventInivitationsListRes = res.data
        this.invitations = data.results || []
      })
      .catch(unexpectedExc)
      .finally(() => {
        this.loadingInvitations = false
      })
  }

  /**
   * Search for users to invite
   */
  text = ''
  searching = false
  chosenUser: SearchUserDetailRes | null = null
  fetchedUsers: SearchUserDetailRes[] = []

  // eslint-disable-next-line
  get autocompleteItems () {
    return this.fetchedUsers.map(user => ({
      text: user.email,
      value: user
    }))
  }

  @Watch('text')
  onSearch (text: string): void {
    debounce(this.searchUsers, 200)(text)
  }

  searchUsers (text: string): void {
    if (this.searching) return
    if (text === '' || text === null) {
      this.fetchedUsers = []
      return
    }

    this.searching = true

    const memberEmails = this.event.members.map(member => member.email)
    const invitedEmails = this.invitations.map(invitation => invitation.user.email)
    const excludeEmails = memberEmails.concat(invitedEmails)

    const params: SearchUsersReq = {
      nickname_or_email__icontains: text,
      exclude_emails: excludeEmails.join(',')
    }

    Api.account.searchUsers(params)
      .then(data => {
        this.fetchedUsers = data.results || []
      })
      .catch(unexpectedExc)
      .finally(() => {
        this.searching = false
      })
  }

  /**
   * Invite user
   */
  @Watch('chosenUser')
  onChoosingUser (user: SearchUserDetailRes, oldUser: SearchUserDetailRes | null): void {
    if (oldUser !== null && user.email === oldUser.email) return

    const url = this.event.extra_action_urls.invite_members
    const payload: EventInviteMembersReq = {
      member_emails: [user.email]
    }

    Vue.axios.post(url, payload)
      .then(() => {
        this.showSucces('Thêm lời mời thành công.')
        this.setupInvitations()
      })
      .catch(unexpectedExc)
  }
}
</script>

<style scoped lang="scss">

</style>
