import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import supertest from 'supertest';
import ExtendedClient from '../structures/ExtendedClient.js';
import { CuteEmbedBuilder } from '../helpers/embedBuilder.js';
import { TimeUtils } from '../helpers/timeUtils.js';
import { Validators } from '../helpers/validators.js';

describe('Astra Bot Tests', () => {
    let client;

    beforeAll(async () => {
        client = new ExtendedClient();
    });

    afterAll(async () => {
        if (client) {
            await client.destroy();
        }
    });

    describe('ExtendedClient', () => {
        test('should initialize properly', () => {
            expect(client).toBeDefined();
            expect(client.commands).toBeDefined();
            expect(client.events).toBeDefined();
            expect(client.cache).toBeDefined();
        });

        test('should have logging functionality', () => {
            expect(typeof client.log).toBe('function');
            client.log('Test log message', 'info');
        });
    });

    describe('CuteEmbedBuilder', () => {
        test('should create success embed', () => {
            const embed = CuteEmbedBuilder.success('Test Title', 'Test Description');
            expect(embed.data.title).toContain('Test Title');
            expect(embed.data.description).toBe('Test Description');
            expect(embed.data.color).toBeDefined();
        });

        test('should create error embed', () => {
            const embed = CuteEmbedBuilder.error('Error Title', 'Error Description');
            expect(embed.data.title).toContain('Error Title');
            expect(embed.data.description).toBe('Error Description');
        });

        test('should create moderation embed', () => {
            const mockUser = { tag: 'TestUser#1234', id: '123456789', displayAvatarURL: () => 'test.png' };
            const mockModerator = { tag: 'Mod#1234' };
            
            const embed = CuteEmbedBuilder.moderation('ban', mockUser, mockModerator, 'Test reason');
            expect(embed.data.title).toContain('Ban Action');
            expect(embed.data.fields).toBeDefined();
            expect(embed.data.fields.length).toBeGreaterThan(0);
        });
    });

    describe('TimeUtils', () => {
        test('should parse time correctly', () => {
            expect(TimeUtils.parseTime('1h')).toBe(3600000);
            expect(TimeUtils.parseTime('30m')).toBe(1800000);
            expect(TimeUtils.parseTime('1d')).toBe(86400000);
        });

        test('should format duration', () => {
            const formatted = TimeUtils.formatDuration(3600000);
            expect(formatted).toContain('hour');
        });

        test('should get unix timestamp', () => {
            const timestamp = TimeUtils.getUnixTimestamp();
            expect(typeof timestamp).toBe('number');
            expect(timestamp).toBeGreaterThan(0);
        });

        test('should check if time is expired', () => {
            const pastDate = new Date(Date.now() - 1000);
            const futureDate = new Date(Date.now() + 1000);
            
            expect(TimeUtils.isExpired(pastDate)).toBe(true);
            expect(TimeUtils.isExpired(futureDate)).toBe(false);
        });
    });

    describe('Validators', () => {
        test('should validate user IDs', () => {
            expect(Validators.isValidUserId('123456789012345678')).toBe(true);
            expect(Validators.isValidUserId('invalid')).toBe(false);
            expect(Validators.isValidUserId('123')).toBe(false);
        });

        test('should validate URLs', () => {
            expect(Validators.isValidUrl('https://example.com')).toBe(true);
            expect(Validators.isValidUrl('http://example.com')).toBe(true);
            expect(Validators.isValidUrl('invalid-url')).toBe(false);
        });

        test('should validate reasons', () => {
            expect(Validators.isValidReason('Valid reason')).toBe(true);
            expect(Validators.isValidReason('a'.repeat(600))).toBe(false);
            expect(Validators.isValidReason('')).toBe(true);
        });

        test('should detect spam', () => {
            const spamMessage = 'spam spam spam spam spam';
            const normalMessage = 'This is a normal message';
            
            expect(Validators.isSpam(spamMessage)).toBe(true);
            expect(Validators.isSpam(normalMessage)).toBe(false);
        });

        test('should sanitize input', () => {
            const maliciousInput = '<script>alert("xss")</script>';
            const sanitized = Validators.sanitizeInput(maliciousInput);
            expect(sanitized).not.toContain('<script>');
        });
    });

    describe('Configuration', () => {
        test('should have valid colors', async () => {
            const { readFileSync } = await import('fs');
            const { fileURLToPath } = await import('url');
            const { dirname, join } = await import('path');
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = dirname(__filename);
            const config = JSON.parse(readFileSync(join(__dirname, '../config/config.json'), 'utf8'));
            
            expect(config.default.colors).toBeDefined();
            expect(config.default.colors.primary).toBeDefined();
            expect(config.default.emojis).toBeDefined();
            expect(config.default.limits).toBeDefined();
        });
    });
});