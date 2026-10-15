# Initial quality review — 2026-10-15

Branch: \`feature/offline-content-engine-v1\`  
Engine: \`1.2.0\`  
Corpus: 12 representative prompts across video, story, lesson, mini-course, full-course, and caption formats.

## Scope and limitation

This is an internal, model-assisted review of the current generated outputs against the repository's 40-point rubric. It is useful for prioritising fixes, but it is not a substitute for testing with real creators or getting an independent human reviewer. Scores are provisional baseline scores from the first pass of this review, before the final topic-routing and course-outline edits in the commit sequence. They should be repeated against the latest commit before any release decision.

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



## Follow-up changes — engine 1.3.1

The next pass was implemented after the initial scores above:

- Video scripts no longer include the generic reflection paragraph that often repeated the user's main point; a practical next action is used instead.
- Course and mini-course lessons now use topic-aware demonstrations and practice tasks instead of repeating the same placeholder instructions in every lesson.
- Story output is explicitly labelled **STORY BUILDER — COMPLETE WITH VERIFIED DETAILS** so users are less likely to mistake a guided template for a finished, fact-checked narrative.
- The helpful-tone close was shortened to reduce overlap with the action section.
- Automated tests now check story-builder labelling and concrete course demonstrations/practice.

Latest GitHub Actions run for engine 1.3.1: https://github.com/akameredon/thought-to-video/actions/runs/38774565199

- Smoke tests: passed.
- Automated corpus cases: 12/12 passed.
- Selected boilerplate phrase hits: 0.
- Average video script length: 104 words, still below the rough 120–150-word guide for a 60-second video. This is a remaining improvement area, not something to solve by padding every script.

The initial sample scores above are retained as the baseline and have not been re-scored after these changes. The manual quality gate therefore remains open.
