<template>
  <v-container class="container-sm">
    <v-breadcrumbs :items="breadcrumbs"></v-breadcrumbs>

    <h1>Profile</h1>
    <v-divider></v-divider>

    <div class="mt-5">
      <v-row>
        <v-col cols="auto">
          <KLAvatar
            size="256"
            tile
          ></KLAvatar>
        </v-col>
        <v-col cols="auto">
          <div>
            <h2>{{ user.name }}</h2>
            <p class="caption">{{ user.email }}</p>
          </div>
          <div>
            <v-row>
              <v-col cols="auto">
                <p>Account</p>
                <p>Phone number</p>
              </v-col>
              <v-col cols="auto" class="font-weight-bold">
                <p>{{ account }}</p>
                <p>{{ user.phone_number }}</p>
              </v-col>
            </v-row>
          </div>
          <div>
            <p>
              <router-link :to="{ name: 'ProfileUpdate' }">
                Edit profile
              </router-link>
            </p>
            <p>
              <router-link :to="{ name: 'ChangePassword' }">
                Change password
              </router-link>
            </p>
            <p
              @click="logoutConfirm = true"
              class="d-inline-flex cursor-pointer"
            >
              <a href="#" class="mr-3">
                Logout
              </a>
              <v-icon>
                mdi-logout-variant
              </v-icon>
            </p>
          </div>
        </v-col>
      </v-row>
    </div>

    <KLDialogConfirm
      v-model="logoutConfirm"
      @confirm="goodBye"
      @cancel="logoutConfirm = false"
    >
      Logout now?
    </KLDialogConfirm>
  </v-container>
</template>

<script lang="ts">
import { User } from '@/interfaces/user'
import { Vue, Component } from 'vue-property-decorator'
import { mapGetters, mapState } from 'vuex'
import KLAvatar from '@/components/KLAvatar.vue'
import KLDialogConfirm from '@/components/KLDialogConfirm.vue'
import { logout } from '@/utils/auth'

@Component({
  computed: {
    ...mapState('account', {
      user: 'loggedInUser'
    }),
    ...mapGetters('account', [
      'isTeacher'
    ])
  },
  components: {
    KLAvatar,
    KLDialogConfirm
  }
})
export default class MyInfo extends Vue {
  breadcrumbs = [
    { text: 'Home', to: { name: 'Home' }, exact: true },
    { text: 'Profile', to: { name: 'MyInfo' }, exact: true }
  ]

  user!: User
  isTeacher!: boolean

  get account (): string {
    return this.isTeacher ? 'Teacher' : 'Student'
  }

  logoutConfirm = false

  goodBye (): void {
    logout()
    this.$router.push({ name: 'Login' })
  }
}
</script>

<style scoped lang="scss">

</style>
