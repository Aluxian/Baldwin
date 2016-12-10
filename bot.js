const SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');
const TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');
const {Detector, Models} = require('snowboy');
const GoogleSpeech = require('google-cloud').speech;
const SerialPort = require('serialport');
const PlaySound = require('play-sound');
const Aplay = require('aplay');
const AWS = require('aws-sdk');
const request = require('request');
const rec = require('node-record-lpcm16');
const fs = require('fs');

// quickfix
let playDanceMusic = false;

// settings
const LISTEN_TIME = 10000;

// AWS Polly
const polly = new AWS.Polly({
  region: 'us-east-1'
});

// microbits
const microbit1 = new SerialPort('/dev/ttyACM0', {baudRate: 9600});

// microbits init
microbit1LastCode = null;
microbit1.on('open', (err) => {
  if (err) {
    throw err;
  }

  sendCodeToMicrobit('S', microbit1);
});

// IBM STT
const stt = new SpeechToTextV1({
  username: process.env.IBM_USERNAME_STT,
  password: process.env.IBM_PASSWORD_STT
});
const tts = new TextToSpeechV1({
  username: process.env.IBM_USERNAME_TTS,
  password: process.env.IBM_PASSWORD_TTS
});

// return a random element from the list
function randomPhrase(list) {
  // returns a random integer between min (included) and max (excluded)
  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  return list[getRandomInt(0, list.length)];
}

// generate an affirmative reply
function affirmativeReply() {
  return randomPhrase([
    'ok',
    'sure',
    'consider it done',
    'poof! magic'
  ]);
}

// // reply accordingly
// function getResponseFromText(input) {
//   console.log('generating reply...');
//
//   if (input.match(/(say hi to the audience)/g)) {
//     return randomPhrase([
//       'hello, audience!'
//     ]);
//   }
//
//   if (input.match(/(hello|hi|hey)/g)) {
//     return randomPhrase([
//       'hi, hello there!',
//       'how are you?',
//       'go away, i\'m busy playing chess'
//     ]);
//   }
//
//   if (input.match(/how are you/g)) {
//     return randomPhrase([
//       'ah, nothing serious. just planning to take over the world. you?',
//       'stop asking',
//       'me? how are you! your house is on fire... ... ... ... ... nah, just kidding!'
//     ]);
//   }
//
//   if (input.match(/(fan on|turn the fan on|turn on the fan|)/g)) {
//     console.log('input matched fan on');
//     sendCodeToMicrobit('F', microbit1);
//     return affirmativeReply();
//   }
//
//   if (input.match(/(fan off|turn the fan off|turn off the fan)/g)) {
//     console.log('input matched fan off');
//     sendCodeToMicrobit('G', microbit1);
//     return affirmativeReply();
//   }
//
//   if (input.match(/(buzzer on|turn the buzzer on|turn on the buzzer)/g)) {
//     sendCodeToMicrobit('A', microbit1);
//     return affirmativeReply();
//   }
//
//   if (input.match(/(buzzer off|turn the buzzer off|turn off the buzzer)/g)) {
//     sendCodeToMicrobit('B', microbit1);
//     return affirmativeReply();
//   }
//
//   if (input.match(/tell.+joke/g)) {
//     return randomPhrase([
//       'knock knock... i forgot the rest',
//       'what do you call a board without a processor? ARMless. haha ha haha'
//     ]);
//   }
//
//   if (input.match(/i love you/g)) {
//     sendCodeToMicrobit('H', microbit1);
//     return randomPhrase([
//       'awww that is soo sweet'
//     ]);
//   }
//
//   if (input.match(/(music on|play.+music)/g)) {
//     sendCodeToMicrobit('M', microbit1);
//     return affirmativeReply();
//   }
//
//   if (input.match(/(music off|stop.+music)/g)) {
//     sendCodeToMicrobit('N', microbit1);
//     return affirmativeReply();
//   }
//
//   return randomPhrase([
//     'say that again?',
//     'could you repeat that?',
//     'do as you like, but i just simply can\'t understand what you\'re saying',
//     'go away. stop humiliating me.',
//     'i don\'t know what you mean by `' + input + '`'
//   ]);
// }

