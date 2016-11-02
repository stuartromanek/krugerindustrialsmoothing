function Costanza() {

  var self = this;

  var assetPath = 'assets/';
  var $canvas = $('.canvas');
  var $body = $('body');
  var $blackout = $('.wild-out');

  var backgroundPath = assetPath + 'backgrounds/';
  var backgroundTemplate = document.createElement('div');
      backgroundTemplate.setAttribute('class', 'background');

  var soundPath = assetPath + 'sounds/';
  var soundBuffer = null;

  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  
  var riffContext = new AudioContext();
  var riffGainNode = riffContext.createGain();
      riffGainNode.gain.value = 1.2;

  var laughContext = new AudioContext();
  var laughGainNode = laughContext.createGain();
      laughGainNode.gain.value = 0.3;


  self.init = function(state) {

    self.setupAudio(tracks, laughs, function(){

      // backgrounds
      self.setupBackgrounds(backgrounds);
      self.resetBackground(state);

      // key press bindings
      $body.on('keydown', function(e) {
        self.keys(state, e);
      });

      $body.on('click', '.expand', function(e) {
        $blackout.toggleClass('active');
        $('.stuart').toggleClass('active');
      });

      var timeout = window.setTimeout(function() {
        // remove instructions
        $blackout.toggleClass('active');
        $('.instructions').toggleClass('active');
      }, 6000);
    });


  }

  self.keys = function(state, e) {

    if (e.keyCode === 32) {
      self.riff(state);
    }
    else if (
      e.keyCode === 37 ||
      e.keyCode === 38 ||
      e.keyCode === 39 ||
      e.keyCode === 40
    ) {
      self.laugh(state);
    }

    state.keys.keydownsPressed++;
    if (state.keys.keydownsPressed === state.keys.keydownsToSwitchBackground) {
      self.resetBackground(state);
    }
  }

  self.mouse = function(state) {
    self.laugh(state);
  }

  self.playAudio = function(audio, context, gainNode, state) {
    if (state && state.track.lastTrack) {
      state.track.lastTrack.source.stop(); 
    }
    audio.source = context.createBufferSource();
    audio.source.buffer = audio.buffer;
    audio.source.connect(gainNode);
    gainNode.connect(context.destination);

    audio.source.start(0);
  }

  self.riff = function(state) {

    self.playAudio(state.track.currentTrack, riffContext, riffGainNode, state);
    state.track.lastTrack = state.track.currentTrack;
    state.track.currentTrack = _.shuffle(tracks)[0];
  }

  self.laugh = function(state) {
    var which = self.randomInt(1, laughs.length - 1);
    self.playAudio(laughs[which], laughContext, laughGainNode);
  }


  self.setupBackgrounds = function(backgrounds) {
    _.each(backgrounds, function(background) {
      var tmp = backgroundTemplate.cloneNode(true);
      tmp.style.backgroundImage='url(' + backgroundPath + background.filename + ')';
      tmp.setAttribute('data-background', background.title);
      $canvas.append(tmp);
    });

  }

  self.setupAudio = function(tracks, laughs, callback) {
    _.each(tracks, function(track) {
      var url = soundPath + 'riffs/' + track.filename;
      var request = new XMLHttpRequest();
      request.open('GET', url, true);
      request.responseType = 'arraybuffer';

      request.onload = function() {
        riffContext.decodeAudioData(request.response, function(buffer) {
          track.buffer = buffer;
        });
      }
      request.send();

    });

    _.each(laughs, function(laugh) {
      var url = soundPath + 'laughs/' + laugh.filename;
      var request = new XMLHttpRequest();
      request.open('GET', url, true);
      request.responseType = 'arraybuffer';

      request.onload = function() {
        laughContext.decodeAudioData(request.response, function(buffer) {
          laugh.buffer = buffer;
        });
      }
      request.send();
    });

    return callback();
  }

  self.resetBackground = function(state) {
    state.keys.keydownsToSwitchBackground = self.randomInt(6,9);
    state.keys.keydownsPressed = 0;

    var b = _.shuffle(backgrounds)[0];
    while (b.title === state.background.currentBackground.title) {
      b = _.shuffle(backgrounds)[0];
    }

    state.background.currentBackground = b;
    $('[data-background]').each(function() {
      $(this).toggleClass('active', false);
    });  
    $('[data-background="' + state.background.currentBackground.title + '"]').addClass('active');
  }

  self.randomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  var state = {
    background: {
      currentBackground: _.shuffle(backgrounds)[0]
    },
    track: {
      currentTrack: _.shuffle(tracks)[0],
      currentStop: 0,
      playing: false
    },
    laugh: {
      currentlyLaughing: false,
      laughThreshold: 30,
      currentMovemoveEvents: 29
    },
    keys: {
      keydownsToSwitchBackground: 5,
      keydownsPressed: 0
    }
  };

  // go go go
  self.init(state);
}

var george = new Costanza();
