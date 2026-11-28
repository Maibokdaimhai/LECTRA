import { expect, it } from 'vitest';
import { resultsCsv } from '../../src/results-csv.js';

it('TEST-F08-U01: quotes embedded separators and neutralizes spreadsheet formula prefixes', () => {
    const csv = resultsCsv({
        survey: {
            id: 'survey', title: '  =1+1', mode: 'IDENTIFIED',
            context: {
                course: { code: 'CPE334' },
                section: { sectionCode: 'A', term: '2026' },
                lecture: { title: 'สัปดาห์, "หนึ่ง"', lectureDate: '2026-11-28' },
            },
        },
        questions: [
            {
                questionId: 'question', prompt: '\tรายละเอียด\nบรรทัดถัดไป', type: 'SINGLE_CHOICE',
                answeredCount: 1, distribution: [{ label: '＠ข้อความ', count: 1 }, { label: '+1+1', count: 0 }],
            },
        ],
    });
    expect(csv).toContain('"สัปดาห์, ""หนึ่ง"""');
    expect(csv).toContain('"\'  =1+1"');
    expect(csv).toContain('"\'\tรายละเอียด\nบรรทัดถัดไป"');
    expect(csv).toContain('"\'＠ข้อความ",1\r\n');
    expect(csv).toContain('"\'+1+1",0\r\n');
});
