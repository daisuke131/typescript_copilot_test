import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { userCreateSchema, userUpdateSchema, userIdParamSchema } from '../schemas/user';
import { ValidationError, NotFoundError } from '../lib/errors';
import { handlePrismaError } from '../lib/prismaErrorHandler';
import { parseOrThrow } from '../lib/validator';
import { MSG_INVALID_REQUEST, MSG_INVALID_INPUT, MSG_USER_NOT_FOUND } from '../lib/messages';

export class UserController {
    // ユーザー一覧取得
    static async getUserList(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await prisma.user.findMany();
            res.json(users);
        } catch (error) {
            next(error);
        }
    }

    // ユーザー詳細取得
    static async getUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = parseOrThrow(userIdParamSchema, req.params, MSG_INVALID_REQUEST);
            const user = await prisma.user.findUnique({ where: { id } });

            if (!user) {
                throw new NotFoundError(MSG_USER_NOT_FOUND);
            }

            res.json(user);
        } catch (error) {
            if (error instanceof ValidationError || error instanceof NotFoundError) {
                return next(error);
            }
            next(error);
        }
    }

    // ユーザー作成
    static async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, email } = parseOrThrow(userCreateSchema, req.body, MSG_INVALID_INPUT);
            const user = await prisma.user.create({
                data: { name, email }
            });

            res.status(201).json(user);
        } catch (error) {
            if (error instanceof ValidationError) {
                return next(error);
            }
            try {
                handlePrismaError(error);
            } catch (prismaError) {
                return next(prismaError);
            }
        }
    }

    // ユーザー更新
    static async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = parseOrThrow(userIdParamSchema, req.params, MSG_INVALID_REQUEST);
            const updateData = parseOrThrow(userUpdateSchema, req.body, MSG_INVALID_INPUT);

            const user = await prisma.user.update({
                where: { id },
                data: updateData
            });

            res.json(user);
        } catch (error) {
            if (error instanceof ValidationError) {
                return next(error);
            }
            try {
                handlePrismaError(error);
            } catch (prismaError) {
                return next(prismaError);
            }
        }
    }

    // ユーザー削除
    static async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = parseOrThrow(userIdParamSchema, req.params, MSG_INVALID_REQUEST);
            const user = await prisma.user.delete({
                where: { id }
            });

            res.json(user);
        } catch (error) {
            if (error instanceof ValidationError) {
                return next(error);
            }
            try {
                handlePrismaError(error);
            } catch (prismaError) {
                return next(prismaError);
            }
        }
    }
}
