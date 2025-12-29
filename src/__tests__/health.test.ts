import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index';

describe('Health Endpoint', () => {
    it('GET /health should return database connection status', async () => {
        const response = await request(app)
            .get('/health')
            .expect(200);

        expect(response.body).toHaveProperty('status');
        expect(response.body).toHaveProperty('database');
    });

    it('GET /health should return OK status on successful connection', async () => {
        const response = await request(app)
            .get('/health');

        if (response.status === 200) {
            expect(response.body.status).toBe('OK');
            expect(response.body.database).toBe('接続成功');
        } else {
            expect(response.status).toBe(500);
            expect(response.body.status).toBe('エラー');
        }
    });

    it('GET /health should return JSON response', async () => {
        const response = await request(app)
            .get('/health');

        expect(response.type).toMatch(/json/);
    });
});

describe('Root Endpoint', () => {
    it('GET / should return welcome message', async () => {
        const response = await request(app)
            .get('/')
            .expect(200);

        expect(response.body.message).toBe('TypeScript + Express + PostgreSQL API');
    });

    it('GET / should return JSON response', async () => {
        const response = await request(app)
            .get('/');

        expect(response.type).toMatch(/json/);
    });
});

