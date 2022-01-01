import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    options: {
      customProperties: true
    },
    themes: {
      light: {
        primary: {
          base: '#FD604C',
          lighten1: '#f27d72',
          lighten2: '#f9a19a',
          lighten3: '#ffd1d2',
          lighten4: '#ffedee',
          darken1: '#ff542d',
          darken2: '#f44b2f',
          darken3: '#e24029',
          darken4: '#d53a22'
        },
        secondary: {
          base: '#f7005d'
        }
      }
    }
  }
});
