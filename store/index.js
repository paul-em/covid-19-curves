import fetchData from '../server/fetchData';
/* eslint-disable no-param-reassign */

export const state = () => ({
  data: [],
});

export const mutations = {
  setData(s, data) {
    s.data = data;
  },
};

export const actions = {
  async nuxtServerInit({ commit }) {
    const data = await fetchData();
    commit('setData', data);
  },
};
