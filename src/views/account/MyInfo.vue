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
      Cài đặt
    </h1>

    <div class="text-center">
      <BaseAvatar></BaseAvatar>
      <div
        class="mt-2"
      >
        Thay đổi
      </div>
    </div>

    <div class="mt-4">
      <h2 class="text-body-1 font-weight-bold">
        Thông tin cá nhân
      </h2>

      <v-row
        class="text-body-2 py-2"
        no-gutters
        align="center"
        v-ripple
        @click="$router.push({ name: 'MyInfoChangeName' })"
      >
        <v-col cols="1">
          <v-icon>
            mdi-account
          </v-icon>
        </v-col>
        <v-col cols="5" class="pl-4">
          Tên hiển thị
        </v-col>
        <v-col cols="5" class="text-right pr-2">
          {{ user.nickname }}
        </v-col>
        <v-col cols="1">
          <v-btn
            icon
          >
            <v-icon>
              mdi-chevron-right
            </v-icon>
          </v-btn>
        </v-col>
      </v-row>
      <v-divider></v-divider>

      <v-row
        class="text-body-2 py-2"
        no-gutters
        align="center"
      >
        <v-col cols="1">
          <v-icon>
            mdi-key-variant
          </v-icon>
        </v-col>
        <v-col cols="10" class="pl-4">
          Đổi mật khẩu
        </v-col>
        <v-col cols="1">
          <v-btn
            icon
          >
            <v-icon>
              mdi-chevron-right
            </v-icon>
          </v-btn>
        </v-col>
      </v-row>
      <v-divider></v-divider>
    </div>
  </v-container>
</template>

<script lang="ts">
import { User } from '@/interfaces/user';
import { Vue, Component } from 'vue-property-decorator'
import { mapState } from 'vuex'
import BaseAvatar from '@/components/BaseAvatar.vue';

@Component({
  computed: {
    ...mapState('account', {
      user: 'loggedInUser'
    })
  },
  components: {
    BaseAvatar
  }
})
export default class MyInfo extends Vue {
  // eslint-disable-next-line no-undef
  [index: string]: unknown

  /**
   * Setup
   */
  loading = true
  user!: User
}
</script>

<style scoped lang="scss">

</style>
