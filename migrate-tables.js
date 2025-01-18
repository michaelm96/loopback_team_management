// migrate-tables.js

'use strict';

const server = require('./server/server'); // Adjust path if needed
const ds = server.dataSources.postgresql; // Replace 'db' with your datasource name

function autoUpdateAll() {
  const models = ['Team', 'Member']; // Add all your models here

  models.forEach((model) => {
    ds.autoupdate(model, (err) => {
      if (err) {
        console.error(`Error updating model ${model}:`, err);
        return process.exit(1);
      }
      console.log(`Model ${model} updated successfully.`);
    });
  });

  ds.disconnect();
}

// Run the script
autoUpdateAll();
