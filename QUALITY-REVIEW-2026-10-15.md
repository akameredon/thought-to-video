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



## Follow-up quality pass — engine 1.4.3

This pass follows the 1.3.1 changes and focuses on teaching utility and actionable captions:

- Captions now end with a topic-relevant action instead of a generic engagement question.
- Course and mini-course lessons use distinct, topic-specific demonstrations and lesson tasks. Automated tests check that the demonstration and practice text is not repeated across lessons.
- Pricing lessons include a worked calculation (illustrative figures only, before overhead, taxes, or profit). Freelancer-boundary lessons receive a sample scope-confirmation message.
- Lesson topic titles remove trailing punctuation, and pricing lessons are routed to pricing examples instead of a mismatched shop/WhatsApp example.
- The story format remains clearly identified as a story builder and asks users to verify personal details instead of inventing them.

Latest CI run: https://github.com/akameredon/thought-to-video/actions/runs/38775248443

- GitHub Actions: success.
- All 12 benchmark cases passed the repository's automated structural, selected-term, and boilerplate checks.
- Manual review scores have not yet been repeated for this version. Automated pass status is not evidence that the release quality gate has been met.
- Video output remains uneven in length: several samples are under 120 words. Do not pad mechanically; the next review should assess whether each short script needs a stronger idea-specific explanation or should remain concise.


## Re-review after topic-routing fixes — engine 1.4.3

Reviewed the current output from all 12 corpus prompts on commit `f9d744985c98d43b2ff8ea001f65f7f3c645b75a`. The latest automated smoke-test workflow for this commit passed: https://github.com/akameredon/thought-to-video/actions/runs/38776657690

The following scores are a **provisional model-assisted re-score**, not independent human-user research. They are intended to decide what to fix next, not to claim release readiness.

| Sample | Format | Provisional score / 40 | Faithfulness / 5 | Main remaining issue |
|---|---|---:|---:|---|
| small-business | Video | 30 | 4 | Stronger specific advice, but still shorter than a full 60-second script and the opening is not very surprising. |
| saving-money | Video | 29 | 4 | Sensible caution and practical steps; could explain how to review the seven-day record without repeating the advice. |
| learning-ai | Video | 30 | 4 | The AI example is now topic-matched; still needs a sharper demonstration of checking an actual answer. |
| personal-story | Story builder | 22 | 4 | Honest about missing facts, but remains a fill-in structure rather than a publish-ready story. |
| teach-pricing | Lesson | 31 | 4 | Includes a worked cost calculation; needs a separate market-check example and a learner answer/check rubric. |
| mini-course-content | Mini-course | 25 | 4 | The sequence is relevant, but several practice tasks simply repeat the outcome and the creator note confirms it is not teaching-ready. |
| full-course-budget | Course | 26 | 4 | Useful sequence, but the demonstrations still do not form a complete worked budget with sample amounts and answer guidance. |
| creator-consistency | Video | 29 | 4 | Realistic schedule example; script remains short and could distinguish a sustainable schedule from a content-quality check more clearly. |
| community-cleanup | Story builder | 21 | 4 | Avoids invented events, but has no real turning point until the user supplies one. |
| freelancer-boundaries | Lesson | 31 | 4 | The example now matches scope boundaries; add a checklist showing whether a sample agreement is complete. |
| caption-launch | Caption | 30 | 4 | The call to action is launch-oriented; it still needs the actual product promise or access step from the user to become campaign-ready. |
| long-thought | Video | 31 | 4 | The central point and concrete action are preserved; further editing can reduce formulaic phrasing. |

**Provisional average: 27.9 / 40. Release gate remains unmet.** The strongest improvement is that lesson examples now match the topic instead of mixing pricing, budgeting, and freelancer advice. Stories and courses remain the weakest formats, and the videos are often concise rather than fully developed for a 60-second delivery.

### Changes in this pass

