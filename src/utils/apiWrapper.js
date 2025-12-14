import axios from 'axios';
import fetch from 'node-fetch';
import crossFetch from 'cross-fetch';
import FormData from 'form-data';
import { JSDOM } from 'jsdom';

export class APIWrapper {
    constructor() {
        this.axios = axios.create({
            timeout: 10000,
            headers: {
                'User-Agent': 'Astra-Bot/1.0.0'
            }
        });
    }

    async fetchJSON(url, options = {}) {
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            throw new Error(`Fetch failed: ${error.message}`);
        }
    }

    async postData(url, data, options = {}) {
        try {
            const response = await this.axios.post(url, data, options);
            return response.data;
        } catch (error) {
            throw new Error(`POST failed: ${error.message}`);
        }
    }

    async uploadFile(url, filePath, fieldName = 'file') {
        try {
            const form = new FormData();
            form.append(fieldName, filePath);
            
            const response = await this.axios.post(url, form, {
                headers: form.getHeaders()
            });
            
            return response.data;
        } catch (error) {
            throw new Error(`Upload failed: ${error.message}`);
        }
    }

    async scrapeWebsite(url) {
        try {
            const response = await crossFetch(url);
            const html = await response.text();
            const dom = new JSDOM(html);
            
            return {
                document: dom.window.document,
                title: dom.window.document.title,
                html: html
            };
        } catch (error) {
            throw new Error(`Scraping failed: ${error.message}`);
        }
    }
}

export default new APIWrapper();