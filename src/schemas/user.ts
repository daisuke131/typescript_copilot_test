import { z } from 'zod';

// ユーザー作成用のボディスキーマ
export const userCreateSchema = z.object({
    name: z.string().trim().min(1, { message: 'name は必須です' }),
    email: z.string().trim().email({ message: '有効なメールアドレスを指定してください' })
});

// ルートパラメータ（id）用のスキーマ
export const userIdParamSchema = z.object({
    id: z.coerce
        .number()
        .int({ message: 'id は正の整数で指定してください' })
        .positive({ message: 'id は正の整数で指定してください' })
});

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserIdParamInput = z.infer<typeof userIdParamSchema>;
