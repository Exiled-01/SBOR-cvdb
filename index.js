const express = require('express');
const path = require('path');
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

// Helper to require JSON files
function loadJSON(relativePath) {
  return require(path.join(__dirname, 'public/items', relativePath));
}

app.get('/', (req, res) => {
  const items = {
    weapons: {
      onehanded: loadJSON('weapons/onehanded.json'),
      twohanded: loadJSON('weapons/twohanded.json'),
      rapier: loadJSON('weapons/rapier.json'),
      dagger: loadJSON('weapons/dagger.json'),
      melee: loadJSON('weapons/melee.json'),
    },
    protective: {
      armor: loadJSON('protective/outfit.json'),
      upperheadwear: loadJSON('protective/upperheadwear.json'),
      lowerheadwear: loadJSON('protective/lowerheadwear.json'),
      shield: loadJSON('protective/shield.json'),
    }
  };

  res.render('index', { items });
});

app.listen(3000, () => console.log('✅ Server running on http://localhost:3000'));
