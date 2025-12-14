import ytdl from 'ytdl-core';
import { play } from 'sound-play';
import { stream } from 'play-dl';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import OpusScript from 'opusscript';

ffmpeg.setFfmpegPath(ffmpegStatic);

export class AudioProcessor {
    constructor() {
        this.opus = new OpusScript(48000, 2);
    }

    async downloadYouTubeAudio(url) {
        try {
            if (!ytdl.validateURL(url)) {
                throw new Error('Invalid YouTube URL');
            }

            const info = await ytdl.getInfo(url);
            const audioStream = ytdl(url, {
                filter: 'audioonly',
                quality: 'highestaudio'
            });

            return {
                stream: audioStream,
                info: {
                    title: info.videoDetails.title,
                    duration: info.videoDetails.lengthSeconds,
                    author: info.videoDetails.author.name
                }
            };
        } catch (error) {
            throw new Error(`YouTube download failed: ${error.message}`);
        }
    }

    async playSound(filePath) {
        try {
            await play(filePath);
        } catch (error) {
            throw new Error(`Sound playback failed: ${error.message}`);
        }
    }

    async getStreamInfo(url) {
        try {
            const streamInfo = await stream(url);
            return streamInfo;
        } catch (error) {
            throw new Error(`Stream info failed: ${error.message}`);
        }
    }

    async convertAudio(inputPath, outputPath, format = 'mp3') {
        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .toFormat(format)
                .on('end', () => resolve(outputPath))
                .on('error', (err) => reject(new Error(`Conversion failed: ${err.message}`)))
                .save(outputPath);
        });
    }

    encodeOpus(pcmData) {
        try {
            return this.opus.encode(pcmData);
        } catch (error) {
            throw new Error(`Opus encoding failed: ${error.message}`);
        }
    }

    decodeOpus(opusData) {
        try {
            return this.opus.decode(opusData);
        } catch (error) {
            throw new Error(`Opus decoding failed: ${error.message}`);
        }
    }

    async getAudioDuration(filePath) {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(filePath, (err, metadata) => {
                if (err) {
                    reject(new Error(`Duration check failed: ${err.message}`));
                } else {
                    resolve(metadata.format.duration);
                }
            });
        });
    }
}

export default new AudioProcessor();