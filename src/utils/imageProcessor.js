import sharp from 'sharp';
import puppeteer from 'puppeteer';
import mimeTypes from 'mime-types';

export class ImageProcessor {
    constructor() {
        this.browser = null;
    }

    async initBrowser() {
        if (!this.browser) {
            this.browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        }
        return this.browser;
    }

    async resizeImage(inputBuffer, width, height) {
        try {
            return await sharp(inputBuffer)
                .resize(width, height, {
                    fit: 'cover',
                    position: 'center'
                })
                .png()
                .toBuffer();
        } catch (error) {
            throw new Error(`Image resize failed: ${error.message}`);
        }
    }

    async createAvatar(inputBuffer, size = 256) {
        try {
            return await sharp(inputBuffer)
                .resize(size, size)
                .png()
                .composite([{
                    input: Buffer.from(`
                        <svg width="${size}" height="${size}">
                            <defs>
                                <clipPath id="circle">
                                    <circle cx="${size/2}" cy="${size/2}" r="${size/2}"/>
                                </clipPath>
                            </defs>
                        </svg>
                    `),
                    blend: 'dest-in'
                }])
                .toBuffer();
        } catch (error) {
            throw new Error(`Avatar creation failed: ${error.message}`);
        }
    }

    async addWatermark(inputBuffer, watermarkText) {
        try {
            const watermarkSvg = `
                <svg width="200" height="50">
                    <text x="10" y="30" font-family="Arial" font-size="16" fill="rgba(255,255,255,0.7)">
                        ${watermarkText}
                    </text>
                </svg>
            `;

            return await sharp(inputBuffer)
                .composite([{
                    input: Buffer.from(watermarkSvg),
                    gravity: 'southeast'
                }])
                .png()
                .toBuffer();
        } catch (error) {
            throw new Error(`Watermark failed: ${error.message}`);
        }
    }

    async screenshotWebsite(url, options = {}) {
        try {
            const browser = await this.initBrowser();
            const page = await browser.newPage();
            
            await page.setViewport({
                width: options.width || 1920,
                height: options.height || 1080
            });
            
            await page.goto(url, { waitUntil: 'networkidle2' });
            
            const screenshot = await page.screenshot({
                type: 'png',
                fullPage: options.fullPage || false
            });
            
            await page.close();
            return screenshot;
        } catch (error) {
            throw new Error(`Screenshot failed: ${error.message}`);
        }
    }

    getMimeType(filename) {
        return mimeTypes.lookup(filename) || 'application/octet-stream';
    }

    async closeBrowser() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }
}

export default new ImageProcessor();