// return the time in hh:mm format
function getTime() {
    const date = new Date();

    let hour = date.getHours();
    hour = (hour < 10 ? '0' : '') + hour;

    let min  = date.getMinutes();
    min = (min < 10 ? '0' : '') + min;

    return hour + ':' + min;
}

// reply accordingly
function getResponseFromEntities(entities = {}, _text) {
  console.log('generating reply...');
  const intent = entities.intent && entities.intent[0] && entities.intent[0].value;

  switch (intent) {
    case 'say_hi_audience':
      return randomPhrase([
        'hello, audience! you look great today'
      ]);

    case 'greeting':
      return randomPhrase([
        'hi, hello there!',
        'go away, i\'m busy playing chess'
      ]);

    case 'fan_on':
      sendCodeToMicrobit('F', microbit1);
      return affirmativeReply();

    case 'fan_off':
      sendCodeToMicrobit('G', microbit1);
      return affirmativeReply();

    case 'buzzer_on':
      sendCodeToMicrobit('A', microbit1);
      return affirmativeReply();

    case 'buzzer_off':
      sendCodeToMicrobit('B', microbit1);
      return affirmativeReply();

    case 'music_on':
      sendCodeToMicrobit('M', microbit1);
      return affirmativeReply();

    case 'music_off':
      sendCodeToMicrobit('N', microbit1);
      return affirmativeReply();

    case 'all_off':
      sendCodeToMicrobit('N', microbit1);
      sendCodeToMicrobit('B', microbit1);
      sendCodeToMicrobit('G', microbit1);
      return affirmativeReply();

    case 'are_you_santa':
      return randomPhrase([
          'i could be... why?',
          'do I look like Santa?',
          'why, do you want some coal again?'
      ]);

    case 'is_santa_real':
      return randomPhrase([
          'he\'s as real as you, and me'
      ]);

    case 'tell_joke':
      return randomPhrase([
        'knock knock... i forgot the rest',
        'what do you call a board without a processor? ARMless. haha ha haha'
      ]);

    case 'throw_party':
      playDanceMusic = true;
      return randomPhrase([
        'i thought you\'d never ask! here you go, baby'
      ]);

    case 'count_beers':
      return randomPhrase([
        'infinite. from me, for you, from Paris',
      ]);

    case 'how_are_you':
      return randomPhrase([
        'ah, nothing serious. just planning to take over the world. you?',
        'stop asking',
        'me? how are you! your house is on fire... ... ... ... ... nah, just kidding!'
      ]);

    case 'get_weather':
      return randomPhrase([
        'it is dead cold. do not go outside. i repeat, do not go outside',
        'i can\'t feel my bones! oh wait. wires!'
      ]);

    case 'instanceof_bad':
      return 'it is not bad, but should be avoided';

    case 'get_plants_status':
      return randomPhrase([
        'your plants are healthy and well-hydrated. well done!'
      ]);

    case 'zero_question':
      return randomPhrase([
        'zero (dumbass)'
      ]);

    case 'i_love_you':
      sendCodeToMicrobit('H', microbit1);
      return randomPhrase([
        'awww that is soo sweet'
      ]);

    case 'ask_best_superhero':
      return randomPhrase([
        'i like ironman'
      ]);

    case 'best_assistant':
      return 'wait. there are other assistants?';

    case 'make_me_sandwich':
      return 'poof! you\'re a sandwich';

    case 'get_time':
      return 'it is ' + getTime();

    case 'who_are_you':
      return randomPhrase([
        'My name is Baldwin. Friends call me mighty Baldwin. I am a voice assistant, a smart one obviously. I can control your home and everything inside it. I could even control you, but Alex said I\'m not allowed.'
      ]);

    case 'ask_best_superhero':
      return randomPhrase([
        'i like ironman'
      ]);

    default:
      return randomPhrase([
        'say that again?',
        'could you repeat that?',
        'do as you like, but i just simply can\'t understand what you\'re saying',
        'go away. stop humiliating me.',
        'i don\'t know what you mean by `' + _text + '`'
      ]);
  }
}

