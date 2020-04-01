<template>
  <div>
    <div class="chart-container relative">
      <canvas
        id="myChart"
        ref="chart"
        height="400"
      />
      <input>
    </div>
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
        this.update();
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
        maintainAspectRatio: false,
        legend: {
          display: false,
        },
        tooltips: {
          enabled: true,
          displayColors: false,
        },
        scales: {
          yAxes: [{
            type: 'linear',
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
    update() {
      this.chart.data.datasets = this.datasets;
      this.chart.update();
    },
  },
};
</script>

<style lang="scss" scoped>
canvas {
  width: 100%;
}

.chart-container {
  width: 100%;
  min-width: 360px;
  height: 400px;
}
</style>
