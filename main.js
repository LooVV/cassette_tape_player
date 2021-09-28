window.addEventListener("load", init, false);

let player;
var fileInput = document.getElementById("song_picker");
fileInput.addEventListener(
    "change",
    function () {
        player.loadAudioFromFile(this.files[0]);
    },
    false
);

document.getElementById("play_btn").addEventListener("click", () => {
    player.play();
    $(".spin").css("animationPlayState", "running");
});
document.getElementById("pause_btn").addEventListener("click", () => {
    player.pause();
    $(".spin").css("animationPlayState", "paused");
});

class Song {
    constructor(buffer, context) {
        this.sourceNode = null;
        this.buffer = buffer;

        this.context = context;

        this.pausedAt = 0;
        this.startedAt = 0;
        this.playing = false;
    }

    play() {
        if (this.playing) return;

        let offset = this.pausedAt;

        this.sourceNode = this.context.createBufferSource();
        this.sourceNode.buffer = this.buffer;
        this.sourceNode.connect(this.context.destination);
        this.sourceNode.start(0, offset);

        this.startedAt = this.context.currentTime - offset;
        this.pausedAt = 0;
        this.playing = true;
    }

    pause() {
        if (!this.playing) return;

        let elapsed =
            (this.context.currentTime - this.startedAt) *
            this.sourceNode.playbackRate.value;
        console.log(`Paused at ${elapsed}`);

        this.stop();
        this.pausedAt = elapsed;
    }

    stop() {
        if (!this.playing) return;

        if (this.sourceNode) {
            this.sourceNode.disconnect();
            this.sourceNode.stop(0);
            this.sourceNode = null;
        }
        this.pausedAt = 0;
        this.startedAt = 0;
        this.playing = false;
    }

    isPlaying() {
        return this.playing;
    }

    getCurrentTime() {
        if (this.pausedAt) {
            return this.pausedAt;
        }
        if (this.startedAt) {
            return this.context.currentTime - this.startedAt;
        }
        return 0;
    }
}


class AudioPlayer {
    constructor() {
        // TODO: ! Should be exception-checked
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        this.context = new AudioContext();

        this.songs = [];
    }

    loadAudioFromFile(file) {
        var reader = new FileReader();
        reader.onload = (ev) => {
            this.context.decodeAudioData(ev.target.result, (buffer) => {
                this.songs.push(new Song(buffer, this.context));
            });
        };
        reader.readAsArrayBuffer(file);
    }

    play() {
        if (this.songs.length >= 1) this.songs[0].play();
        else console.log("No audio to play");
    }

    pause() {
        if (this.songs.length >= 1) this.songs[0].pause();
        else console.log("Nothing to pause");
    }

    setVolume() {}
    nextTrack() {}
    prevTrack() {}
}

function init() {
    player = new AudioPlayer();
}
