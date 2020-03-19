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
          :data="data"
          @columnSelect="updateSelectedColumn"/>
      </section>
    </div>
  </div>
</template>

<script>
import csvParser from 'papaparse';
import LineChart from '../components/LineChart.vue';
import MultiSelect from '../components/MultiSelect.vue';
import LocationTable from '../components/LocationTable.vue';
import GithubCorner from '../components/GithubCorner.vue';
import populations from '../assets/populations';

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

function getPercentChange(currentValue, prevValue) {
  if (prevValue === 0) {
    return 0;
  }
  const diff = currentValue - prevValue;
  return Math.round((diff / prevValue) * 100);
}

function formatDate(str) {
  const d = new Date(str);
  return `${d.getFullYear()}-${fill(d.getMonth() + 1)}-${fill(d.getDate())}`;
}

export default {
  components: {
    LineChart,
    MultiSelect,
    LocationTable,
    GithubCorner,
  },
  async asyncData({ $axios }) {
    const confirmedUrl = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv';
    const deathsUrl = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Deaths.csv';
    const recoveredUrl = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Recovered.csv';
    let confirmedRaw;
    let deathsRaw;
    let recoveredRaw;
    try {
      [
        confirmedRaw,
        deathsRaw,
        recoveredRaw,
      ] = await Promise.all([
        $axios.get(confirmedUrl),
        $axios.get(deathsUrl),
        $axios.get(recoveredUrl),
      ]);
    } catch (err) {
      [
        confirmedRaw,
        deathsRaw,
        recoveredRaw,
      ] = await Promise.all([
        $axios.get('https://paul-em.github.io/covid-19-curves/fallbacks/confirmed.csv'),
        $axios.get('https://paul-em.github.io/covid-19-curves/fallbacks/deaths.csv'),
        $axios.get('https://paul-em.github.io/covid-19-curves/fallbacks/recovered.csv'),
      ]);
    }
    const rawData = {
      confirmed: csvParser.parse(confirmedRaw.data, {
        header: true,
        skipEmptyLines: true,
      }).data,
      deaths: csvParser.parse(deathsRaw.data, {
        header: true,
        skipEmptyLines: true,
      }).data,
      recovered: csvParser.parse(recoveredRaw.data, {
        header: true,
        skipEmptyLines: true,
      }).data,
    };
    const days = Object.keys(rawData.confirmed[0]).filter(i => ![
      'Province/State',
      'Country/Region',
      'Lat',
      'Long',
    ].includes(i)).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    const locationData = {};
    ['confirmed', 'deaths', 'recovered'].forEach((metric) => {
      rawData[metric].forEach((item) => {
        const location = item['Country/Region'];
        if (!locationData[location]) {
          locationData[location] = {};
        }
        days.forEach((day) => {
          if (!locationData[location][day]) {
            locationData[location][day] = {
              confirmed: 0,
              deaths: 0,
              recovered: 0,
            };
          }
          locationData[location][day][metric] += parseInt(item[day] || 0, 10);
        });
      });
    });
    const flatData = [];
    Object.keys(locationData).forEach((location) => {
      days.forEach((day) => {
        const dayData = locationData[location][day] || {
          confirmed: 0,
          deaths: 0,
          recovered: 0,
        };
        const prevDayData = locationData[location][getPrevDay(day)] || {
          confirmed: 0,
          deaths: 0,
          recovered: 0,
        };
        const newCases = dayData.confirmed - prevDayData.confirmed;
        const newDeaths = dayData.deaths - prevDayData.deaths;
        const newRecovered = dayData.recovered - prevDayData.recovered;
        let casesInMillion = null;
        let deathsInMillion = null;
        const population = populations[location];
        if (population) {
          casesInMillion = Math.round((dayData.confirmed / population) * 10000000) / 10;
          deathsInMillion = Math.round((dayData.deaths / population) * 10000000) / 10;
        }
        flatData.push({
          location,
          date: formatDate(day),
          active_cases: dayData.confirmed - dayData.recovered - dayData.deaths,
          new_cases: newCases,
          new_cases_percent: newCases ? getPercentChange(
            dayData.confirmed,
            prevDayData.confirmed,
          ) : 0,
          new_deaths: newDeaths,
          new_deaths_percent: newDeaths ? getPercentChange(dayData.deaths, prevDayData.deaths) : 0,
          total_cases: dayData.confirmed,
          total_deaths: dayData.deaths,
          cases_in_million: casesInMillion,
          deaths_in_million: deathsInMillion,
          cases_doubled: getDoubledValue(locationData[location], day, 'confirmed'),
          deaths_doubled: getDoubledValue(locationData[location], day, 'deaths'),
          new_recovered: newRecovered,
          total_recovered: dayData.recovered,
          recovered_percent: Math.round((dayData.recovered / dayData.confirmed) * 1000) / 10,
          deaths_percent: Math.round((dayData.deaths / dayData.confirmed) * 1000) / 10,
        });
      });
    });
    const worldData = [];
    flatData.forEach((item) => {
      let worldDataItem = worldData.find(i => i.date === item.date);
      if (!worldDataItem) {
        worldDataItem = {
          location: 'World',
          date: item.date,
          active_cases: 0,
          new_cases: 0,
          new_cases_percent: 0,
          new_deaths: 0,
          new_deaths_percent: 0,
          total_cases: 0,
          total_deaths: 0,
          cases_in_million: 0,
          deaths_in_million: 0,
          cases_doubled: 0,
          deaths_doubled: 0,
          new_recovered: 0,
          total_recovered: 0,
        };
        worldData.push(worldDataItem);
      }
      worldDataItem.active_cases += item.active_cases;
      worldDataItem.new_cases += item.new_cases;
      worldDataItem.new_deaths += item.new_deaths;
      worldDataItem.total_cases += item.total_cases;
      worldDataItem.total_deaths += item.total_deaths;
      worldDataItem.new_recovered += item.new_recovered;
      worldDataItem.total_recovered += item.total_recovered;
    });
    return {
      data: [
        ...worldData.map(item => ({
          ...item,
          cases_in_million: Math.round((item.total_cases / populations.World) * 10000000) / 10,
          deaths_in_million: Math.round((item.total_deaths / populations.World) * 10000000) / 10,
          recovered_percent: Math.round((item.total_recovered / item.total_cases) * 1000) / 10,
          deaths_percent: Math.round(
            (item.total_deaths / item.total_cases) * 1000,
          ) / 10,
        })),
        ...flatData,
      ],
    };
  },
  data: () => ({
    data: [],
    selected: ['World', 'China', 'Italy', 'US'],
    selectedColumn: {
      value: 'active_cases',
      label: 'Active Cases',
    },
  }),
  computed: {
    lastUpdate() {
      return this.dates[this.dates.length - 1];
    },
    filteredData() {
      return this.data.filter(item => this.selected.includes(item.location));
    },
    dates() {
      const allDates = [];
      this.data.forEach((item) => {
        if (!allDates.includes(item.date)) {
          allDates.push(item.date);
        }
      });
      return allDates.sort();
    },
    datasets() {
      const totalCases = {};
      this.filteredData
        .forEach((item) => {
          if (!totalCases[item.location]) {
            totalCases[item.location] = this.getEmptyDataset();
          }
          const index = this.dates.indexOf(item.date);
          totalCases[item.location][index] = item[this.selectedColumn.value];
        });
      return Object.keys(totalCases).map(location => ({
        label: location,
        data: totalCases[location],
        backgroundColor: this.$color.rgba(location, 0.2),
        borderColor: this.$color.rgba(location, 0.8),
      }));
    },
  },
  methods: {
    getEmptyDataset() {
      return this.dates.map(() => 0);
    },
    updateSelectedColumn(column) {
      this.selectedColumn = column;
    },
  },
};
</script>

<style>

</style>
