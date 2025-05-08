// tripNet-backend/scripts/merge-json.js
const fs = require('fs');
const path = require('path');

const tickets = require('../04-json/tickets.json');

const result = {
  tickets,
};

fs.writeFileSync(
  path.join(__dirname, '../db.json'),
  JSON.stringify(result, null, 2)
);

console.log('✅ db.json 갱신 완료!');
