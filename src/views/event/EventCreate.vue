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
          New trip
        </h1>
      </v-col>
      <v-col cols="auto">
        <div class="create-btn">
          Create
        </div>
      </v-col>
    </v-row>

    <v-text-field
      placeholder="Trip name"
      outlined
      class="mt-4 rounded-0 trip-name-input"
    ></v-text-field>

    <div>
      <h2 class="text-body-1 font-weight-bold">
        Add members
      </h2>

      <v-autocomplete
        v-model="chosenUser"
        :items="autocompleteItems"
        :search-input.sync="text"
        placeholder="Search by email"
        prepend-inner-icon="mdi-magnify"
        outlined
        class="rounded-0 mt-4"
      ></v-autocomplete>
    </div>
  </v-container>
</template>

<script lang="ts">
import { Api } from '@/api'
import { SearchUserDetailRes, SearchUsersReq } from '@/interfaces/api/account'
import { debounce, unexpectedExc } from '@/utils'
import { Vue, Component, Watch } from 'vue-property-decorator'

@Component
export default class EventCreate extends Vue {
  /**
   * Add members
   */
  text = ''
  searching = false
  chosenUser: SearchUserDetailRes | null = null
  fetchedUsers: SearchUserDetailRes[] = []

  // eslint-disable-next-line
  get autocompleteItems () {
    return this.fetchedUsers.map(user => ({
      text: user.email,
      value: user.email  // TODO
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
        this.fetchedUsers = users
      })
      .catch(unexpectedExc)
      .finally(() => {
        this.searching = false
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
