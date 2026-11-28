type CsvQuestion = {
    questionId: string;
    category?: string;
    prompt: string;
    type: string;
    suppressed?: boolean;
    answeredCount?: number;
    mean?: string | null;
    distribution?: { score?: number; label?: string; count: number }[];
};

type CsvSnapshot = {
    survey: {
        id: string;
        title: string;
        mode: string;
        context: {
            course: { code: string };
            section: { sectionCode: string; term: string };
            lecture: { title: string; lectureDate: string };
        };
    };
    questions?: CsvQuestion[];
};

const header = [
    'format_version', 'course_code', 'section_code', 'term', 'lecture_title', 'lecture_date', 'survey_id',
    'survey_title', 'survey_mode', 'question_id', 'question_category', 'question_prompt', 'question_type',
    'result_status', 'answered_count', 'mean', 'rating_score', 'option_label', 'bin_count',
].join(',');

function textCell(value: string) {
    const formulaPrefix = /^[=+\-@＝＋－＠]/u.test(value.trimStart());
    const leadingControl = /^[\u0000-\u001f\u007f]/u.test(value);
    const literal = formulaPrefix || leadingControl ? "'" + value : value;
    return '"' + literal.replaceAll('"', '""') + '"';
}

export function resultsCsv({ survey, questions }: CsvSnapshot) {
    const { course, section, lecture } = survey.context;
    const surveyCells = [
        '1', ...[course.code, section.sectionCode, section.term, lecture.title, lecture.lectureDate,
            survey.id, survey.title, survey.mode].map(textCell),
    ];
    const lines = [header];
    for (const question of questions ?? []) {
        if (question.type !== 'RATING' && question.type !== 'SINGLE_CHOICE')
            continue;
        const prefix = [...surveyCells, textCell(question.questionId), question.category ? textCell(question.category) : '',
            textCell(question.prompt), textCell(question.type)];
        if (question.suppressed) {
            lines.push([...prefix, textCell('SUPPRESSED'), '', '', '', '', ''].join(','));
        } else if (question.answeredCount === 0) {
            lines.push([...prefix, textCell('NO_DATA'), '0', '', '', '', ''].join(','));
        } else {
            for (const bin of question.distribution ?? []) {
                lines.push([...prefix, textCell('RELEASED'), question.answeredCount, question.mean ?? '',
                    bin.score ?? '', bin.label === undefined ? '' : textCell(bin.label), bin.count].join(','));
            }
        }
    }
    return '\uFEFF' + lines.join('\r\n') + '\r\n';
}
