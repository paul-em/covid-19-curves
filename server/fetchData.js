const axios = require('axios');
const parseCsv = require('csv-parse/lib/sync');

const url = 'https://covid.ourworldindata.org/data/full_data.csv';
const cacheTimeout = 1000 * 60 * 10; // 10 minute cache timeout

let cache = null;
let lastUpdated = null;

async function update() {
  const csv = await axios.get(url);
  cache = parseCsv(csv.data, {
    from: 2,
  }).map(itemArr => ({
    date: itemArr[0],
    location: itemArr[1],
    newCases: parseInt(itemArr[2] || 0, 10),
    newDeaths: parseInt(itemArr[3] || 0, 10),
    totalCases: parseInt(itemArr[4] || 0, 10),
    totalDeaths: parseInt(itemArr[5] || 0, 10),
  }));
  lastUpdated = Date.now();
}

module.exports = async () => {
  if (!lastUpdated || lastUpdated < Date.now() + cacheTimeout) {
    await update();
  }
  return cache;
};
