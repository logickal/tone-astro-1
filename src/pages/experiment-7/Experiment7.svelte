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
    let player1, player2, ampEnv1, ampEnv2, lfo1, lfo2, modEnv, chorus, delay4, reverb;
    let channel1, channel2, reverbChannel, delayChannel;

    let audioFiles = [
        "audio/4pos.mp3",
        "audio/bathing-hands.mp3",
        "audio/cmin.mp3",
        "audio/migration-2.mp3",
    ];

    let getLoopPoints = (duration) => {
        console.log("getLoopPoints called");
        let loopPoints = {};
        console.log(duration);
        loopPoints.loopLength = Math.min(getRandom(1, 5), duration);
        loopPoints.loopStart = Math.random() * (duration - loopLength);
        loopPoints.loopEnd = loopStart + loopLength;
        console.log(loopPoints);
        if (loopEnd > duration) {
            loopEnd = duration;
        }
        return loopPoints;
    };

    // Execute when mounted
    onMount(async () => {
        Tone.start();
        let tempo = getRandom(40, 60, 1);
        Tone.Transport.bpm.value = tempo;

        channel1 = new Tone.Channel(0);
        channel2 = new Tone.Channel(0);

        let compressor1 = new Tone.Compressor(-50, 3);
        let compressor2 = new Tone.Compressor(-50, 3);

        // Effect init
        reverb = new Tone.Reverb({
            decay: 15,
            wet: .7,
        }).toDestination();

        let lfo1 = new Tone.LFO(0.1, 0, .5).sync().start(0);
        let lfo2 = new Tone.LFO(0.08, .2, .5).sync().start(0);

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

                }
            }
        });

        let voicePlayback = (player, ampEnv, rate) => {
            console.log("5. voicePlayback called");
            Tone.Transport.start();

            let loop = new Tone.Loop((time) => {
                console.log("6. Loop started");
                let startpoint = getRandom(0, (player.buffer.duration - 10));
                Tone.Transport.schedule((time) => {
                    player.loop = true;
                    player.start(time, startpoint);
                    console.log('playbackRate: ' + player1.playbackRate);
                    player.grainSize = getRandom(0.1, 0.5);
                    let playbackRate = setRandomParam([1, .25, .5]);
                    console.log('playbackRate: ' + playbackRate);
                    player.playbackRate = playbackRate;
                    let originalDetune = player.detune;
                    //let detune = setRandomParam([0, -1200, -2400]);
//                    console.log('detune: ' + detune);
                    //player.detune = detune;
                    ampEnv.triggerAttackRelease("4n", Tone.now());
                    console.log("7. envelope triggered " + ampEnv.name);
                }, Tone.now());
            }, rate).start(0);
        };

        // Our Main play function, kicks off setting up of players and playback
        let playPiece = () => {
            console.log("3. playPiece called");
            let audioFile1 = setRandomParam(audioFiles);
            let audioFile2 = setRandomParam(audioFiles);
            let pitch1 = setRandomParam([0, -1200, -2400]);
            let pitch2 = setRandomParam([0, -1200, -2400]);
            delay4 = new Tone.FeedbackDelay("2d", 0.85);
            player1 = new Tone.GrainPlayer(audioFile1, () => {
                console.log("4. player loaded");
//                let loopPoints = getLoopPoints(player1.buffer.duration);
//                console.log(loopPoints);
//                player1.loopStart = loopPoints.loopStart;
//                player1.loopEnd = loopPoints.loopEnd;
//                player1.loop = true;
                player1.name = audioFile1;
                player1.detune = pitch1;
                ampEnv1 = new Tone.AmplitudeEnvelope({
                    attack: 5,
                    decay: 0.2,
                    sustain: 1.0,
                    release: 10.2,
                    name:"ampEnv1",
                });
                player1.chain(ampEnv1, compressor1, channel1, delay4, reverb);
                voicePlayback(player1, ampEnv1, "2m");
            });

            player2 = new Tone.GrainPlayer(audioFile2, () => {
                console.log("4. player loaded");
                player2.name = audioFile2;
                let lfo3 = new Tone.LFO((pitch2 - 200), (pitch2 + 200), .25).sync().start(0);
                player2.detune = pitch2;
                
                ampEnv2 = new Tone.AmplitudeEnvelope({
                    attack: setRandomParam(["1m", 10, "4n"]),
                    decay: 0.2,
                    sustain: 1.0,
                    release: setRandomParam(["1m", 10, "4n"]),
                    name: "ampEnv2",
                });
                player2.chain(ampEnv2, compressor2, channel2, delay4, reverb);
                lfo2 = new Tone.LFO(0.08, -.5, .5).sync().start(0);
                lfo2.connect(channel2.pan);
                lfo3.connect(player2.detune);
                voicePlayback(player2, ampEnv2, 15);
        });
    }
});
</script>

<div>
    <p id="message-text">
        {messageText}
    </p>
</div>
