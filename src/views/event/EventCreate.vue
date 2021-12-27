<template>
  <v-container>
    <v-row
      justify="space-between"
      align="center"
      class="py-9"
    >
      <v-col cols="auto">
        <v-icon @click="$router.push({ name: 'DashBoard' })">
          mdi-close
        </v-icon>
      </v-col>
      <v-col cols="auto">
        <h1 class="text-h5 font-weight-bold">
          Chuyến đi mới
        </h1>
      </v-col>
      <v-col cols="auto">
        <div
          class="create-btn"
          @click="createEvent"
        >
          <v-progress-circular
            v-if="creating"
            indeterminate
            color="primary"
            width="2"
            size="18"
          ></v-progress-circular>
          <span v-else>
            Tạo
          </span>
        </div>
      </v-col>
    </v-row>

    <v-text-field
      v-model="name"
      placeholder="Tên chuyến đi"
      outlined
      :error-messages="nameErrs"
      :error-count="nameErrs.length"
      class="mt-4 rounded-0 trip-name-input"
    ></v-text-field>

    <div>
      <h2 class="text-body-1 font-weight-bold">
        Thêm thành viên
      </h2>

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
        class="rounded-0 mt-4"
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

      <v-list>
        <v-list-item
          v-for="member of membersToAdd"
          :key="member.email"
        >
          <v-list-item-avatar>
            <BaseAvatar
              :user="member"
              size="36"
            ></BaseAvatar>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>
              {{ member.email }}
            </v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn
              icon
              @click="removeMember(member.email)"
            >
              <v-icon>
                mdi-close
              </v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </div>
  </v-container>
</template>

<script lang="ts">
import { Api } from '@/api'
import { SearchUserDetailRes, SearchUsersReq } from '@/interfaces/api/account'
import { debounce, snakeCaseToCamelCase, unexpectedExc } from '@/utils'
import { Vue, Component, Watch } from 'vue-property-decorator'
import BaseAvatar from '@/components/BaseAvatar.vue'
import { EventCreateReq, EventInviteMembersReq } from '@/interfaces/event'
import { assertErrCode, status } from '@/utils/status-codes'
import { EventDetailRes } from '@/interfaces/api/event'
import { mapMutations } from 'vuex'

@Component({
  components: {
    BaseAvatar
  },
  methods: {
    ...mapMutations('message', {
      showSucces: 'SHOW_SUCCESS'
    })
  }
})
export default class EventCreate extends Vue {
  // eslint-disable-next-line no-undef
  [index: string]: unknown

  /**
   * Search for users
   */
  text = ''
  searching = false
  chosenUser: SearchUserDetailRes | null = null
  fetchedUsers: SearchUserDetailRes[] = []

  // eslint-disable-next-line
  get autocompleteItems () {
    return this.fetchedUsers.map(user => ({
      text: user.email,
      value: user  // TODO
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

    const params: SearchUsersReq = {
      nickname_or_email__icontains: text
    }

    Api.account.searchUsers(params)
      .then(data => {
        const users = data.results || []
        const addedEmails = this.membersToAdd.map(member => member.email)
        this.fetchedUsers = users.filter(user => !addedEmails.includes(user.email))
      })
      .catch(unexpectedExc)
      .finally(() => {
        this.searching = false
      })
  }

  /**
   * Add members
   */
  membersToAdd: SearchUserDetailRes[] = []

  @Watch('chosenUser')
  onChooseUser (user: SearchUserDetailRes | null): void {
    if (
      user !== null &&
      !this.membersToAdd.map(member => member.email).includes(user.email)
    ) {
      this.membersToAdd.push(user)
    }
    this.text = ''
    // @ts-expect-error don't care
    this.$refs.searchInput.clearableCallback()
  }

  removeMember (email: string): void {
    this.membersToAdd = this.membersToAdd.filter(member => member.email !== email)
  }

  /**
   * Create event
   */
  name = ''
  nameErrs = []
  creating = false
  showSucces!: CallableFunction

  createEvent (): void {
    if (this.creating) return

    const payload: EventCreateReq = {
      name: this.name
    }
    this.$store.dispatch('event/createEvent', payload)
      .then((event: EventDetailRes) => {
        const url = event.extra_action_urls.invite_members
        const payload: EventInviteMembersReq = {
          member_emails: this.membersToAdd.map(member => member.email)
        }

        // @ts-expect-error don't care
        this.$axios.post(url, payload)
          .then(() => {
            this.showSucces('Tạo chuyến đi thành công.')
            this.$router.push({
              name: 'EventDetail',
              params: {
                pk: event.pk.toString()
              }
            })
          })
          .catch(unexpectedExc)
      })
      .catch(err => {
        if (assertErrCode(err, status.HTTP_400_BAD_REQUEST)) {
          const data = err.response.data
          Object.entries(data).forEach(([field, errMsgs]) => {
            const attr = `${snakeCaseToCamelCase(field)}Errs`
            this[attr] = errMsgs
          })
        } else {
          unexpectedExc(err)
        }
      })
      .finally(() => {
        this.creating = false
      })
  }
}
</script>

<style scoped lang="scss">
.create-btn {
  color: var(--v-anchor-base);
}

.trip-name-input ::v-deep input {
  text-align: center;
}
</style>
