<template>
  <v-container class="container-sm">
    <v-breadcrumbs :items="breadcrumbs"></v-breadcrumbs>

    <h1>Edit profile</h1>
    <v-divider></v-divider>

    <v-card class="mt-5">
      <v-card-text>
        <v-form>
          <v-text-field
            v-model="name"
            label="Name"
            :error-messages="nameErrs"
            :error-count="nameErrs.length"
          ></v-text-field>

          <v-text-field
            v-model="phoneNumber"
            label="Phone number"
            :error-messages="phoneNumberErrs"
            :error-count="phoneNumberErrs.length"
          ></v-text-field>

          <v-file-input
            v-model="avatar"
            label="Avatar"
            prepend-icon="mdi-camera"
            :error-messages="avatarErrs"
            :error-count="avatarErrs.length"
          ></v-file-input>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-btn
          color="primary"
          min-width="110"
          @click="saveProfile"
          :loading="loading"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { UpdateProfileReq } from '@/interfaces/api/account'
import { User } from '@/interfaces/user'
import { snakeCaseToCamelCase, unexpectedExc } from '@/utils'
import { assertErrCode, status } from '@/utils/status-codes'
import { Vue, Component } from 'vue-property-decorator'
import { mapState } from 'vuex'

@Component({
  computed: {
    ...mapState('account', {
      user: 'loggedInUser'
    })
  }
})
export default class ProfileUpdate extends Vue {
  // eslint-disable-next-line no-undef
  [key: string]: unknown

  breadcrumbs = [
    { text: 'Home', to: { name: 'Home' }, exact: true },
    { text: 'Profile', to: { name: 'MyInfo' }, exact: true },
    { text: 'Edit', to: { name: 'ProfileUpdate' }, exact: true }
  ]

  user!: User

  name: User['name'] = ''
  phoneNumber: User['phone_number'] = ''
  avatar: File | null = null
  originalAvatar: File | null = null

  nameErrs: string[] = []
  phoneNumberErrs: string[] = []
  avatarErrs: string[] = []

  loading = false

  created (): void {
    this.name = this.user.name
    this.phoneNumber = this.user.phone_number

    if (this.user.avatar !== null) {
      Vue.axios.get(this.user.avatar, {
        // @ts-expect-error this is our custom config
        noAuthorization: true
      })
        .then(res => {
          if (this.user.avatar !== null) {
            const parts = this.user.avatar.split('/')
            const avatarName = parts[parts.length - 1]
            const file = new File([res.data], avatarName)
            this.avatar = file
            this.originalAvatar = file
          }
        })
    }
  }

  saveProfile (): void {
    if (this.loading) return
    this.loading = true

    const payload: UpdateProfileReq = {
      name: this.name,
      phone_number: this.phoneNumber
    }

    if (this.avatar !== this.originalAvatar) {
      payload.avatar = this.avatar
    }

    this.$store.dispatch('account/updateProfile', payload)
      .then(() => {
        this.$router.push({ name: 'MyInfo' })
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
        this.loading = false
      })
  }
}
</script>

<style scoped lang="scss">

</style>
