const key = 'lecture-feedback';
const version = 1;

function rating(position: number, metric: string, category: string, prompt: string, required: boolean,
    minLabel: string, maxLabel: string, interpretation: string) {
    return {
        id: null, category, prompt, type: 'RATING', required,
        ratingScale: { min: 1, max: 5, minLabel, maxLabel, interpretation },
        templateSource: { key, version, position },
        metricVersion: `${metric}@${version}`,
    };
}

// Version 1 is built into the application. Add another version for any future wording change.
export const lectureFeedbackStarter = {
    key, version, title: 'Lecture feedback',
    questions: [
        rating(1, 'content-clarity', 'Course Content', 'How clear was the content presented in this lecture?',
            true, 'Not clear', 'Very clear', 'Clarity of lecture content only.'),
        rating(2, 'explanation-effectiveness', 'Teaching Methods', "How effective were the instructor's explanations?",
            true, 'Not effective', 'Very effective', 'Effectiveness of explanations only.'),
        rating(3, 'learning-environment', 'Classroom Experience', 'How suitable was the learning environment for this lecture?',
            false, 'Not suitable', 'Very suitable', 'Learning environment only.'),
        {
            id: null, category: 'General Suggestions', prompt: 'What is one thing that could be improved in a future lecture?',
            type: 'TEXT', required: false, ratingScale: null, templateSource: { key, version, position: 4 }, metricVersion: null,
        },
    ],
};

export const starterPreview = {
    ...lectureFeedbackStarter,
    privacyNote: 'This starter creates an identified draft. Remove General Suggestions from the draft before switching to anonymous.',
};
