import countryNames from '../assets/countryNames.json';

const dataSource = 'https://coronadatascraper.cors-everywhere.workers.dev/';

function getPercentChange(currentValue, prevValue) {
  if (prevValue === 0) {
    return 0;
  }
  const diff = currentValue - prevValue;
  return Math.round((diff / prevValue) * 100);
}

function getDoubledValue(prevItems, metric, currentValue) {
  const half = currentValue / 2;
  let dayCounter;
  let found = false;
  for (dayCounter = 1; dayCounter <= prevItems.length; dayCounter += 1) {
    const item = prevItems[prevItems.length - dayCounter];
    if (item && item[metric] <= half) {
      found = true;
      break;
    }
  }
  if (!found) {
    return null;
  }
  return dayCounter;
}

const mildCasesRecoveryTime = 10;
const servereCasesRecoveryTime = 30;
const servereRate = 0.2;

function estimateNewRecovered(prevItems, newDeaths) {
  let mildCases = 0;
  const mildCasesInfectDay = prevItems[prevItems.length - mildCasesRecoveryTime];
  if (mildCasesInfectDay) {
    mildCases = mildCasesInfectDay.newCases * (1 - servereRate);
  }
  let servereCases = 0;
  const servereCasesInfectDay = prevItems[prevItems.length - servereCasesRecoveryTime];
  if (servereCasesInfectDay) {
    servereCases = servereCasesInfectDay.newCases * servereRate;
  }
  return Math.round(mildCases + servereCases) - newDeaths;
}


function prepareTimelineItem(population, item, prevItems) {
  if (!item) {
    return null;
  }
  const preparedItem = {
    cases: item.cases || 0,
    deaths: item.deaths || 0,
    ...item,
  };
  preparedItem.casesDoubled = getDoubledValue(prevItems, 'cases', preparedItem.cases);
  preparedItem.deathsDoubled = getDoubledValue(prevItems, 'deaths', preparedItem.deaths);
  const prevItem = prevItems[prevItems.length - 1];
  if (prevItem) {
    preparedItem.newCases = preparedItem.cases - prevItem.cases;
    preparedItem.newCasesPercent = preparedItem.cases
      ? getPercentChange(preparedItem.cases, prevItem.cases)
      : 0;
    preparedItem.newDeaths = preparedItem.deaths - prevItem.deaths;
    preparedItem.newDeathsPercent = preparedItem.deaths
      ? getPercentChange(preparedItem.deaths, prevItem.deaths)
      : 0;
  } else {
    preparedItem.newCases = preparedItem.cases;
    preparedItem.newDeaths = preparedItem.deaths;
  }
  if (population) {
    preparedItem.casesInMillion = Math.round(
      (preparedItem.cases / population) * 10000000,
    ) / 10;
    preparedItem.deathsInMillion = Math.round(
      (preparedItem.deaths / population) * 10000000,
    ) / 10;
  }
  if (!preparedItem.deaths) {
    preparedItem.deathsPercent = 0;
  } else {
    preparedItem.deathsPercent = Math.round(
      (preparedItem.deaths / preparedItem.cases) * 10000,
    ) / 100;
  }

  preparedItem.newRecovered = estimateNewRecovered(
    prevItems,
    preparedItem.newDeaths,
  );
  if (Number.isNaN(preparedItem.newDeaths)) {
    console.log('newDeaths is NaN', preparedItem.deaths, prevItem);
  }
  if (prevItem) {
    preparedItem.recovered = prevItem.recovered + preparedItem.newRecovered;
  } else {
    preparedItem.recovered = 0;
  }

  preparedItem.recoveredPercent = Math.round(
    (preparedItem.recovered / preparedItem.cases) * 1000,
  ) / 10;

  preparedItem.activeCases = preparedItem.cases - preparedItem.deaths - preparedItem.recovered;
  if (prevItem) {
    preparedItem.newActiveCases = preparedItem.activeCases - prevItem.activeCases;
  } else {
    preparedItem.newActiveCases = preparedItem.activeCases;
  }

  if (population) {
    preparedItem.activeCasesInMillion = Math.round(
      (preparedItem.activeCases / population) * 10000000,
    ) / 10;
  }

  return preparedItem;
}

function getCountryDataFromRegions(data, country, population) {
  const regions = Object.keys(data)
    .filter(location => data[location].country === country);
  const dates = {};
  regions.forEach((region) => {
    const regionData = data[region];
    Object.keys(regionData.dates).forEach((date) => {
      if (!dates[date]) {
        dates[date] = {
          cases: 0,
          deaths: 0,
        };
      }
      dates[date].cases += (regionData.dates[date].cases || 0);
      dates[date].deaths += (regionData.dates[date].deaths || 0);
    });
  });
  return {
    dates,
    country,
    population,
    url: 'https://github.com/CSSEGISandData/COVID-19',
  };
}

export default ({ $axios }, inject) => {
  inject('loader', {
    async loadCases() {
      const raw = await $axios.get(dataSource);
      const { data } = raw;
      const dates = [];
      Object.keys(data).forEach((location) => {
        const locationDates = Object.keys(data[location].dates);
        locationDates.forEach((date) => {
          if (!dates.includes(date)) {
            dates.push(date);
          }
        });
      });
      const sortedDates = dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

      // somehow china as whole is missing
      if (!data.CHN) {
        data.CHN = getCountryDataFromRegions(data, 'CHN', 1437843661);
      }

      const timelines = {};
      Object
        .keys(data)
        .forEach((location) => {
          const name = countryNames[location] || location;
          timelines[name] = [];
          sortedDates.forEach((date) => {
            const locationData = data[location];
            const current = locationData.dates[date];
            timelines[name].push(
              prepareTimelineItem(locationData.population, current, timelines[name]),
            );
          });
        });

      const current = Object
        .keys(data)
        .map((location) => {
          const name = countryNames[location] || location;
          const latestItem = timelines[name][sortedDates.length - 1];
          if (!latestItem || !latestItem.cases) {
            return null;
          }
          return {
            ...data[location],
            ...latestItem,
            name,
            location,
            population: data[location].population || 0,
          };
        })
        .filter(item => !!item);
      return {
        timelines,
        timelineDates: sortedDates,
        current,
      };
    },
  });
};
