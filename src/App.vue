<template>
  <v-app>
    <v-main
       v-if="initDone"
      class="restrict-width"
    >
      <router-view/>
    </v-main>

    <v-progress-linear
      v-else
      indeterminate
    ></v-progress-linear>

    <v-snackbar
      :value="messageShow"
      @input="setMessage"
      :color="messageColor"
      bottom
    >
      {{ messageText }}
      <template #action="{ attrs }">
        <v-btn
          color="white"
          text
          icon
          v-bind="attrs"
          @click="hideMessage"
        >
          <v-icon>
            mdi-close
          </v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { mapState, mapMutations } from 'vuex';
import { User } from './interfaces/user';
import { noAuthenRoutes } from './router';
import { unexpectedExc } from './utils';
import { assertErrCode, status } from './utils/status-codes';

@Component({
  computed: {
    ...mapState('account', {
      user: 'loggedInUser'
    }),
    ...mapState('message', {
      messageShow: 'show',
      messageText: 'text',
      messageColor: 'color'
    })
  },
  methods: {
    ...mapMutations('message', {
      showMessage: 'SHOW_MESSAGE',
      hideMessage: 'HIDE_MESSAGE'
    })
  }
})
export default class App extends Vue {
  /**
   * Init
   */
  user!: User
  loading = false
  initDone = false

  created (): void {
    this.setUserInfo()
  }

  setUserInfo (): void {
    const routeName = this.$route.name
    if (noAuthenRoutes.includes(routeName as string)) {
      this.initDone = true
      return
    }

    this.loading = true
    this.$store.dispatch('account/getInfo')
      .catch(err => {
        if (assertErrCode(err, status.HTTP_401_UNAUTHORIZED)) {
          this.$router.push({ name: 'Login' })
        } else {
          unexpectedExc(err)
        }
      })
      .finally(() => {
        this.loading = false
        this.initDone = true
      })
  }

  /**
   * Message
   */
  messageShow!: boolean
  messageText!: string
  messageColor!: string
  showMessage!: CallableFunction
  hideMessage!: CallableFunction

  setMessage (show: boolean): void {
    if (show) {
      this.showMessage()
    } else {
      this.hideMessage()
    }
  }
}
</script>

<style scoped lang="scss">
.restrict-width {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}
</style>
