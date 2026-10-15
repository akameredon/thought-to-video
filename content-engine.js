/* Thought to Video: deterministic, offline-first content engine.
 * 10 families x 10 strategies x 10 perspectives = 1,000 reusable logic components.
 * These are structured rules, not 1,000 hardcoded scripts or a trained AI model.
 */
(function (root) {
  "use strict";
  const families = ["hook", "explanation", "story", "example", "transition", "conclusion", "lesson", "course", "caption", "quality"];
  const strategies = ["plain-language", "problem-first", "contrast", "question-led", "step-by-step", "myth-correction", "cause-and-effect", "beginner-friendly", "reflection", "action-first"];
  const perspectives = ["beginner", "small-business", "creator", "educator", "freelancer", "personal-brand", "community", "practical", "storyteller", "coach"];
  const components = [];
  for (const family of families) for (const strategy of strategies) for (const perspective of perspectives) {
    components.push({ id: family + "-" + strategy + "-" + perspective, family, strategy, perspective,
      instruction: "Use a " + strategy + " approach from a " + perspective + " perspective." });
  }

  const clean = value => String(value || "").replace(/\s+/g, " ").trim();
  const sentences = value => (value.match(/[^.!?]+[.!?]?/g) || [value]).map(s => s.trim()).filter(Boolean);
  const hash = value => { let n = 2166136261; for (let i = 0; i < value.length; i++) n = Math.imul(n ^ value.charCodeAt(i), 16777619); return n >>> 0; };
  const choose = (list, seed) => list[hash(seed) % list.length];
  function component(family, seed) {
    const matching = components.filter(item => item.family === family);
    return matching[hash(family + "|" + seed) % matching.length];
  }
  function firstPersonRisk(text) {
    return /\b(i|my|me|we|our|us)\b/i.test(text);
  }
  function caption(raw) {
    const topic = clean(raw);
    if (!topic) return "";
    const first = sentences(topic)[0] || topic;
    const prompt = /\b(price|pricing|cost|money|saving|budget|spend|income|profit)\b/i.test(topic)
      ? "What is one money decision you could review this week?"
      : /\b(business|customer|client|sales|product|service|shop)\b/i.test(topic)
        ? "Which part could you try in your business first?"
        : /\b(learn|teach|lesson|course|student|skill|practice)\b/i.test(topic)
          ? "What would you want to practise first?"
          : /\b(content|post|video|creator|audience|social media)\b/i.test(topic)
            ? "What is one useful idea you could share next?"
            : "Which part of this idea feels most useful to you?";
    const body = topic.length > first.length + 8 ? topic.slice(first.length).trim() : "";
    return first + (body ? "\n\n" + body : "") + "\n\n" + prompt + "\n\n#ThoughtToVideo";
  }
  function makeHook(idea, tone) {
    const first = (sentences(idea)[0] || idea).replace(/[.!?]+$/, "");
    const lower = idea.toLowerCase();
    if (/\bnot\b.{0,70}\bbefore\b/.test(lower)) return first + ".";
    if (/\b(difficult|hard|struggle|problem|mistake|waste|delay|stuck)\b/.test(lower)) {
      return choose([
        "If this has been harder than it should be, start here: " + first.charAt(0).toLowerCase() + first.slice(1) + ".",
        "The problem is not always a lack of effort. " + first + ".",
        "Here is the part of this problem worth paying attention to: " + first.charAt(0).toLowerCase() + first.slice(1) + "."
      ], idea + tone);
    }
    if (/\b(when|if|because|means|matters|believe|think)\b/.test(lower)) return first + ".";
    if (tone === "bold") return "Let’s get to the point: " + first.charAt(0).toLowerCase() + first.slice(1) + ".";
    if (tone === "helpful") return "Here is a practical way to look at it: " + first.charAt(0).toLowerCase() + first.slice(1) + ".";
    if (tone === "story") return "Start with the real moment behind this idea: " + first.charAt(0).toLowerCase() + first.slice(1) + ".";
    return first + ".";
  }
  function actionLine(idea) {
    const lower = idea.toLowerCase();
    if (/\b(whatsapp|customer|client|sales|business|product|service)\b/.test(lower))
      return "Make the next step visible to the people you serve. Choose one customer-facing action, do it consistently, and notice the questions or responses it brings back.";
    if (/\b(money|saving|budget|spend|income|cost|price|pricing|profit)\b/.test(lower))
      return "Make the next step small enough to measure. Write down the number, date, or decision you want to track, then review the result before changing the plan.";
    if (/\b(learn|learning|teach|student|skill|course|practice|practise|AI|programmer)\b/.test(lower))
      return "Turn the idea into a short practice session. Try one example yourself, check what worked, and explain the result in your own words before moving on.";
    if (/\b(content|post|video|creator|audience|social media)\b/.test(lower))
      return "Choose one clear message for one specific audience. Draft it, remove anything that does not support the message, and publish only when the point is easy to understand.";
    if (/\b(time|focus|progress|task|plan|consistent|consistency)\b/.test(lower))
      return "Define what a finished result looks like before you begin. Protect a short block of focused time, then compare the result with that definition instead of measuring activity alone.";
    return "Choose one action that follows directly from this idea. Keep it small, decide what a useful result would look like, and review what happened before choosing the next step.";
  }
  function demonstrationFor(idea) {
    const lower = idea.toLowerCase();
    if (/\b(whatsapp|customer|client|sales|business|product|service|shop)\b/.test(lower))
      return "For a shop using WhatsApp status, post one product photo with its price, availability, and a clear way to order. Track which questions customers ask so tomorrow's post answers a real question.";
    if (/\b(money|saving|budget|spend|income|cost|price|pricing|profit|bill)\b/.test(lower))
      return "For a simple weekly money review, write down each expense for seven days, group essentials separately from optional spending, then choose one change you can realistically keep. Do not set a savings target until you know what is left after essential bills.";
    if (/\b(ai|programmer|prompt|technology)\b/.test(lower))
      return "Instead of asking an AI tool to 'help with my business', describe one real task, the audience, the constraints, and the format you need. Then verify names, figures, and claims before using its answer.";
    if (/\b(content|post|video|creator|audience|social media)\b/.test(lower))
      return "For a local business, plan one post that answers a customer question, one that demonstrates the product, and one that explains how to buy. Put each on the calendar only if it serves a clear audience need.";
    if (/\b(consisten|schedule|every day|posting)\b/.test(lower))
      return "If daily posting is unrealistic, choose two repeatable days each week and prepare a small batch in advance. Keep the schedule only if you can maintain useful quality without exhausting yourself.";
    if (/\b(movement|progress|focus|task|plan|time)\b/.test(lower))
      return "Before opening messages or tutorials, write down the one deliverable that would make today successful. Work on it for a protected 25-minute block, then record whether the deliverable moved forward.";
    if (/\b(freelancer|deadline|revision|scope|payment)\b/.test(lower))
      return "Before starting a freelance job, send a short written agreement listing the deliverable, deadline, included revisions, payment schedule, and what counts as extra work. Ask the client to confirm it.";
    if (/\b(clean|street|resident|pickup|collection)\b/.test(lower))
      return "Residents could agree on a collection day, share the time and contact for missed pickups, and review after two weeks whether the arrangement reduced missed collections.";
    return "Choose one real situation where this idea applies. Write down the first action, the result you expect to see, and how you will check whether it worked.";
  }
  function practiceFor(idea) {
    const lower = idea.toLowerCase();
    if (/\b(price|pricing|service|cost|time|market)\b/.test(lower))
      return "Practice: price one service. List direct costs, estimate hours, choose a rate for that time, check comparable offers, and write exactly what the customer receives. Review whether the price covers the costs and time.";
    if (/\b(budget|spending|bills|saving|income)\b/.test(lower))
      return "Practice: create a one-week tracker with columns for date, item, amount, and essential or optional. Add the expenses you know, then update it daily and review the totals at week's end.";
    if (/\b(content|social media|post|creator|audience)\b/.test(lower))
      return "Practice: draft a seven-day content plan. For each day, write the audience question, one key message, the format, and the next step you want the audience to take. Remove posts that repeat the same purpose.";
    if (/\b(freelancer|deadline|revision|scope|payment)\b/.test(lower))
      return "Practice: write a project-confirmation message with the deliverable, deadline, number of revisions, payment terms, and how extra requests will be handled.";
    return "Practice: complete one small real-world task related to the idea. Save the result and note what you would change on a second attempt.";
  }
  function reflectionLine(idea) {
    const lower = idea.toLowerCase();
    if (/\b(money|saving|budget|spend|income|cost|price|pricing|profit)\b/.test(lower))
      return "You do not need to change everything at once. Compare what you planned with what actually happened, then use that evidence to make the next decision.";
    if (/\b(whatsapp|customer|client|sales|business|product|service|shop)\b/.test(lower))
      return "The goal is not to do more for its own sake. Make the message clear, then notice whether people understand the offer, ask better questions, or take the next step.";
    if (/\b(learn|learning|teach|student|skill|course|practice|practise|AI|programmer)\b/.test(lower))
      return "A useful sign of progress is being able to do the task with less help, not simply recognising the words or finishing a lesson.";
    if (/\b(content|post|video|creator|audience|social media)\b/.test(lower))
      return "A useful test is whether someone in that audience can repeat the main point and understand what they could do with it.";
    if (/\b(time|focus|progress|task|plan|consistent|consistency)\b/.test(lower))
      return "At the end, look at what actually changed. A short review helps separate meaningful progress from activity that only felt productive.";
    return "Pause and check the idea against a real situation. What evidence would tell you it helped, and what would you change if the first attempt did not work?";
  }
  function video(thought, tone, creator) {
    const idea = clean(thought);
    if (!idea) return "";
    const parts = sentences(idea);
    const hook = makeHook(idea, tone || "natural");
    const creatorLine = /\bsmall business owner\b/i.test(creator || "")
      ? "For a small business, the test is simple: does this help a real customer understand, decide, or act?"
      : /\bfreelancer\b/i.test(creator || "")
        ? "As a freelancer, connect the idea to the result a client can actually see."
        : /\beducator\b/i.test(creator || "")
          ? "When teaching this, give people a chance to try the idea rather than only hear about it."
          : "";
    const second = parts.length > 1 ? parts.slice(1).join(" ") : "";
    const action = actionLine(idea);
    const close = tone === "bold"
      ? "Choose one step and do it before adding another." 
      : tone === "story"
        ? "Use the lesson only as far as your real experience supports it."
        : tone === "helpful"
          ? "Start small, check the result, and adjust based on what you learn."
          : "What is one realistic step you can take next?";
    const sections = [hook];
    if (second) sections.push(second);
    else sections.push("The important thing is to connect the idea to a real situation, not leave it as a slogan.");
    sections.push(demonstrationFor(idea));
    sections.push(reflectionLine(idea));
    if (creatorLine) sections.push(creatorLine);
    sections.push(close);
    return sections.join("\n\n");
  }
  function course(thought, full) {
    const topic = clean(thought).replace(/[.!?]+$/, "");
    const lessons = full ? [
      ["Define the problem and the result", "Learners describe the starting problem and write one observable outcome they want to achieve."],
      ["Learn the key decisions", "Break the topic into its essential choices. Define unfamiliar terms and explain when each choice matters."],
      ["Follow a repeatable process", "Demonstrate the process in order. Learners make a first attempt using a guided checklist."],
      ["Compare worked examples", "Review a strong example and a common mistake. Ask learners to explain the difference and correct the mistake."],
      ["Practise with a new case", "Learners apply the process to their own situation and record the evidence or result."],
      ["Review and improve", "Learners compare their result with the original goal, identify one gap, and plan a second attempt."]
    ] : [
      ["Understand the outcome", "Describe what a beginner should be able to do and why it matters in a real situation."],
      ["Learn and follow the steps", "Demonstrate a short process with a worked example learners can copy."],
      ["Practise and review", "Give learners a task, a simple success checklist, and a way to correct one mistake."]
    ];
    let out = (full ? "COURSE OUTLINE" : "MINI-COURSE OUTLINE") + "\n" + topic +
      "\n\nWHO IT IS FOR\nBeginners who need a practical first result, not just an introduction to the subject." +
      "\n\nLEARNING OUTCOME\nBy the end, learners will use the process taught here to complete one small, observable task related to: " + topic + "." +
      "\n\nBEFORE YOU START\nAsk learners what they already know, what they need to do, and what a successful result would look like.";
    lessons.forEach((lesson, index) => {
      out += "\n\nLESSON " + (index + 1) + ": " + lesson[0] +
        "\nOutcome: " + lesson[1] +
        "\nDemonstration: Work through one example related to " + topic + ", explaining the decision at each step." +
        "\nPractice: Ask learners to complete one small step themselves and note where they got stuck." +
        "\nCheck: Ask learners to show or explain what they did, then compare it with the lesson outcome.";
    });
    return out + "\n\nFINAL PROJECT\nComplete one small real-world task related to " + topic + ". Include the starting point, the steps taken, the result, and one improvement for a second attempt." +
      "\n\nASSESSMENT CHECKLIST\n1. Can the learner explain the main idea in their own words?\n2. Can they demonstrate the process without copying every line?\n3. Does their result meet the stated outcome?\n4. Can they identify one mistake and how to correct it?" +
      "\n\nCREATOR NOTE\nReplace the demonstration prompts with accurate subject-specific examples before teaching. Do not present this outline as a finished expert course until the examples, instructions, and assessment have been completed.";
  }
  function story(thought, tone) {
    const idea = clean(thought);
    const personal = firstPersonRisk(idea);
    return "THE REAL STARTING POINT\n" + idea +
      "\n\nTHE TENSION\nWhat was uncertain, difficult, or at stake? Add only details that really happened or that you can verify. If this is an idea rather than a personal experience, describe the general challenge instead." +
      "\n\nTHE TURNING POINT\nWhat changed your understanding, or what practical choice could move the situation forward? Use a real moment; do not invent a dramatic event just to make the story stronger." +
      "\n\nTHE LESSON\nState the lesson in one clear sentence. Explain who it may help and what the listener could try." +
      "\n\nTHE CLOSE\n" + (personal
        ? "Before publishing, check that every first-person detail is true to your experience. Remove or rewrite anything that did not happen."
        : "If you want this to become a personal story, add the real people, moment, and decision behind the idea. Until then, present it as a reflection, not a claimed personal experience.") +
      "\n\nOPTIONAL DELIVERY NOTE\n" + (tone === "bold" ? "Keep the delivery direct; pause after the main lesson." : tone === "helpful" ? "Explain the lesson slowly and give the audience one practical step." : "Use your everyday speaking voice and leave space after the key point.");
  }
  function lesson(thought) {
    const idea = clean(thought);
    return "LESSON: " + idea +
      "\n\nLEARNING GOAL\nBy the end, learners should be able to explain the idea and complete one small task connected to it." +
      "\n\nEXPLAIN\nAsk learners what they already know. Define the central idea in plain language and connect it to a situation they recognise: " + idea + "." +
      "\n\nDEMONSTRATE\nWork through one example related to the idea. Say why you choose each step, and point out one common mistake without assuming every learner will face the same problem." +
      "\n\nPRACTISE\nGive learners a small version of the task to complete themselves. Ask them to write down the step they took and the result they observed." +
      "\n\nCHECK UNDERSTANDING\nAsk learners to explain the idea in their own words, demonstrate the first step, and say how they would know whether it worked." +
      "\n\nRECAP\nSummarise the main point in one sentence. End by asking learners to choose one realistic next action and identify what support they may need.";
  }
  function generate(options) {
    const thought = clean(options && options.thought);
    const tone = clean(options && options.tone) || "natural";
    const format = clean(options && options.format) || "video";
    const creator = clean(options && options.creator);
    if (!thought) return { script: "", caption: "", format, componentCount: components.length };
    let script;
    if (format === "course") script = course(thought, true);
    else if (format === "mini") script = course(thought, false);
    else if (format === "story") script = story(thought, tone);
    else if (format === "lesson") script = lesson(thought);
    else script = video(thought, tone, creator);
    return { script, caption: caption(thought), format, componentCount: components.length };
  }
  root.TTVContentEngine = {
    version: "1.1.0", componentCount: components.length, components: components.slice(), generate,
    component: (family, seed) => component(clean(family), clean(seed)),
    caption: raw => caption(clean(raw)), video: (raw, tone, creator) => video(raw, tone, creator),
    course: (raw, full) => course(raw, full), story: (raw, tone) => story(raw, tone), lesson: raw => lesson(raw)
  };
})(typeof window !== "undefined" ? window : globalThis);