- Removed the unrelated budgeting demonstration from lesson outputs; the lesson now uses the topic-matched worked example.
- Prioritized the freelancer scope-confirmation example before generic pricing logic.
- Prioritized AI examples before generic learning examples in video demonstration routing.
- Replaced repeated video action wording with a topic-specific supporting detail.
- Made launch-related captions prompt for a clear audience promise and next step.
- Added regression assertions for pricing examples, freelancer scope wording, and AI-specific examples.
- Confirmed all 12 generated outputs retained their required corpus terms and the latest workflow completed successfully.

### Next quality work

1. Replace repeated course practice prompts with distinct, observable learner tasks and add worked budget figures with explicit sample assumptions.
2. Offer story modes that distinguish a personal story (requires verified details) from a general illustrative narrative, without inventing a user's lived experience.
3. Expand short video scripts only when the original idea supports a useful explanation, counterexample, or decision rule; do not pad to hit a word count.
4. Add a manual review with real creators before declaring the manual quality gate passed.

## Course and story quality pass — engine 1.5.0

Updated on 2026-10-16. This pass addresses the two weakest areas identified above: course practice that merely repeated lesson outcomes, and personal-story output that was too much of a worksheet.

### Changes implemented

- Added distinct, observable practice tasks and topic-matched checks for each content-planning and budgeting lesson. General-topic courses also receive a progression from defining success to practising, correcting a mistake, and reviewing evidence.
- Added an explicitly illustrative budget worked example: income 1,500 units; listed essentials 1,110; apparent remainder 390 before unlisted bills, debt, savings, irregular costs, or other commitments. The example tells learners to replace every amount with confirmed figures and not to treat the remainder as automatically spendable.
- Added an arithmetic answer check for the worked budget example.
- Personal-story prompts that use “I”, “my”, or “me” now receive a more usable draft built only from supplied details, plus a clear prompt to add the real turning point and verify the sequence before publishing. Collective/community statements remain in the labelled Story Builder flow so they are not mistakenly treated as personal anecdotes.
- Expanded the regression benchmark to check the budget arithmetic, fact-check reminder, and story mode labels.

### Validation status

The smoke-test step passed on the first CI run for this pass, but the expanded quality benchmark then failed because the story-routing condition incorrectly treated a collective community statement as a personal story. That routing condition was corrected. The latest branch commit is `9bea7894902c01f8732a404178dc0eb63a980447`; a passing workflow for that exact commit has not yet been confirmed, so the current test status is **pending verification**, not passed.

The manual quality gate remains open. These code changes improve course tasks and the personal-story starting draft, but they do not establish that the full engine reaches the 32/40 average release target or that users would publish outputs without significant edits. Community stories still need real turning-point details from the user, and a full course still needs subject-matter review before it is taught as a finished course.

## Follow-up routing fixes — engine 1.5.1

Updated on 2026-10-16 after reviewing the actual output from all 12 corpus cases.

- Fixed a keyword collision where the phrase “at any cost” sent a consistency video into budgeting advice. Consistency-related routing now takes priority, and the output reinforces a sustainable publishing schedule instead of discussing savings or a financial snapshot.
- Fixed freelancer lesson practice routing: the word “time” previously triggered generic service-pricing practice. Freelancer lessons now ask learners to draft a project-confirmation message covering deliverable, deadline, revisions, payment terms, and extra requests.
- Helpful-tone video endings now use an idea-specific next action rather than the same generic question across videos.
- Added regression checks for all three issues.

Validation for branch head `20771270058e35fc0e68ee57249f1d977b297de4`:
- GitHub Actions smoke tests: passed.
- Quality benchmark 1.5.1: passed, 12/12 corpus cases (100% automated pass rate).
- Registered components: 1,000.
- Average generated video length in the benchmark: 118 words. Individual scripts vary by idea; keep clarity ahead of mechanically filling a word target.
- Deploy Preview generated for the latest commit: https://deploy-preview-3--thought-to-video.netlify.app

The manual quality gate is still open. These regression tests verify known routing and structure issues, not the overall 32/40 manual quality target, factual accuracy in every possible topic, or readiness for a broad release. The PR remains open and unmerged.
