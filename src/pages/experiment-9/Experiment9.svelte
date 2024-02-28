<script>
    import { onMount } from "svelte";
    import { isPlaying } from "../../store.js";
    import * as Tone from "tone";
    import {
        getRandom,
        getRandomBoolean,
        setRandomParam,
    } from "../../lib/utils.js";
    import { get } from "svelte/store";

    // Variable declarations
    let isFirstLoad = true;
    let messageText = "Waiting for message text";
    let player1, player2, player3, ampEnv1, ampEnv2, ampEnv3, lfo1, lfo2, modEnv, chorus, delay4, delay2, delay8, reverb;
    let channel1, channel2, channel3, reverbChannel, delayChannel;

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
        Tone.start();
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
            decay: 15,
            wet: .7,
        }).toDestination();



        delay8 = new Tone.FeedbackDelay("8m", 0.85).connect(reverb);
        delay4 = new Tone.FeedbackDelay("4m", 0.85).connect(reverb);
        delay2 = new Tone.FeedbackDelay("4d", 0.85).connect(reverb);    

        let filter1 = new Tone.Filter(700, "lowpass", -12).connect(delay2);
        let filter2 = new Tone.Filter(2300, "lowpass", -12).connect(delay4);
        let lfo1 = new Tone.LFO(0.1, 0, .5).sync().start(0);
        let lfo2 = new Tone.LFO(0.08, .2, .5).sync().start(0);
        let lfo4 = new Tone.LFO("2m", -.5, .5).sync().start(0);
        let filterLfo1 = new Tone.LFO(.02, -.25, .75).sync().start(0).connect(filter1.frequency);

        // Subscribe to button and activate player

        isPlaying.subscribe((value) => {
            messageText = value ? "Playing" : "Stopped";
            if (value === true) {
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
                    console.log('playbackRate: ' + player.playbackRate);
                    player.grainSize = getRandom(0.1, 0.5);
                    let playbackRate = setRandomParam(playbackRates);
                    console.log('playbackRate set at: ' + playbackRate);
                    player.playbackRate = playbackRate;
                    let originalDetune = player.detune;
                    let detune = setRandomParam(pitches);
                    console.log('detune: ' + detune);
                    player.detune = detune;
                    let selectedDelay = setRandomParam(delays);
                    channel.connect(selectedDelay);
                    player.start(time, startpoint);
                    ampEnv.triggerAttackRelease("4n", Tone.now());
                    console.log("7. envelope triggered " + player.name);
                }, Tone.now());
            }, rate).start(0);
        };

        // Our Main play function, kicks off setting up of players and playback
        let playPiece = () => {
            console.log("3. playPiece called");
            let audioFile1 = setRandomParam(audioFiles);
            let audioFile2 = setRandomParam(audioFiles);
            let audioFile3;
            do {
                audioFile3 = setRandomParam(audioFiles);
            } while (audioFile1 === audioFile2 && audioFile2 === audioFile3);

            let triggerRate1 = setRandomParam(triggerRates);
            let triggerRate2;
            let triggerRate3;

            do {
                triggerRate2 = setRandomParam(triggerRates);
            } while (triggerRate1 === triggerRate2);

            do {
                triggerRate3 = setRandomParam(triggerRates);
            } while (triggerRate1 === triggerRate3 && triggerRate2 === triggerRate3);

            let pitch1 = setRandomParam(pitches);
            let pitch2 = setRandomParam(pitches);
            let pitch3 = setRandomParam(pitches);

            player1 = new Tone.GrainPlayer(audioFile1, () => {
                console.log("4. player1 loaded");
                player1.name = "player1-" + audioFile1;
                player1.detune = pitch1;
                ampEnv1 = new Tone.AmplitudeEnvelope({
                    attack: 5,
                    decay: 0.2,
                    sustain: 1.0,
                    release: 10.2,
                    name:"ampEnv1",
                });
                player1.chain(ampEnv1, compressor1);
                voicePlayback(player1, ampEnv1, channel1, triggerRate1);
            });

            player2 = new Tone.GrainPlayer(audioFile2, () => {
                console.log("4. player2 loaded");
                player2.name = "player2-" + audioFile2;
                player2.detune = pitch2;
                ampEnv2 = new Tone.AmplitudeEnvelope({
                    attack: setRandomParam(["1m", 10, "4n"]),
                    decay: 0.2,
                    sustain: 1.0,
                    release: setRandomParam(["1m", 10, "4n"]),
                    name: "ampEnv2",
                });
                player2.chain(ampEnv2, compressor2);

                lfo2.connect(channel2.pan);
                console.log("setarting voicePlayback for player2");
                voicePlayback(player2, ampEnv2, channel2, triggerRate2);
        });

        player3 = new Tone.GrainPlayer(audioFile3, () => {
                console.log("4. player3 loaded");
                player3.name = "player3-" + audioFile3;
                player2.detune = pitch3;
                ampEnv3 = new Tone.AmplitudeEnvelope({
                    attack: setRandomParam(["2m", 20, "1m"]),
                    decay: 0.2,
                    sustain: 1.0,
                    release: setRandomParam(["2m", 25, "1m"]),
                    name: "ampEnv3",
                });
                player3.chain(ampEnv3, compressor3);
                lfo4.connect(channel3.pan);
                voicePlayback(player3, ampEnv3, channel3, triggerRate3);
        });
    }
});
</script>

<div>
    <p id="message-text">
        {messageText}
    </p>
</div>
