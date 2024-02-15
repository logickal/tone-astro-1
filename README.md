# Tone + Astro 1

This is simply a learning environment for me to play with Tone.js and the Astro framework - I'm currently not using either one to its fullest capacity, just playing around.

The Player.astro component is responsible for all of the magic at the moment.

## A musical outline.
The generative compositon can barely really be called that at the moment.  It's two voices, driven randomly.  The only logic involved is that it randomly picks a root note and then the two voices randomly play notes from the minor key of that tonic. The lead voice is filtered (which is modulated) and run through a delay. There is a percentage chance that it will play a note or not.  The second voice provides an ostinato bassline, where it will start on the tonic and re-iterate the tonic every 16 notes.

More play to come, this will continue to evolve.