<template>
  <section>
    <github-corner url="https://github.com/paul-em/covid-19-curves"/>
    <h1 class="px-16 pt-16 max-w-xl">
      Corona Virus Curves
    </h1>
    <p class="px-16 py-2">
      Updated once per day <a
        class="text-blue"
        target="_blank"
        href="https://coronadatascraper.com/">by Corona Data Scraper Project</a>
    </p>
    <div class="p-16">
      <column-select
        v-model="selectedColumn"
        class="inline-block"/>
      <span class="inline-block p-2">in</span>
      <location-select
        v-model="selectedLocations"
        :locations="locations"
        class="inline-block"/>
    </div>
    <div>
      <section class="p-8">
        <line-chart
          :datasets="datasets"
          :labels="timelineDates"
        />
      </section>
      <div
        v-if="columnDisclaimer"
        class="text-sm px-16 py-4 opacity-75">
        * {{ columnDisclaimer }}
      </div>
      <button
        class="p-3 my-8 mx-16 text-sm bg-grey-light hover:bg-grey-lighter rounded-sm uppercase"
        @click="showTable = !showTable">
        {{ showTable ? 'Hide Table': 'Show Table' }}
      </button>
      <section v-if="showTable">
        <location-table
          v-model="selectedLocations"
          :data="current"
          @columnSelect="updateSelectedColumn"/>
      </section>
    </div>
  </section>
</template>

<script>
import LineChart from '../components/LineChart.vue';
import MultiSelect from '../components/MultiSelect.vue';
import LocationTable from '../components/LocationTable.vue';
import GithubCorner from '../components/GithubCorner.vue';
import LocationSelect from '../components/LocationSelect.vue';
import ColumnSelect from '../components/ColumnSelect.vue';
import columns from '../components/columns';

export default {
  components: {
    LineChart,
    MultiSelect,
    LocationTable,
    GithubCorner,
    LocationSelect,
    ColumnSelect,
  },
  async asyncData({ app: { $loader } }) {
    return $loader.loadCases();
  },
  data: () => ({
    timelines: {},
    timelineDates: [],
    current: [],
    selectedLocations: ['China', 'Italy', 'United States', 'Spain'],
    selectedColumn: 'activeCases',
    showTable: false,
  }),
  computed: {
    locations() {
      return Object.keys(this.timelines);
    },
    datasets() {
      return this.selectedLocations
        .map(name => ({
          label: name,
          data: this.timelines[name].map(item => (item ? item[this.selectedColumn] : null)),
          backgroundColor: this.$color.rgba(name, 0.2),
          borderColor: this.$color.rgba(name, 0.8),
        }));
    },
    columnDisclaimer() {
      const match = columns.find(column => column.value === this.selectedColumn);
      if (!match) {
        return '';
      }
      return match.disclaimer;
    },
  },
  watch: {
    selectedLocations() {
      this.$router.push({
        query: {
          ...this.$route.query,
          shown: this.selectedLocations,
        },
      });
    },
    selectedColumn() {
      this.$router.push({
        query: {
          ...this.$route.query,
          column: this.selectedColumn,
        },
      });
    },
  },
  mounted() {
    if (this.$route.query.shown) {
      if (Array.isArray(this.$route.query.shown)) {
        this.selectedLocations = this.$route.query.shown;
      } else {
        this.selectedLocations = [this.$route.query.shown];
      }
    }
    if (this.$route.query.column) {
      this.selectedColumn = this.$route.query.column;
    }
  },
  methods: {
    updateSelectedColumn(column) {
      this.selectedColumn = column.value;
    },
  },
};
</script>

<style>

</style>