// // speak some text with IBM TTS
// function sayTextIbm(text) {
//   console.log('saying text with IBM TTS:', text);
//
//   const params = {
//     text: text,
//     voice: 'en-US_MichaelVoice',
//     accept: 'audio/wav'
//   };
//
//   tts.synthesize(params)
//     .on('end', () => {
//       console.log('playing output...');
//
//       const aplay = new Aplay();
//       aplay.play('./tmp/output.wav');
//       aplay.on('complete', () => {
//         console.log('playing complete');
//         sendCodeToMicrobit('S', microbit1);
//         listenForHotword();
//       });
//     })
//     .pipe(fs.createWriteStream('./tmp/output.wav'));
// }

// speak some text with AWS Polly
function sayTextAws(text) {
  console.log('saying text with AWS Polly:', text);

  const params = {
    Text: text,
    OutputFormat: 'mp3',
    VoiceId: 'Geraint'
  };

  const synthCallback = (err, data) => {
    if (err) {
      throw err;
    }

    fs.writeFile('./tmp/output.mp3', data.AudioStream, (err) => {
      if (err) {
        throw err;
      }

      console.log('wrote output.mp3');
      console.log('playing output...');

      const player = PlaySound();
      player.play('./tmp/output.mp3', function(err) {
        if (err) {
          throw err;
        }

        console.log('playing complete');

        if (playDanceMusic) {
          const player = PlaySound();
          player.play('/home/pi/dance_short.mp3', function(err) {
            if (err) {
              throw err;
            }

            setTimeout(() => {
              sendCodeToMicrobit('S', microbit1);
              listenForHotword();
            }, 6000);
          });
          playDanceMusic = false;
        } else {
          sendCodeToMicrobit('S', microbit1);
          listenForHotword();
        }
      });
    });
  };

  polly.synthesizeSpeech(params, synthCallback);
}

// // get the text from IBM STT and reply
// function processTranscription(transcription) {
//   console.log('processing transcription...');
//
//   if (!transcription) {
//     console.log('transcription is empty, skipping');
//     sendCodeToMicrobit('S', microbit1);
//     listenForHotword();
//     return;
//   }
//
//   sayTextAws(getResponseFromText(transcription.toLowerCase()));
// }

// // stream audio to watson, get back text
// function streamToWatson() {
//   console.log('streaming to IBM stt...');
//   let transcription = '';
//
//   rec.start({threshold: 0})
//     .pipe(stt.createRecognizeStream({ content_type: 'audio/wav' }))
//     .on('data', (chunk) => transcription += chunk)
//     .on('end', () => {
//       console.log('IBM stt streaming stopped');
//       console.log('transcription:', transcription);
//       processTranscription(transcription);
//     });
//
//   setTimeout(() => {
//     console.log('stopping IBM stt stream...');
//     if (microbit1LastCode != 'H') {
//       sendCodeToMicrobit('P', microbit1);
//     }
//     new Aplay().play('./sounds/dong.wav');
//     rec.stop();
//   }, LISTEN_TIME);
// }

// send the input to wit.ai for NLU parsing
function processTranscriptionWitParse(input) {
  if (!input) {
    console.log('input is empty, skipping');
    sendCodeToMicrobit('S', microbit1);
    listenForHotword();
    return;
  }

  const onGetReqEnd = (err, resp, body) => {
    if (err) {
      throw err;
    }

    console.log('got response from wit.ai', JSON.stringify(body));
    sayTextAws(getResponseFromEntities(body.entities, body._text));
  };

  const getReq = request.post({
    url: 'https://api.wit.ai/message',
    qs: {
      v: '20161203',
      q: input.substr(0, 255)
    },
    headers: {
      'Authorization': 'Bearer ' + process.env.WIT_AI_TOKEN
    },
    json: true
  }, onGetReqEnd);
}

