<template>
  <div>
    <canvas
      id="myChart"
      ref="chart"
    />
    <button
      class="p-3 my-2 text-sm hover:bg-grey-lighter rounded-sm uppercase"
      @click="toggleViewType">
      {{ linear ? 'linear' : 'logarithmic' }}
    </button>
  </div>
</template>

<script>
import 'chart.js';

export default {
  props: {
    datasets: { type: Array, required: true },
    labels: { type: Array, required: true },
  },
  data: () => ({
    chart: null,
    linear: true,
  }),
  watch: {
    datasets: {
      deep: true,
      handler() {
        this.chart.data.labels = this.labels;
        this.chart.data.datasets = this.datasets;
        this.chart.update();
      },
    },
  },
  mounted() {
    this.chart = new window.Chart(this.$refs.chart, {
      type: 'line',
      data: {
        labels: this.labels,
        datasets: this.datasets,
      },
      options: {
        legend: {
          display: false,
        },
        scales: {
          yAxes: [{
            type: this.linear ? 'linear' : 'logarithmic',
          }],
        },
      },
    });
  },
  methods: {
    toggleViewType() {
      this.linear = !this.linear;
      this.chart.options.scales.yAxes[0].type = this.linear ? 'linear' : 'logarithmic';
      this.chart.update();
    },
  },
};
</script>

<style lang="scss" scoped>
canvas {
  width: 100%;
  min-width: 360px
}
</style>
