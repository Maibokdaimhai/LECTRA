import type { Request, Response, NextFunction } from 'express';
export class HttpError extends Error {
    constructor(public status: number, public code: string, message = 'Request could not be completed.') { super(message); }
}
export const fail = (status: number, code: string, message?: string): never => { throw new HttpError(status, code, message); };
export const uuid = (value: unknown, code = 'VALIDATION_FAILED'): string => typeof value === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(value) ? value : fail(422, code);
export function exact(value: unknown, keys: string[], code = 'VALIDATION_FAILED') {
    if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some(k => !keys.includes(k)) || keys.some(k => !(k in value)))
        fail(422, code);
}
export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
    if (res.headersSent)
        return;
    if (error instanceof HttpError) {
        res.status(error.status).json({ error: { code: error.code, message: error.message } });
        return;
    }
    const code = (error as {
        code?: string;
    })?.code;
    const status = (error as {
        status?: number;
    })?.status;
    if (status === 413) {
        res.status(413).json({ error: { code: 'BODY_TOO_LARGE', message: 'Request is too large.' } });
        return;
    }
    if (status === 415) {
        res.status(415).json({ error: { code: 'UNSUPPORTED_CONTENT', message: 'Unsupported request content.' } });
        return;
    }
    if (code === '23505' && (error as {
        constraint?: string;
    }).constraint === 'Survey_lectureId_key') {
        res.status(409).json({ error: { code: 'SURVEY_ALREADY_EXISTS', message: 'A survey already exists for this lecture.' } });
        return;
    }
    if (['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', '57P01', '57P03', '53300', '55P03', '57014'].includes(code ?? '')) {
        res.status(503).json({ error: { code: 'SERVICE_UNAVAILABLE', message: 'The service is temporarily unavailable.' } });
        return;
    }
    if (code === 'P2002' || code === '23505') {
        res.status(409).json({ error: { code: 'CONFLICT', message: 'The requested change conflicts with existing data.' } });
        return;
    }
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Request could not be completed.' } });
}