// stream audio to google, get back text
function streamToGoogle() {
  console.log('streaming to Google Speech API...');
  let transcription = '';
  let timeoutId = null;

  const speech = GoogleSpeech();
  const options = {
    config: {
      encoding: 'LINEAR16',
      sampleRate: 16000
    }
  };

  rec.start({threshold: 0, sampleRate: 16000})
    .pipe(speech.createRecognizeStream(options))
    .on('data', (chunk) => {
      console.log('google chunk of data:', chunk);
      if (chunk && chunk.results) {
        transcription += chunk.results;
      }
      if (chunk && chunk.endpointerType === 'END_OF_SPEECH') {
        clearTimeout(timeoutId);
        console.log('Google Speech API detected end of speech...');
        if (microbit1LastCode != 'H') {
          sendCodeToMicrobit('P', microbit1);
        }
        new Aplay().play('./sounds/dong.wav');
        rec.stop();
      }
    })
    .on('end', () => {
      console.log('Google Speech API streaming stopped');
      console.log('transcription:', transcription);

      if (transcription.indexOf('speak') === 0) {
        sayTextAws(transcription.substr('speak'.length).trim());
      } else {
        // processTranscription(transcription);
        processTranscriptionWitParse(transcription);
      }
    });

  timeoutId = setTimeout(() => {
    console.log('stopping Google Speech API stream...');
    if (microbit1LastCode != 'H') {
      sendCodeToMicrobit('P', microbit1);
    }
    new Aplay().play('./sounds/dong.wav');
    rec.stop();
  }, LISTEN_TIME);
}

// // stream audio to witAi, get back text
// function streamToWitAi() {
//   console.log('streaming to wit.ai...');
//
//   const onPostReqEnd = (err, resp, body) => {
//     if (err) {
//       throw err;
//     }
//
//     console.log('got response from wit.ai', JSON.stringify(body));
//     sayTextAws(getResponseFromEntities(body.entities, body._text));
//   };
//
//   const postReq = request.post({
//     url: 'https://api.wit.ai/speech?v=20161203',
//     headers: {
//       'Authorization': 'Bearer ' + process.env.WIT_AI_TOKEN,
//       'Content-Type': 'audio/wav'
//     },
//     json: true
//   }, onPostReqEnd);
//
//   rec.start({threshold: 0})
//     .pipe(postReq)
//     .on('end', () => console.log('wit.ai streaming stopped'));
//
//   setTimeout(() => {
//     console.log('stopping wit.ai stream...');
//     if (microbit1LastCode != 'H') {
//       sendCodeToMicrobit('P', microbit1);
//     }
//     new Aplay().play('./sounds/dong.wav');
//     rec.stop();
//   }, LISTEN_TIME);
// }

// send a code to serial
function sendCodeToMicrobit(code, mbit, callback, callbackDelay) {
  mbit.write(code, (err) => {
    if (err) {
      throw err;
    }

    console.log('sent ' + code + ' to microbit1');
    microbit1LastCode = code;

    if (callback) {
      setTimeout(callback, callbackDelay);
    }
  });
}

// listen for the hotword
function listenForHotword() {
  console.log('listening for hotword...');

  // Snowboy models
  const models = new Models();
  models.add({
    file: './snowboy/baldwin.pmdl',
    sensitivity: '0.6',
    hotwords: 'baldwin'
  });

  // Snowboy detector
  const detector = new Detector({
    resource: './snowboy/common.res',
    models: models,
    audioGain: 2.0
  });

  detector.on('hotword', (index, hotword) => {
    console.log('detected hotword', index, hotword);

    sendCodeToMicrobit('W', microbit1, () => {
      sendCodeToMicrobit('C', microbit1);
    }, 1000);

    rec.stop().on('end', () => {
      console.log('hotword streaming stopped');
      new Aplay().play('./sounds/ding.wav');
      // streamToWatson();
      // streamToWitAi();
      streamToGoogle();
    });
  });

  rec.start({threshold: 0}).pipe(detector);
}

// start
listenForHotword();
// sayTextAws('happy birthday to you. happy birthday to you. happy birthday Alex');
