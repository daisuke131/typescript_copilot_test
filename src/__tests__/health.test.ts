import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../index';
import { prisma } from '../lib/prisma';

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

describe('User Endpoints', () => {
    beforeAll(async () => {
        // テスト前にユーザーテーブルをクリア
        await prisma.user.deleteMany();
    });

    afterAll(async () => {
        // テスト後にユーザーテーブルをクリア
        await prisma.user.deleteMany();
        await prisma.$disconnect();
    });

    describe('GET /api/users', () => {
        it('should return empty array initially', async () => {
            const response = await request(app)
                .get('/api/users')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(0);
        });

        it('should return list of users', async () => {
            // テスト用ユーザーを作成
            await prisma.user.create({
                data: {
                    name: 'Test User',
                    email: 'test@example.com'
                }
            });

            const response = await request(app)
                .get('/api/users')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(1);
            expect(response.body[0]).toHaveProperty('id');
            expect(response.body[0]).toHaveProperty('name');
            expect(response.body[0]).toHaveProperty('email');
        });
    });

    describe('POST /api/users', () => {
        it('should create a new user', async () => {
            const newUser = {
                name: 'New User',
                email: 'newuser@example.com'
            };

            const response = await request(app)
                .post('/api/users')
                .send(newUser)
                .expect(201);

            expect(response.body).toHaveProperty('id');
            expect(response.body.name).toBe(newUser.name);
            expect(response.body.email).toBe(newUser.email);
            expect(response.body).toHaveProperty('createdAt');
            expect(response.body).toHaveProperty('updatedAt');
        });

        it('should return 400 if name or email is missing', async () => {
            const response = await request(app)
                .post('/api/users')
                .send({ name: 'Test' })
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });

        it('should return 400 if email is duplicated', async () => {
            const email = 'duplicate@example.com';
            
            // 最初のユーザーを作成
            await request(app)
                .post('/api/users')
                .send({ name: 'First User', email })
                .expect(201);

            // 同じメールアドレスで2番目のユーザーを作成しようとする
            const response = await request(app)
                .post('/api/users')
                .send({ name: 'Second User', email })
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });
    });
});
