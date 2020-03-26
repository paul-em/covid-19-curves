<template>
  <div class="flex flex-col">
    <header class="flex items-center p-8 min-h-72">
      <h1>
        Corona Virus (COVID-19) Curves
      </h1>
      <a
        class="p-4 text-blue no-underline"
        href="https://github.com/CSSEGISandData/COVID-19">Data provided by John Hopkins CSSE</a>
      <github-corner url="https://github.com/paul-em/covid-19-curves"/>
    </header>
    <div class="mx-8 p-4 bg-grey-light rounded text-sm leading-normal">
      <b>Disclaimer:</b> The data is continuously updated by <a
        href="https://github.com/CSSEGISandData/COVID-19"
        target="_blank">John Hopkins University</a>.
        However, this does not mean that the data reflects the exact current figures.
        Take all the data you see online with a grain of salt, as the numbers depend on
        testing frequencies and many other factors.
        This visualization should just provide insight into the trends of the curves.
        All code used to create this visualization and the data is open source,
        so you can
      <a
        href="https://github.com/paul-em/covid-19-curves"
        target="_blank">
        check everything</a>
      yourself and contribute to its improvement.
    </div>
    <div>
      <section class="flex flex-col flex-1 m-4">
        <h3
          v-if="selected.length"
          class="m-4">{{ selectedColumn.label }} in
          <span
            v-for="location in selected"
            :key="location"
            :style="{ 'border-color': $color.hex(location) }"
            class="border-b-2 mr-2">{{ location }}</span>
        </h3>
        <h3
          v-else
          class="m-4"
        >
          Select a Location to show data
        </h3>
        <line-chart
          :datasets="datasets"
          :labels="timelineDates"
        />
      </section>
      <section class="flex flex-col">
        <location-table
          v-model="selected"
          :data="current"
          @columnSelect="updateSelectedColumn"/>
      </section>
    </div>
  </div>
</template>

<script>
import LineChart from '../components/LineChart.vue';
import MultiSelect from '../components/MultiSelect.vue';
import LocationTable from '../components/LocationTable.vue';
import GithubCorner from '../components/GithubCorner.vue';

export default {
  components: {
    LineChart,
    MultiSelect,
    LocationTable,
    GithubCorner,
  },
  async asyncData({ app: { $loader } }) {
    return $loader.loadCases();
  },
  data: () => ({
    timelines: {},
    timelineDates: [],
    current: [],
    selected: ['Hubei, CHN', 'ITA', 'USA'],
    selectedColumn: 'active',
  }),
  computed: {
    datasets() {
      return this.selected
        .map(location => this.timelines[location]);
    },
  },
  methods: {
    updateSelectedColumn(column) {
      this.selectedColumn = column;
    },
  },
};
</script>

<style>

</style>
