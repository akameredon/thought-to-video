# Thought to Video: quality gate

This checklist is the standard for deciding whether generated content is ready to improve or ship. A passing automated test does not replace a human review.

## Review method

For each benchmark idea, read the original thought and generated output side by side. Score each dimension from 0 to 5.

| Dimension | 0 | 3 | 5 |
|---|---|---|---|
| Faithfulness | Changes or loses the user's point | Keeps the general point, misses nuance | Preserves the meaning and important details |
| Opening | Irrelevant or misleading | Clear but familiar | Specific, compelling, honest, and suited to the idea |
| Structure | Confusing or disjointed | Understandable sequence | Every section advances one coherent message |
| Usefulness | Generic advice only | Some relevant action | Concrete, realistic value for this audience |
| Natural voice | Robotic, padded, repetitive | Mostly readable | Sounds like a real person speaking naturally |
| Specificity | Could fit almost any topic | Some topic details | Examples and language clearly belong to this idea |
| Format fit | Wrong shape for requested format | Basic requirements met | Format's purpose is fulfilled (not just headings added) |
| Ready to publish | Needs a complete rewrite | Needs noticeable edits | Only light personal edits needed |

Maximum: 40 points per sample.

## Decision gates

- Regression gate: node tests/quality-benchmark.mjs must pass. It checks minimum structure and retention of selected terms, not overall excellence.
- Manual quality gate: review at least 10 varied outputs and record scores. Do not call the engine ready for a wider release until the average is at least 32/40, no sample scores below 25/40, and no faithfulness score is below 4/5.
- Short-video length: aim for roughly 120–150 spoken words for a 60-second script, but prioritize clarity and natural pace over filling a quota. Flag scripts that are clearly too short or padded.
- No invented experience: first-person stories must not imply that the user personally experienced an event unless the user supplied that experience. A story structure may ask for missing details rather than fabricate them.
- No false certainty: avoid unsupported statistics, guarantees, fabricated quotes, and claims that cannot be checked.
- Audience fit: examples and vocabulary should fit the selected audience and the user's region/context when supplied.
- Courses: each lesson needs a distinct learning outcome, explanation or demonstration, practice task, and way to check understanding. A repeated template with generic descriptions is not a complete course.
- Captions: reflect the user's specific idea; avoid auto-appending irrelevant hashtags or generic engagement prompts when they do not fit.

## Benchmark record

For each review, record date, branch/commit, sample ID, format, dimension scores, total score, main failure, and next corrective action. Fix the most frequent high-impact failure first. Add new features only when evidence shows they improve these scores or remove a meaningful user obstacle.
