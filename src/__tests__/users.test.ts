import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../index';
import { prisma } from '../lib/prisma';

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

            // 個別取得の検証（APIパス）
            const userId = response.body.id;
            const getResponse = await request(app)
                .get(`/api/users/${userId}`)
                .expect(200);
            expect(getResponse.body.id).toBe(userId);
            expect(getResponse.body.name).toBe(newUser.name);
            expect(getResponse.body.email).toBe(newUser.email);
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

        it('should return 404 for not found user by id', async () => {
            const response = await request(app)
                .get('/api/users/999999')
                .expect(404);
            expect(response.body).toHaveProperty('error');
        });

        it('should return 400 for invalid id', async () => {
            const response = await request(app)
                .get('/api/users/abc')
                .expect(400);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('PATCH /api/users/:id', () => {
        it('should update a user with both name and email', async () => {
            // 既存ユーザーを作成
            const createResponse = await request(app)
                .post('/api/users')
                .send({ name: 'Original Name', email: 'original@example.com' })
                .expect(201);

            const userId = createResponse.body.id;

            // ユーザーを更新
            const updateResponse = await request(app)
                .patch(`/api/users/${userId}`)
                .send({ name: 'Updated Name', email: 'updated@example.com' })
                .expect(200);

            expect(updateResponse.body.id).toBe(userId);
            expect(updateResponse.body.name).toBe('Updated Name');
            expect(updateResponse.body.email).toBe('updated@example.com');
        });

        it('should update a user with only name', async () => {
            // 既存ユーザーを作成
            const createResponse = await request(app)
                .post('/api/users')
                .send({ name: 'Original Name', email: 'onlyname@example.com' })
                .expect(201);

            const userId = createResponse.body.id;
            const originalEmail = createResponse.body.email;

            // nameだけを更新
            const updateResponse = await request(app)
                .patch(`/api/users/${userId}`)
                .send({ name: 'New Name' })
                .expect(200);

            expect(updateResponse.body.id).toBe(userId);
            expect(updateResponse.body.name).toBe('New Name');
            expect(updateResponse.body.email).toBe(originalEmail);
        });

        it('should update a user with only email', async () => {
            // 既存ユーザーを作成
            const createResponse = await request(app)
                .post('/api/users')
                .send({ name: 'Original Name', email: 'onlyemail@example.com' })
                .expect(201);

            const userId = createResponse.body.id;
            const originalName = createResponse.body.name;

            // emailだけを更新
            const updateResponse = await request(app)
                .patch(`/api/users/${userId}`)
                .send({ email: 'newemail@example.com' })
                .expect(200);

            expect(updateResponse.body.id).toBe(userId);
            expect(updateResponse.body.name).toBe(originalName);
            expect(updateResponse.body.email).toBe('newemail@example.com');
        });

        it('should return 400 if both name and email are empty', async () => {
            const response = await request(app)
                .patch('/api/users/1')
                .send({})
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });

        it('should return 400 if email is invalid', async () => {
            const response = await request(app)
                .patch('/api/users/1')
                .send({ email: 'invalid-email' })
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });

        it('should return 404 for not found user', async () => {
            const response = await request(app)
                .patch('/api/users/999999')
                .send({ name: 'Updated Name' })
                .expect(404);

            expect(response.body).toHaveProperty('error');
        });

        it('should return 400 for invalid id', async () => {
            const response = await request(app)
                .patch('/api/users/abc')
                .send({ name: 'Updated Name' })
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });

        it('should return 400 if duplicate email during update', async () => {
            // 2つのユーザーを作成
            const user1 = await request(app)
                .post('/api/users')
                .send({ name: 'User 1', email: 'user1@example.com' })
                .expect(201);

            const user2 = await request(app)
                .post('/api/users')
                .send({ name: 'User 2', email: 'user2@example.com' })
                .expect(201);

            // user2のメールアドレスをuser1と同じにしようとする
            const updateResponse = await request(app)
                .patch(`/api/users/${user2.body.id}`)
                .send({ email: 'user1@example.com' })
                .expect(400);

            expect(updateResponse.body).toHaveProperty('error');
        });
    });
});

