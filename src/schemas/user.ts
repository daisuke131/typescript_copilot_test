import { z } from 'zod';

// ユーザー作成用のボディスキーマ
export const userCreateSchema = z.object({
    name: z.string().trim().min(1, { message: 'name は必須です' }),
    email: z.string().trim().pipe(z.email({ message: '有効なメールアドレスを指定してください' }))
});

// ユーザー更新用のボディスキーマ（部分更新）
export const userUpdateSchema = z.object({
    name: z.string().trim().min(1, { message: 'name は1文字以上である必要があります' }).optional(),
    email: z.string().trim().pipe(z.email({ message: '有効なメールアドレスを指定してください' })).optional()
}).refine(data => Object.keys(data).length > 0, {
    message: 'name または email の少なくとも1つを指定してください'
});

// ルートパラメータ（id）用のスキーマ
export const userIdParamSchema = z.object({
    id: z.coerce
        .number()
        .int({ message: 'id は正の整数で指定してください' })
        .positive({ message: 'id は正の整数で指定してください' })
});

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type UserIdParamInput = z.infer<typeof userIdParamSchema>;
