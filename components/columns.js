const recoveredDisclaimer = 'Recovered and active cases are caluclated by assuming recovery times of 10 days for mild cases and 30 days for servere cases as well as a serverity rate of 20%';


function formatNumber(num) {
  if (!num) {
    return '';
  }
  return Math.floor(num).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}


export default [
  {
    label: 'Total Cases',
    value: 'cases',
    formatter: row => formatNumber(row.cases),
    width: 75,
  },
  {
    label: 'New Cases',
    value: 'newCases',
    width: 90,
    formatter: row => (row.newCases > 1 ? `+${formatNumber(row.newCases)}` : ''),
    serverity: (row) => {
      if (!row.population) {
        return 0;
      }
      return Math.min(1, (row.newCases / row.population) * 100000);
    },
  },
  {
    label: '% New Cases',
    value: 'newCasesPercent',
    width: 90,
    formatter: row => (row.newCasesPercent > 1 ? `${row.newCasesPercent}%` : ''),
    serverity: row => Math.min(1, row.newCasesPercent / 30),
  },
  {
    label: 'Total Cases / Million',
    value: 'casesInMillion',
    width: 75,
    serverity: row => row.casesInMillion / 500,
  },
  {
    label: 'Cases Doubled',
    value: 'casesDoubled',
    width: 75,
    formatter: (row) => {
      if (row.casesDoubled > 1) {
        return `${row.casesDoubled} days`;
      }
      if (row.casesDoubled === 1) {
        return '1 day';
      }
      return '';
    },
  },
  {
    label: 'Total Deaths',
    value: 'deaths',
    formatter: row => formatNumber(row.deaths),
    width: 75,
  },
  {
    label: 'New Deaths',
    value: 'newDeaths',
    width: 75,
    formatter: row => (row.newDeaths > 0 ? `+${row.newDeaths}` : ''),
    serverity: (row) => {
      if (!row.population) {
        return 0;
      }
      return Math.min(1, (row.newDeaths / row.population) * 100000);
    },
  },
  {
    label: '% Deaths',
    value: 'deathsPercent',
    width: 75,
    formatter: row => (row.deathsPercent > 0 ? `${row.deathsPercent}%` : ''),
    serverity: row => Math.min(1, row.deathsPercent / 10),
  },
  {
    label: '% New Deaths',
    value: 'newDeathsPercent',
    width: 90,
    formatter: row => (row.newDeathsPercent > 1 ? `${row.newDeathsPercent}%` : ''),
    serverity: row => Math.min(1, row.newDeathsPercent / 30),
  },
  {
    label: 'Deaths Doubled',
    value: 'deathsDoubled',
    width: 75,
    formatter: (row) => {
      if (row.deathsDoubled > 1) {
        return `${row.deathsDoubled} days`;
      }
      if (row.deathsDoubled === 1) {
        return '1 day';
      }
      return '';
    },
  },
  {
    label: 'Reported Active Cases',
    value: 'reportedActiveCases',
    formatter: row => formatNumber(row.reportedActiveCases),
    width: 75,
  },
  {
    label: 'Active Cases *',
    value: 'activeCases',
    formatter: row => formatNumber(row.activeCases),
    width: 75,
    disclaimer: recoveredDisclaimer,
  },
  {
    label: 'Active Cases change *',
    value: 'newActiveCases',
    width: 75,
    formatter: row => (row.newActiveCases > 0 ? `+${row.newActiveCases}` : ''),
    serverity: (row) => {
      if (!row.population) {
        return 0;
      }
      return Math.min(1, (row.newActiveCases / row.population) * 100000);
    },
    disclaimer: recoveredDisclaimer,
  },
  {
    label: 'Active Cases / Million *',
    value: 'activeCasesInMillion',
    width: 75,
    serverity: row => row.activeCasesInMillion / 500,
    disclaimer: recoveredDisclaimer,
  },
  {
    label: 'New Recovered *',
    value: 'newRecovered',
    width: 75,
    formatter: row => (row.newRecovered > 1 ? `+${row.newRecovered}` : ''),
    serverity: (row) => {
      if (!row.population) {
        return 0;
      }
      return -Math.min(1, (row.newRecovered / row.population) * 100000);
    },
    disclaimer: recoveredDisclaimer,
  },
  {
    label: 'Total Recovered *',
    value: 'recovered',
    width: 75,
  },
  {
    label: '% Recovered *',
    value: 'recoveredPercent',
    width: 75,
    formatter: row => (row.recoveredPercent > 0 ? `${row.recoveredPercent}%` : ''),
    disclaimer: recoveredDisclaimer,
  },
];
