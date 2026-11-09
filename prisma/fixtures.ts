// Synthetic fixed UUIDs; no account secrets or response content.
export const fixtureId = (n: number) => `16000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
export const fixtures = {
  owners: [1, 2, 3].map(n => ({ id: fixtureId(n), email: `owner.${n}@example.test`, role: 'OWNER', displayName: `Synthetic Owner ${n}` })),
  respondents: [11, 12, 13, 14].map(n => ({ id: fixtureId(n), email: `respondent.${n}@example.test`, role: 'RESPONDENT', displayName: `Synthetic Respondent ${n}` })),
  courses: [{ id: fixtureId(101), code: 'SYN-CPE334', title: 'Synthetic Software Engineering' }, { id: fixtureId(102), code: 'SYN-CPE335', title: 'Synthetic Second Course' }],
  sections: [
    { id: fixtureId(201), courseId: fixtureId(101), term: 'Synthetic term', sectionCode: 'A', ownerId: fixtureId(1) },
    { id: fixtureId(202), courseId: fixtureId(101), term: 'Synthetic term', sectionCode: 'B', ownerId: fixtureId(2) },
    { id: fixtureId(203), courseId: fixtureId(102), term: 'Synthetic term', sectionCode: 'EMPTY', ownerId: fixtureId(1) }
  ],
  memberships: [
    { sectionId: fixtureId(201), studentId: fixtureId(11) },
    { sectionId: fixtureId(201), studentId: fixtureId(12) },
    { sectionId: fixtureId(202), studentId: fixtureId(13) }
  ],
  lectures: [
    { id: fixtureId(301), sectionId: fixtureId(201), title: 'Synthetic lecture one', lectureDate: '2026-11-08', sequence: 1 },
    { id: fixtureId(302), sectionId: fixtureId(201), title: 'Synthetic lecture two', lectureDate: '2026-11-08', sequence: 2 },
    { id: fixtureId(303), sectionId: fixtureId(202), title: 'Other owner lecture', lectureDate: '2026-11-08', sequence: 1 }
  ],
  survey: { id: fixtureId(401), lectureId: fixtureId(301), ownerId: fixtureId(1), title: 'Synthetic Draft', status: 'DRAFT', mode: 'IDENTIFIED', definitionRevision: 1 },
  questions: [
    { id: fixtureId(501), surveyId: fixtureId(401), position: 1, prompt: 'How clear was the synthetic lecture?', type: 'RATING', required: true,
      ratingMin: 1, ratingMax: 5, ratingMinLabel: 'Not clear', ratingMaxLabel: 'Very clear', scaleInterpretation: 'Higher means clearer content.' },
    { id: fixtureId(502), surveyId: fixtureId(401), position: 2, prompt: 'Synthetic suggestions', type: 'TEXT', required: false }
  ]
};
