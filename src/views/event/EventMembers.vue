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
          Các thành viên đã tham gia
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
                  <BaseAvatar
                    :user="member"
                  ></BaseAvatar>
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
import { Event } from '@/interfaces/event'
import { unexpectedExc } from '@/utils'
import { Vue, Component, Prop } from 'vue-property-decorator'
import { mapState, mapMutations } from 'vuex'
import { User } from '@/interfaces/user'
import { RemoveMembersReq } from '@/interfaces/api/event'
import BaseAvatar from '@/components/BaseAvatar.vue'
import BaseDialogConfirm from '@/components/BaseDialogConfirm.vue'

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
}
</script>

<style scoped lang="scss">

</style>
