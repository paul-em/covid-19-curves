<template>
  <section class="container">
    <div>
      <h1>
        COVID-19 Curves
      </h1>
      <line-chart
        :values="[]"
      />
      {{ data }}
    </div>
  </section>
</template>

<script>
import LineChart from '../components/LineChart.vue';

export default {
  async asyncData({ $axios }) {
    const re = await $axios.get('/data.json');
    return {
      data: re.data,
    };
  },
  components: {
    LineChart,
  },
};
</script>

<style>

</style>
