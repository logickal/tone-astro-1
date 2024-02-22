<script>
    import {isPlaying} from '../../store.js'
    import * as Tone from 'tone';

    let messageText = 'Waiting for message text';
    // Reactive statement that updates messageText based on the value of isPlaying
    $: messageText = $isPlaying ? `Players configured: ${JSON.stringify(playerParams)}` : 'Waiting for message text';

    // We will start with the same 4 samples.
    // We will then generate parameters for them:
    // Loop start, loop length
    // Pitch / Octave
    // Filter? (low pass, high pass, band pass, notch)
    // Filter Freq
    // Filter Modulaton?
    // Filter modulation source
    // Filter modulation amount
    // Amp modulation?
    // Amp Modulation Source
    // Amp modulation amt
    // Chorus? and amt
    // Delay? plus time, bounded feedback and amount
    // Pan position (starting
    // Pan position modulation
    // Playing state (on or off)

    // We will set the parameters, then pass those parameters into the players we create.

    // We need to answer the question of how we want to schedule the players to play.  Thinking through the loop:
    // - Select the first sample and the duration
    // - Play the first sample
    // - select the second sample from a player that is not yet triggered (playing state off) 
    // - play the second sample for a duration


    let getRandom = (min, max) => {
        return Math.random() * (max - min) + min;
    };

    let audioFiles = [
        "audio/4pos.mp3",
        "audio/bathing-hands.mp3",
        "audio/carter.mp3",
        "audio/cmin.mp3",
    ];

    let player1, player2, player3, player4;
    let playerParams = [];
    let playerCount = 4;

    let filterTypes = ['none', 'lowpass', 'highpass', 'bandpass', 'notch'];
    let modSources = ['none', 'envelope1', 'envelope2','lfo1', 'lfo2', 'lfo3'];

    let channels = {};

    // Create 6 channels.
    for (let i = 1; i <= 6; i++) {
        channels[`channel${i}`] = new Tone.Channel(-6, 0).toDestination();
    }



    let initializeParams = (audioFiles) => {
        for (let i=0; i < (playerCount); i++) {
            let playerIndex = i;
            let loopStart = getRandom(0, 10);
            let loopLength = getRandom(10, 20);
            let pitch = getRandom(0.5, 2);
            let filter = getRandom(0, 3);
            let filterFreq = getRandom(100, 1000);
            let filterMod = getRandom(0, 1);
            let filterModSrc = getRandom(0, 3);
            let filterModAmt = getRandom(0, 1);
            let ampMod = getRandom(0, 1);
            let ampModSrc = getRandom(0, 3);
            let ampModAmt = getRandom(0, 1);
            let chorus = getRandom(0, 1);
            let chorusAmt = getRandom(0, 1);
            let delay = getRandom(0, 1);
            let delayTime = getRandom(0, 1);
            let delayFeedback = getRandom(0, 1);
            let delayAmt = getRandom(0, 1);
            let pan = getRandom(-1, 1);
            let panMod = getRandom(0, 1);
            let playing = false;

            playerParams.push({
                playerIndex: playerIndex,
                loopStart: loopStart,
                loopLength: loopLength,
                pitch: pitch,
                filter: filter,
                filterFreq: filterFreq,
                filterMod: filterMod,
                filterModSrc: filterModSrc,
                filterModAmt: filterModAmt,
                ampMod: ampMod,
                ampModSrc: ampModSrc,
                ampModAmt: ampModAmt,
                chorus: chorus,
                chorusAmt: chorusAmt,
                delay: delay,
                delayTime: delayTime,
                delayFeedback: delayFeedback,
                delayAmt: delayAmt,
                pan: pan,
                panMod: panMod,
                playing: playing
            });
        }
    }

    if (isPlaying) {
        initializeParams(audioFiles);
    }




</script>

<div>
    <p id="message-text">
        {messageText}
    </p>
</div>
