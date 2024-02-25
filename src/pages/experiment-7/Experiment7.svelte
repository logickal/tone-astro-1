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
    let messageText = "Waiting for message text";
    let player1, filter1, ampEnv1, lfo1, lfo2, modEnv, chorus, delay4, reverb;
    let channel, reverbChannel, delayChannel;

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
        Tone.Transport.bpm.value = 55;

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
                console.log("2. Stopped");
                Tone.Transport.stop();
            }
        });

        let voicePlayback = (player) => {
            console.log("5. voicePlayback called");
            Tone.Transport.start();

            let loop = new Tone.Loop((time) => {
                console.log("6. Loop started");
                let startpoint = getRandom(0, (player.buffer.duration - 10));
                Tone.Transport.schedule((time) => {
                    player1.loop = true;
                    player1.start(time, startpoint);
                    console.log('playbackRate: ' + player1.playbackRate);
                    player1.grainSize = getRandom(0.1, 0.5);
                    let playbackRate = setRandomParam([1, .25, .5]);
                    console.log('playbackRate: ' + playbackRate);
                    player1.playbackRate = playbackRate;
                    let detune = setRandomParam([0, -1200, -2400]);
                    console.log('detune: ' + detune);
                    player1.detune = detune;
                    ampEnv1.triggerAttackRelease("4n", Tone.now());
                    console.log("7. ampEnv1 triggered");
                }, Tone.now());
            }, "2m").start(0);
        };

        // Our Main play function, kicks off setting up of players and playback
        let playPiece = () => {
            console.log("3. playPiece called");
            let audioFile = setRandomParam(audioFiles);
            delay4 = new Tone.FeedbackDelay("2d", 0.85);
            player1 = new Tone.GrainPlayer(audioFile, () => {
                console.log("4. player loaded");
                player1.debug = true;
//                let loopPoints = getLoopPoints(player1.buffer.duration);
//                console.log(loopPoints);
//                player1.loopStart = loopPoints.loopStart;
//                player1.loopEnd = loopPoints.loopEnd;
//                player1.loop = true;
                player1.name = audioFile;
                ampEnv1 = new Tone.AmplitudeEnvelope({
                    attack: 5,
                    decay: 0.2,
                    sustain: 1.0,
                    release: 10.2,
                });
                player1.chain(ampEnv1, delay4, reverb);
                voicePlayback(player1);
            });

            // Create and setup a player.
        };
    });
</script>

<div>
    <p id="message-text">
        {messageText}
    </p>
</div>
