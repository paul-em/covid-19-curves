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
          :labels="dates"
        />
      </section>
      <section class="flex flex-col">
        <location-table
          v-model="selected"
          :data="latest"
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

/*
function fill(num) {
  if (num < 10) {
    return `0${num}`;
  }
  return `${num}`;
}

function getPrevDay(str) {
  const d = new Date(str);
  const prev = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1);
  return `${prev.getMonth() + 1}/${prev.getDate()}/${prev.getFullYear() - 2000}`;
}

function getDoubledValue(timeline, day, metric) {
  const value = timeline[day][metric];
  const half = value / 2;
  let currentDay = getPrevDay(day);
  let dayCounter = 1;
  let found = false;
  while (timeline[currentDay]) {
    if (timeline[currentDay][metric] < half) {
      found = true;
      break;
    }
    currentDay = getPrevDay(currentDay);
    dayCounter += 1;
  }
  if (!found) {
    return null;
  }
  return dayCounter;
}

*/
function getPercentChange(currentValue, prevValue) {
  if (prevValue === 0) {
    return 0;
  }
  const diff = currentValue - prevValue;
  return Math.round((diff / prevValue) * 100);
}

export default {
  components: {
    LineChart,
    MultiSelect,
    LocationTable,
    GithubCorner,
  },
  async asyncData({ $axios }) {
    const url = 'https://coronadatascraper.com/timeseries-byLocation.json';
    let raw;
    try {
      raw = await $axios.get(url);
    } catch (err) {
      raw = await $axios.get(`https://nameless-shadow-474c.cors-everywhere.workers.dev/?${url}`);
    }
    const { data } = raw;
    const dates = [];
    const latest = [];
    Object.keys(data).forEach((location) => {
      const locationDates = Object.keys(data[location].dates);
      locationDates.forEach((date) => {
        if (!dates.includes(date)) {
          dates.push(date);
        }
      });
      const preLatestDate = locationDates[locationDates.length - 2];
      const latestDate = locationDates[locationDates.length - 1];
      if (!data[location].dates[latestDate].cases) {
        return;
      }
      const latestData = {
        name: location,
        ...data[location].dates[latestDate],
        population: parseInt(data[location].population || 0, 10),
      };
      const preLatestData = data[location].dates[preLatestDate];
      if (preLatestData) {
        latestData.newCases = (latestData.cases || 0) - (preLatestData.cases || 0);
        latestData.newCasesPercent = latestData.cases
          ? getPercentChange(latestData.cases, preLatestData.cases)
          : 0;
      } else {
        latestData.newCases = latestData.cases;
      }
      if (latestData.population) {
        latestData.casesInMillion = Math.round(
          (latestData.cases / latestData.population) * 10000000,
        ) / 10;
      }
      latest.push(latestData);
    });
    const timelines = Object.keys(data).map(name => ({
      name,
      ...data[name],
    }));


    return {
      timelines,
      latest,
      dates: dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime()),
    };
  },
  data: () => ({
    timelines: [],
    latest: [],
    dates: [],
    selected: ['Hubei, CHN', 'ITA', 'USA'],
    selectedColumn: 'active',
  }),
  computed: {
    lastUpdate() {
      return this.dates[this.dates.length - 1];
    },
    datasets() {
      return this.timelines
        .filter(timeline => this.selected.includes(timeline.name))
        .map(timeline => ({
          label: timeline.name,
          data: this.mapDates(timeline.dates),
          backgroundColor: this.$color.rgba(timeline.name, 0.2),
          borderColor: this.$color.rgba(timeline.name, 0.8),
        }));
    },
  },
  methods: {
    mapDates(dates) {
      console.log(this.dates, dates);
      return this.dates.map(date => (dates[date] ? dates[date][this.selectedColumn] || 0 : 0));
    },
    updateSelectedColumn(column) {
      this.selectedColumn = column;
    },
  },
};
</script>

<style>

</style>
