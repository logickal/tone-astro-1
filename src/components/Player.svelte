<script>
    import { isPlaying } from '../store.js'; // Adjust the path according to your project structure
    console.log('Svelte Player Loaded');
    let playingText = $isPlaying ? 'Playing...' : 'Click to start audio.';

    function togglePlaying() {
        console.log('togglePlaying called');
        $isPlaying = !$isPlaying;
        playingText = $isPlaying ? 'Playing...' : 'Click to start audio.';
    }
</script>

<button id="playButton" class="btn btn-square" on:click={togglePlaying}>
    <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 18V6l8 6-8 6Z"/>
    </svg>
</button>

<div>
    <p id="playingText">{playingText}</p>
</div>