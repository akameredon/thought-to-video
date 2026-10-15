# Initial quality review — 2026-10-15

Branch: \`feature/offline-content-engine-v1\`  
Engine: \`1.2.0\`  
Corpus: 12 representative prompts across video, story, lesson, mini-course, full-course, and caption formats.

## Scope and limitation

This is an internal, model-assisted review of the current generated outputs against the repository's 40-point rubric. It is useful for prioritising fixes, but it is not a substitute for testing with real creators or getting an independent human reviewer. Scores are provisional and should be repeated after the next revision.

## Sample scores

| Sample | Format | Score / 40 | Faithfulness / 5 | Main finding |
|---|---|---:|---:|---|
| small-business | Video | 28 | 4 | Useful WhatsApp example, but the script repeats the same idea in the reflection and closing. |
| saving-money | Video | 27 | 4 | Practical tracking example; some lines are generic and the script could be tighter. |
| learning-ai | Video | 28 | 4 | Sound advice about checking AI outputs; needs a sharper, more memorable opening. |
| personal-story | Story | 22 | 4 | Safely avoids invented details, but is a story-building worksheet rather than a publish-ready story. |
| teach-pricing | Lesson | 27 | 4 | Relevant pricing practice is present; lesson explanation and assessment still need a worked numeric example. |
| mini-course-content | Mini-course | 23 | 4 | Subject-specific lesson sequence is improved, but repeated demonstration and practice text remains too templated. |
| full-course-budget | Course | 24 | 4 | Budget sequence is more relevant, but needs a complete worked budget example, learner materials, and answer guidance. |
| creator-consistency | Video | 26 | 4 | More realistic scheduling advice; needs less repetition and a stronger close. |
| community-cleanup | Story | 21 | 4 | Honest prompt structure, but not yet a finished narrative with a real turning point. |
| freelancer-boundaries | Lesson | 26 | 4 | Practical checklist direction; needs a sample scope-confirmation message and a clear evaluation example. |
| caption-launch | Caption | 28 | 4 | Preserves the idea, but the question and hashtag are generic rather than tailored to the launch. |
| long-thought | Video | 29 | 4 | Preserves the central point and has a practical example; can be more concise and less formulaic. |

**Provisional average: 25.8 / 40.**  
**Release gate: not met.** Four samples score below 25, and the overall average is below the target of 32. The current engine should not be described as ready for a broad launch.

## Fixes made during this review

- Replaced the generic video filler line with a topic-specific example.
- Added concrete examples for WhatsApp sales, budgeting, AI use, consistent publishing, prioritisation, freelancing, and community collection schedules.
- Added practice tasks for service pricing, budgeting, content planning, and freelance boundaries.
- Made mini-course and full-course lesson titles more specific for social-content planning and budgeting.
- Removed a redundant generic closing line and fixed a capitalization issue in first-person openings.
- Strengthened automated regression checks to verify that video outputs include a concrete example and do not include selected boilerplate phrases.

## Next priority order

1. **Make videos less repetitive.** Use one clear hook, preserve the user's strongest details, give one example, and finish with a single useful action or question.
2. **Turn lesson outlines into teaching-ready drafts.** Add worked examples with clearly labelled illustrative figures, step-by-step explanations, practice tasks, and answer/check guidance.
3. **Make story format honest and useful.** Keep asking for missing real details rather than presenting a worksheet as a finished story. Rename the output “Story Builder” unless the user has supplied enough facts for a complete narrative.
4. **Make captions launch-specific.** Preserve the original message and produce a relevant call to action without automatic generic hashtags.
5. **Run real user tests.** Ask at least five creators to try their own ideas, then compare their edit time, faithfulness ratings, and willingness to publish against this baseline.

