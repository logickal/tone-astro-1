<script>
    import { onMount } from "svelte";
    import { isPlaying } from "../../store.js";
    import * as Tone from "tone";
    import {
        getRandom,
        setRandomParam,
    } from "../../lib/utils.js";
    import { get } from "svelte/store";

    // Variable declarations
    let isFirstLoad = true;
    let messageText = "Waiting for message text";
    let player1, player2, player3, ampEnv1, delay4, delay2, delay8, reverb;
    let channel1, channel2, channel3;

    let audioFiles = [
        "audio/4pos.mp3",
        "audio/bathing-hands.mp3",
        "audio/cmin.mp3",
        "audio/migration-2.mp3",
    ];

    let pitches = [0, -1200, -2400];
    let playbackRates = [.5, .1, .01, .001, .25, .025];
    let triggerRates = ["1m", "2m", "4m", getRandom(15, 30), getRandom(30, 60)]

    // Execute when mounted
    onMount(async () => {
        let tempo = getRandom(40, 60, 1);
        Tone.Transport.bpm.value = tempo;

        //the audio channels
        channel1 = new Tone.Channel(0);
        channel2 = new Tone.Channel(0);
        channel3 = new Tone.Channel(0);

        // the compressors
        let compressor1 = new Tone.Compressor(-50, 3).connect(channel1);
        let compressor2 = new Tone.Compressor(-50, 3).connect(channel2);
        let compressor3 = new Tone.Compressor(-50, 3).connect(channel3);

        // Effect init
        reverb = new Tone.Reverb({
            decay: 25.5,
            wet: .85,
        }).toDestination();



        delay8 = new Tone.FeedbackDelay("8m", 0.85).connect(reverb);
        delay4 = new Tone.FeedbackDelay("4m", 0.85).connect(reverb);
        delay2 = new Tone.FeedbackDelay("4d", 0.85).connect(reverb);
        delay2.debug = true;    

        let filter1 = new Tone.Filter(700, "lowpass", -12).connect(delay2);
        let filter2 = new Tone.Filter(2300, "lowpass", -12).connect(delay4);
        let lfo1 = new Tone.LFO(0.1, 0, .5).sync().start(0);
        let lfo2 = new Tone.LFO(0.08, .2, .5).sync().start(0);
        let lfo4 = new Tone.LFO("2m", -.5, .5).sync().start(0);
        let filterLfo1 = new Tone.LFO(.02, -.25, .75).sync().start(0).connect(filter1.frequency);


        let lorenzAttractor = (x, y, z, s=10, r=28, b=2.667, dt=0.01) => {
            let dx = s * (y - x);
            let dy = r * x - y - x * z;
            let dz = x * y - b * z;
            x += dx * dt;
            y += dy * dt;
            z += dz * dt;
            return [x, y, z];
        }
        // Subscribe to button and activate player

        isPlaying.subscribe((value) => {
            messageText = value ? "Playing" : "Stopped";
            if (value === true) {
                Tone.start();
                console.log("1. Playing");
                playPiece();
            } else {
                if (isFirstLoad) {
                    isFirstLoad = false;
                } else {
                console.log("2. Stopped");
                Tone.Transport.stop();
                player1.stop();
                player2.stop();
                player3.stop();
                }
            }
        });

        let voicePlayback = (player, ampEnv, channel, rate) => {
            console.log("5. voicePlayback called at " + rate);
            Tone.Transport.start();
            let delays = [filter1, filter2, delay8];

            let loop = new Tone.Loop((time) => {
                console.log("6. Loop started");
                let startpoint = getRandom(0, (player.buffer.duration - 10));
                Tone.Transport.schedule((time) => {
                    let originalDetune = player.detune;
                    let detune = setRandomParam(pitches);
                    console.log('detune: ' + detune);
                    player.detune = detune;
                    //let selectedDelay = setRandomParam(delays);
                    channel.connect(delay2);
                    channel.connect(delay4);
                    player.start(time, startpoint);
                    ampEnv.release = getRandom(10, 45);
                    ampEnv.triggerAttackRelease("4n", Tone.now());
                    console.log("7. envelope triggered " + player.name);
                }, Tone.now());
            }, rate).start(0);
        };

        // Our Main play function, kicks off setting up of players and playback
        let playPiece = () => {
            console.log("3. playPiece called");
            let audioFile1 = setRandomParam(audioFiles);
            let x = 0.1, y = .25, z = .5;
            let s = 10, r = 28, b = 2.667;

            let triggerRate1 = setRandomParam(triggerRates);
            let pitch1 = setRandomParam(pitches);

            player1 = new Tone.GrainPlayer(audioFile1, () => {
                console.log("4. player1 loaded");
                //player1.debug = true;
                player1.name = "player1-" + audioFile1;
                player1.detune = pitch1;
                player1.loop = true;
                ampEnv1 = new Tone.AmplitudeEnvelope({
                    attack: 5,
                    decay: 0.2,
                    sustain: 1.0,
                    release: 35,
                    name:"ampEnv1",
                });
                player1.chain(ampEnv1, compressor1);
        
                voicePlayback(player1, ampEnv1, channel1, triggerRate1);
            });

            let modTime = 2;
            let lornenzLoop = new Tone.Loop(time => {
                [x, y, z] = lorenzAttractor(x, y, z);
                z = Math.max(0.1, Math.min(z, 1));
                delay2.delayTime.rampTo(z, modTime);
                player1.grainSize = y;
                player1.playbackRate = Math.abs(x);
                console.log('Params-  ' + 'Playback Rate: ' + player1.playbackRate + '  Grainsize: ' + player1.grainSize +  ' delayTime: ' + delay2.delayTime.value);

            }, modTime);
            lornenzLoop.start(0);
            console.log("lornezLoop Started");
    }
});
</script>

<div>
    <p id="message-text">
        {messageText}
    </p>
</div>
