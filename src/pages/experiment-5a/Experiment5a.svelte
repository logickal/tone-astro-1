<script>
    import { onMount } from "svelte";
    import { isPlaying } from "../../store.js";
    import * as Tone from "tone";
    import {
        getRandom,
        getRandomBoolean,
        setRandomParam,
    } from "../../lib/utils.js";
    import Player from "../../components/Player.svelte";

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
    let pitchValues = [1, 1.25, 2, .5, .75, .25];

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
            let pitch = setRandomParam(pitchValues);
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
            let attack = getRandom(15, 30);
            let release = attack + getRandom(15, 30);
            let effect = setRandomParam(["delay4", "delay2"]);
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
                attack: attack,
                release: release,
                effect: effect,
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
        Tone.Transport.debug = true;
        Tone.start();
        Tone.Transport.bpm.value = 55;

        channels = {
            channel1: new Tone.Channel().toDestination(),
            channel2: new Tone.Channel().toDestination(),
            channel3: new Tone.Channel().toDestination(),
            channel4: new Tone.Channel().toDestination(),
            channel5: new Tone.Channel().toDestination(),
            delay2: new Tone.Channel(),
            delay4: new Tone.Channel(),
            channelReverb: new Tone.Channel().toDestination(),
        };

        // Reverb
        // Delay4
        // Delay2
        const reverb = new Tone.Reverb({
            decay: 15,
            preDelay: 0.2,
            wet: 1,
        }).connect(channels.channelReverb);
        const delay4 = new Tone.FeedbackDelay(1600, 0.65).set({ wet: 0.5 });
        const delay2 = new Tone.FeedbackDelay(5000, 0.65).set({ wet: 0.5 });

        const filter4 = new Tone.Filter(1000, "lowpass");
        const filter2 = new Tone.Filter(900, "lowpass");

        delay4.chain(filter4, channels.delay4);
        delay2.chain(filter2, channels.delay2);
        channels.delay2.send("channelReverb", 0.5);
        channels.delay4.send("channelReverb", 0.5);

        // Reactive statement that updates messageText based on the value of isPlaying
        isPlaying.subscribe((value) => {
            console.log(value);
            // Initialize the player params when toggling isPlaying
            playerParams = value ? initializeParams(audioFiles) : [];
            // Set the player message text - currently just a stringified version of the playerParams.
            messageText = value
                ? `Players configured: ${JSON.stringify(playerParams)}`
                : "Waiting for message text";
            // Set the player state - not sure if we need this.
            let playerState = messageText;
            // Play the piece if isPlaying is true
            if (value === true) {
                console.log("1. isPlaying is true");
                // Play one voice
                playPiece(playerParams, 1);
            } else {
                // Stop the piece.
                console.log("isPlaying is false");
                stopPiece();
            }
        });
    });

    // The loop execution for each voice
    function voicePlayback(playerParams, player, envelope) {
        console.log("5. voicePlayback");
        // Start the player - schedule NOW and offset 5 seconds into the sample
        // TODO: configure the duration and work out how to get the start time working properly.
        player.start(Tone.now(), 5);
        // Transport should already be started, so start the loop.
        console.log("6. Loop starting.");
        // Set the loop interval to the sum of the attack and release plus 1 measure at the current tempo.
        let interval =
            envelope.attack + envelope.release + Tone.Transport.toSeconds("1m");
        console.log("Interval: " + interval);
        let loop = new Tone.Loop((time) => {
            // Trigger the envelope
            Tone.Transport.schedule((time) => {
                console.log("7. triggerEnvelope for " + playerParams.audioFile);
                triggerEnvelope(envelope, Tone.now());
            }, Tone.now());
        }, interval).start(0);
    }

    // Function to trigger the envelope
    function triggerEnvelope(envelope, duration) {
        console.log("8. triggerEnvelope");
        envelope.triggerAttackRelease(envelope.attack + "8n", duration);
    }

    function setLoopPoints(player) {
        console.log("3. setLoopPoints");
        // Set the loop start and end
        const duration = player.buffer.duration;
        const loopLength = Math.min(getRandom(1, 5), duration);
        const start = Math.random() * (duration - loopLength);
        player.startPoint = start;
        player.setLoopPoints(start, start + loopLength);
        player.start(0, player.startPoint);
        player.loop = true;
    }

    // Play the piece - main player creation and kick off playing
    let playPiece = (playerParams, voices) => {
        console.log("2. playPiece called");

        let players = [player1, player2, player3, player4];
        let ampEnvs = [ampEnv1, ampEnv2, ampEnv3, ampEnv4];

        playerParams.forEach((params, index) => {
            let channel = channels[`channel${index + 1}`];

            ampEnvs[index] = new Tone.AmplitudeEnvelope({
                attack: params.attack,
                decay: 0.4,
                sustain: 1,
                release: params.release,
            }).connect(channel);

            channel.send("channelReverb", 0.8);
            channel.send(`channels.${params.effect}`, 0.5);

            players[index] = new Tone.Player(params.audioFile, () => {
                console.log("3. testPlayer callback");
                setLoopPoints(players[index]);
                players[index].playbackRate = params.pitch;
                console.log("4. setLoopPoints: " + players[index].loopStart);
                console.log("Voice playback staring");
                voicePlayback(params, players[index], ampEnvs[index]);
            }).connect(ampEnvs[index]);
        });

        // Start the transport.
        Tone.Transport.start();
    };
    let stopPiece = () => {
        Tone.Transport.stop();
    };
</script>

<div>
    <p id="message-text">
        {messageText}
    </p>
</div>
