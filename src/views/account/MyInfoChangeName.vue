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
      Tên hiển thị
    </h1>

    <v-text-field
      v-model="nickname"
      label="Tên hiển thị"
      outlined
      :error-messages="nicknameErrs"
      :error-count="nicknameErrs.length"
    ></v-text-field>

    <v-btn
      color="primary"
      block
      depressed
      large
      :loading="updating"
      @click="update"
    >
      Lưu
    </v-btn>
  </v-container>
</template>

<script lang="ts">
import { UpdateProfileReq } from '@/interfaces/api/account'
import { User } from '@/interfaces/user'
import { unexpectedExc } from '@/utils'
import { assertErrCode, status } from '@/utils/status-codes'
import { Vue, Component } from 'vue-property-decorator'
import { mapMutations, mapState } from 'vuex'

@Component({
  computed: {
    ...mapState('account', {
      user: 'loggedInUser'
    })
  },
  methods: {
    ...mapMutations('message', {
      showSuccess: 'SHOW_SUCCESS'
    })
  }
})
export default class MyInfoChangeName extends Vue {
  // eslint-disable-next-line no-undef
  [index: string]: unknown

  /**
   * Setup
   */
  loading = true
  user!: User

  created (): void {
    this.nickname = this.user.nickname
  }

  /**
   * Change name
   */
  nickname = ''
  nicknameErrs: string[] = []
  updating = false
  showSuccess!: CallableFunction

  update (): void {
    if (this.updating) return
    this.updating = true

    const payload: UpdateProfileReq = {
      nickname: this.nickname
    }
    this.$store.dispatch('account/updateProfile', payload)
      .then(() => {
        this.showSuccess('Cập nhật thành công.')
        this.$router.push({ name: 'MyInfo' })
      })
      .catch(err => {
        if (assertErrCode(err, status.HTTP_400_BAD_REQUEST)) {
          const data = err.response.data
          this.nicknameErrs = data.nickname || []
        } else {
          unexpectedExc(err)
        }
      })
      .finally(() => {
        this.updating = false
      })
  }
}
</script>

<style scoped lang="scss">

</style>
