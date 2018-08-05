import Vue from 'vue';
import Vuex from 'vuex';
import * as actions from './actions.js';
import * as getters from './getters.js';
import state from './state.js';
import mutations from './mutations.js';
// 调试用
import createLogger from 'vuex/dist/logger'
Vue.use(Vuex)
// 调试用
const debug = process.env.NODE_ENV !== 'production'
export default new Vuex.Store({
  actions,
  getters,
  state,
  mutations,
  strict: debug,
  plugins: debug ? [createLogger()] : []
});
