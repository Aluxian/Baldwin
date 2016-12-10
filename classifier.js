const {BayesClassifier} = require('natural');

const classifier = new BayesClassifier();
console.log('adding documents...');

// greetings
classifier.addDocument('hi', 'greeting');
classifier.addDocument('hello', 'greeting');
classifier.addDocument('good morning', 'greeting');
classifier.addDocument('good night', 'greeting');
classifier.addDocument('hey', 'greeting');

// how are you
classifier.addDocument('how are you', 'how_are_you');
classifier.addDocument('what\'s up?', 'how_are_you');

// fan stuff
classifier.addDocument('fan on', 'fan_on');
classifier.addDocument('fan off', 'fan_off');
classifier.addDocument('turn the fan on', 'fan_on');
classifier.addDocument('turn the fan off', 'fan_off');
classifier.addDocument('turn on the fan', 'fan_on');
classifier.addDocument('turn off the fan', 'fan_off');

// buzz on
classifier.addDocument('buzz for me', 'buzzer_on');
classifier.addDocument('buzz', 'buzzer_on');
classifier.addDocument('buzz please', 'buzzer_on');

// buzz off
classifier.addDocument('turn off the buzzer', 'buzzer_off');
classifier.addDocument('buzz off', 'buzzer_off');
classifier.addDocument('stop buzzing', 'buzzer_off');

// jokes
classifier.addDocument('tell me a joke', 'get_joke');

// love
classifier.addDocument('i love you', 'i_love_you');

console.log('training...');
classifier.train();

console.log('saving...');
classifier.save('classifier.json', function(err) {
  if (err) {
    throw err;
  }

  console.log('saved');
});
