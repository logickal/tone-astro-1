<script>
    import { onMount } from "svelte";
    import { isPlaying } from "../../store.js";
    import * as Tone from "tone";
    import {
        getRandom,
        getRandomBoolean,
        setRandomParam,
    } from "../../lib/utils.js";

    let messageText = "Waiting for message text";

    let playerParams = [];
    let playerCount = 4;
    let channels = {};

    let player1, player2, player3, player4;
    let ampEnv1, ampEnv2, ampEnv3, ampEnv4;
    let reverb, ddl4, ddl2;
    let filter1, filter2, filter3, filter4;
    let chorus1, chorus2, chorus3, chorus4;
    let lfo1, lfo2, lfo3, lfo4;
    let modEnv1, modEnv2, modEnv3, modEnv4;

    // Parameters for the players.

    let audioFiles = [
        "audio/4pos.mp3",
        "audio/bathing-hands.mp3",
        "audio/carter.mp3",
        "audio/cmin.mp3",
    ];

    let filterTypes = ["none", "lowpass", "highpass", "bandpass", "notch"];
    let modSources = ["none", "envelope1", "envelope2", "lfo1", "lfo2", "lfo3"];
    let pitchValues = [0, +7, +12, -12, -5];

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
    let initializeParams = (audioFiles) => {
        console.log("Initializing parameters");
        for (let i = 0; i < playerCount; i++) {
            let playerIndex = i;
            let audioFile = setRandomParam(audioFiles);
            // loopStart and loopLength will need to be set based on the duration of the file.
            //let loopStart = getRandom(0, 10);
            //let loopLength = getRandom(10, 20);
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
                audioFile: audioFile,
                //loopStart: loopStart,
                //loopLength: loopLength,
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
                playing: playing,
            });
        }
        return playerParams;

    };
    // We need to answer the question of how we want to schedule the players to play.  Thinking through the loop:
    // - Select the first sample and the duration
    // - Play the first sample
    // - select the second sample from a player that is not yet triggered (playing state off)
    // - play the second sample for a duration

    onMount(async () => {
        Tone.start();

        // Reactive statement that updates messageText based on the value of isPlaying
        isPlaying.subscribe((value) => {
            console.log(value);
            playerParams = value ? initializeParams(audioFiles) : [];
            messageText = value
                ? `Players configured: ${JSON.stringify(playerParams)}`
                : "Waiting for message text";
            let playerState = messageText;
            if (value === true) {
                console.log('isPlaying is true');
                playPiece(playerParams);
            } else {
                console.log('isPlaying is false');
                Tone.Transport.stop();
                
            }   
        });


    });

    let playPiece = (playerParams) => {
        Tone.Transport.start();

        console.log('1. playPiece called');
                // Create a player and connect it to the destination
                let testChannel = new Tone.Channel().toDestination();
        console.log(audioFiles[2]);         

        let testAmpEnv = new Tone.AmplitudeEnvelope({
            attack: 1.2,
            decay: 0.3,
            sustain: 1.0,
            release: 1.2,
        }).connect(testChannel);

        let testPlayer = new Tone.Player(audioFiles[2], () => {
            testPlayer.autostart = true;
            console.log('2. testPlayer loaded');
            let loop = new Tone.Loop((time) => {
                console.log('4. Loop started');
                Tone.Transport.schedule((time) => {
                    testAmpEnv.triggerAttackRelease("8n", time);
                    console.log('5. testAmpEnv triggered');
                }, Tone.now());
            }, "1m").start(0);

        }).connect(testAmpEnv);    
    };

    let togglePlaying = () => {
        isPlaying.update((value) => !value);
    };


</script>

<div>
    <p id="message-text">
        {messageText}
    </p>
</div>
