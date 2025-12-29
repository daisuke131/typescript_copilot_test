import { ZodType } from 'zod';
import { ValidationError } from './errors';

export function parseOrThrow<T>(schema: ZodType<T>, data: unknown, fallbackMessage: string): T {
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
        throw new ValidationError(parsed.error.issues[0]?.message ?? fallbackMessage);
    }
    return parsed.data;
}
