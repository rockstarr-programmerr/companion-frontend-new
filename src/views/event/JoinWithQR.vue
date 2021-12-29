<template>
  <v-container>
    <v-progress-linear
      indeterminate
      color="primary"
    ></v-progress-linear>

    <div class="mt-4">
      Vui lòng chờ trong giây lát...
    </div>
  </v-container>
</template>

<script lang="ts">
import { Api } from '@/api'
import { unexpectedExc } from '@/utils'
import { AxiosRequestConfig } from 'axios'
import { Vue, Component, Prop } from 'vue-property-decorator'
import { mapMutations } from 'vuex'

@Component({
  methods: {
    ...mapMutations('message', {
      showSuccess: 'SHOW_SUCCESS'
    })
  }
})
export default class JoinWithQR extends Vue {
  @Prop(String) readonly pk!: string
  @Prop(String) readonly token!: string

  showSuccess!: CallableFunction

  created (): void {
    const params: AxiosRequestConfig['params'] = {
      token: this.token
    }

    Api.event.joinWithQr(params)
      .then(() => {
        this.showSuccess('Tham gia chuyến đi thành công.')
        this.$router.push({
          name: 'EventDetail',
          params: {
            pk: this.pk
          }
        })
      })
      .catch(unexpectedExc)
  }
}
</script>

<style scoped lang="scss">

</style>
