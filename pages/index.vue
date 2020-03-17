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
  components: {
    LineChart,
  },
  computed: {
    data() {
      console.log(this.$store);
      return this.$store.data;
    },
  },
};
</script>

<style>

</style>
