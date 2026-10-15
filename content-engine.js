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
    const lower = topic.toLowerCase();
    const prompt = /\b(price|pricing|cost|money|saving|budget|spend|income|profit)\b/.test(lower)
      ? "Try this: review one real expense or money decision this week, using your actual numbers."
      : /\b(business|customer|client|sales|product|service|shop|whatsapp)\b/.test(lower)
        ? "Try this: choose one customer question and make your next post answer it clearly."
        : /\b(learn|teach|lesson|course|student|skill|practice|practise|ai)\b/.test(lower)
          ? "Try this: practise one small task, then check your result before moving on."
          : /\b(content|post|video|creator|audience|social media)\b/.test(lower)
            ? "Try this: write one clear message for one specific audience before choosing the format."
            : "Try this: choose one small action that follows from the idea, and notice what changes.";
    const body = topic.length > first.length + 8 ? topic.slice(first.length).trim() : "";
    return first + (body ? "\n\n" + body : "") + "\n\n" + prompt + "\n\n#ThoughtToVideo";
  }
  function makeHook(idea, tone) {
    const first = (sentences(idea)[0] || idea).replace(/[.!?]+$/, "");
    const lead = /^I\b/.test(first) ? first : first.charAt(0).toLowerCase() + first.slice(1);
    const lower = idea.toLowerCase();
    if (/\bnot\b.{0,70}\bbefore\b/.test(lower)) return first + ".";
    if (/\b(difficult|hard|struggle|problem|mistake|waste|delay|stuck)\b/.test(lower)) {
      return choose([
        "If this has been harder than it should be, start here: " + lead + ".",
        "The problem is not always a lack of effort. " + first + ".",
        "Here is the part of this problem worth paying attention to: " + lead + "."
      ], idea + tone);
    }
    if (/\b(when|if|because|means|matters|believe|think)\b/.test(lower)) return first + ".";
    if (tone === "bold") return "Let’s get to the point: " + lead + ".";
    if (tone === "helpful") return "Here is a practical way to look at it: " + lead + ".";
    if (tone === "story") return "Start with the real moment behind this idea: " + lead + ".";
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
    if (/\b(consisten|schedule|every day|posting)\b/.test(lower))
      return "If daily posting is unrealistic, choose two repeatable days each week and prepare a small batch in advance. Keep the schedule only if you can maintain useful quality without exhausting yourself.";
    if (/\b(money|saving|budget|income|price|pricing|profit|bill|expenses?|spending)\b/.test(lower))
      return "For a simple weekly money review, write down each expense for seven days, group essentials separately from optional spending, then choose one change you can realistically keep. Do not set a savings target until you know what is left after essential bills.";
    if (/\b(education|learn|learning|teach|student|skill|course|practice|practise)\b/.test(lower))
      return "For example, if you are learning a new skill, practise one small task, compare your result with a clear standard, and note one thing to improve.";
    if (/\b(ai|programmer|prompt|technology)\b/.test(lower))
      return "Instead of asking an AI tool to 'help with my business', describe one real task, the audience, the constraints, and the format you need. Then verify names, figures, and claims before using its answer.";
    if (/\b(content|post|video|creator|audience|social media)\b/.test(lower))
      return "For a local business, plan one post that answers a customer question, one that demonstrates the product, and one that explains how to buy. Put each on the calendar only if it serves a clear audience need.";
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
    const close = tone === "bold"
      ? "Choose one step and do it before adding another." 
      : tone === "story"
        ? "Use the lesson only as far as your real experience supports it."
        : tone === "helpful"
          ? "Use what happened to decide on your next step."
          : "What is one realistic step you can take next?";
    const sections = [hook];
    if (second) sections.push(second);
    sections.push(demonstrationFor(idea));
    sections.push(actionLine(idea));
    if (creatorLine) sections.push(creatorLine);
    sections.push(close);
    return sections.join("\n\n");
  }
  function courseDemonstration(topic, lesson, index) {
    const lower = topic.toLowerCase();
    if (/content|social media|post|creator|audience/.test(lower)) {
      const examples = [
        "Sample: a neighbourhood bakery wants more weekday orders. Name the customer group first, such as nearby workers who need a quick lunch.",
        "Sample: give the bakery three distinct post purposes: answer a question about opening hours, show today's products, and explain how to place an order.",
        "Sample: turn 'people ask if delivery is available' into a post that states the delivery area, fee if confirmed, and how to order.",
        "Sample: place the question-answer post on Monday, product demonstration on Wednesday, and ordering details on Friday; use the other days only if there is something useful to say.",
        "Sample: check the draft for a clear product, accurate price and availability, understandable wording, and one ordering step.",
        "Sample: review enquiries and repeated questions after a week; use those signals to decide what to explain next, rather than assuming likes equal sales."
      ];
      return examples[index % examples.length];
    }
    if (/budget|spending|bills|saving|income|money/.test(lower)) {
      const examples = [
        "Sample: write down the dates income is expected and the dates rent, transport, food, and other essential bills must be paid; leave unknown amounts blank until confirmed.",
        "Sample: mark food and required transport as essential for this exercise, while separating a non-urgent purchase for review. The categories depend on the learner's real needs.",
        "Sample: record a real expense as date, item, amount, and category; use the amount actually paid, not an invented estimate.",
        "Sample: compare the date a bill is due with the next expected income date. If income arrives later, identify the gap early and consider safe, realistic options.",
        "Sample: choose one flexible expense to examine, then compare its real cost with the value it provides before deciding whether to change it.",
        "Sample: compare planned spending with the week's actual entries, explain any difference, and carry forward only a change that remains realistic."
      ];
      return examples[index % examples.length];
    }
    return "Worked example: model the task described in this lesson using a clearly identified sample. Explain each decision, state any assumptions, and show learners how to check the result.";
  }
  function course(thought, full) {
    const topic = clean(thought).replace(/[.!?]+$/, "");
    const lowerTopic = topic.toLowerCase();
    const isContentPlan = /content|social media|post|creator|audience/.test(lowerTopic);
    const isBudget = /budget|spending|bills|saving|income|money/.test(lowerTopic);
    const lessons = isContentPlan ? (full ? [
      ["Choose a specific audience", "Describe one local customer group and list three questions they commonly ask."],
      ["Set three content purposes", "Separate helpful answers, product demonstrations, and buying information."],
      ["Turn questions into post ideas", "Write one clear message for each idea and choose a suitable format."],
      ["Build the seven-day calendar", "Place varied posts across seven days without repeating the same purpose."],
      ["Draft and check each post", "Check accuracy, clarity, relevance, and the next step for the audience."],
      ["Review results and improve", "Use questions, replies, saves, or enquiries as signals for the next week's plan."]
    ] : [
      ["Choose the audience and goal", "Name one customer group and one result the content should help achieve."],
      ["Create three useful post types", "Draft a customer answer, a product demonstration, and a buying-information post."],
      ["Make a seven-day plan", "Put the ideas on a calendar and check that each post has a distinct purpose."]
    ]) : isBudget ? (full ? [
      ["Map income and bill dates", "List expected income dates and essential bills with their due dates."],
      ["Separate essential and flexible spending", "Sort known expenses into clear categories without guessing missing amounts."],
      ["Build a weekly spending tracker", "Record date, item, amount, and category for each expense."],
      ["Plan for bills before spending", "Compare bill dates with expected income and identify any timing gap early."],
      ["Make a realistic adjustment", "Choose one flexible expense to review without cutting essential needs blindly."],
      ["Review and revise the budget", "Compare planned and actual amounts, explain differences, and update the next week."]
    ] : [
      ["List income and essential bills", "Record expected income, bill amounts, and due dates."],
      ["Track one week of spending", "Log each expense and label it essential or flexible."],
      ["Review and choose one change", "Compare totals and select one realistic adjustment for next week."]
    ]) : full ? [
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
        "\nDemonstration: " + courseDemonstration(topic, lesson, index) +
        "\nPractice: Complete this task: " + lesson[1] +
        "\nCheck: " + (index === 0
          ? "Can the learner show the starting information and explain what is known versus unknown?"
          : index === lessons.length - 1
            ? "Can the learner explain what changed, support the conclusion with their own records, and name one next improvement?"
            : "Can the learner complete the task without copying the example and explain why the chosen step fits the goal?");
    });
    return out + "\n\nFINAL PROJECT\nComplete one small real-world task related to " + topic + ". Include the starting point, the steps taken, the result, and one improvement for a second attempt." +
      "\n\nASSESSMENT CHECKLIST\n1. Can the learner explain the main idea in their own words?\n2. Can they demonstrate the process without copying every line?\n3. Does their result meet the stated outcome?\n4. Can they identify one mistake and how to correct it?" +
      "\n\nCREATOR NOTE\nReplace the demonstration prompts with accurate subject-specific examples before teaching. Do not present this outline as a finished expert course until the examples, instructions, and assessment have been completed.";
  }
  function story(thought, tone) {
    const idea = clean(thought);
    const personal = firstPersonRisk(idea);
    return "STORY BUILDER — COMPLETE WITH VERIFIED DETAILS\nTHE REAL STARTING POINT\n" + idea +
      "\n\nTHE TENSION\nWhat was uncertain, difficult, or at stake? Add only details that really happened or that you can verify. If this is an idea rather than a personal experience, describe the general challenge instead." +
      "\n\nTHE TURNING POINT\nWhat changed your understanding, or what practical choice could move the situation forward? Use a real moment; do not invent a dramatic event just to make the story stronger." +
      "\n\nTHE LESSON\nState the lesson in one clear sentence. Explain who it may help and what the listener could try." +
      "\n\nTHE CLOSE\n" + (personal
        ? "Before publishing, check that every first-person detail is true to your experience. Remove or rewrite anything that did not happen."
        : "If you want this to become a personal story, add the real people, moment, and decision behind the idea. Until then, present it as a reflection, not a claimed personal experience.") +
      "\n\nOPTIONAL DELIVERY NOTE\n" + (tone === "bold" ? "Keep the delivery direct; pause after the main lesson." : tone === "helpful" ? "Explain the lesson slowly and give the audience one practical step." : "Use your everyday speaking voice and leave space after the key point.");
  }
  function lessonWorkedExample(idea) {
    const lower = idea.toLowerCase();
    if (/price|pricing|service|freelance|cost/.test(lower))
      return "Worked example: suppose a service costs 4,000 in direct expenses and takes 3 hours. If the provider values their time at 2,000 per hour, the starting cost calculation is 4,000 + (3 × 2,000) = 10,000 before taxes, overhead, or profit. This is an illustration, not a market price; replace it with your own figures and check what the offer includes.";
    if (/budget|spending|saving|income|bills|money/.test(lower))
      return "Worked example: list the income you actually expect, subtract essential bills due before the next income date, and treat the remainder as a planning figure rather than money automatically available to spend. Use confirmed amounts and leave unknowns clearly marked.";
    if (/freelancer|deadline|revision|scope|payment/.test(lower))
      return "Worked example: 'I will deliver one edited 60-second video by Friday. The price includes one revision. Work begins after the agreed deposit; additional edits or new deliverables will be quoted separately.' Adjust the terms to the actual agreement and local law.";
    return "Worked example: choose a small, real case related to the idea. State the starting information, explain each decision, show the result, and point out one assumption the learner should verify.";
  }
  function lesson(thought) {
    const idea = clean(thought).replace(/[.!?]+$/, "");
    return "LESSON: " + idea +
      "\n\nLEARNING GOAL\nBy the end, learners should be able to explain the idea and complete one small task connected to it." +
      "\n\nEXPLAIN\nAsk learners what they already know. Define the central idea in plain language and connect it to a situation they recognise: " + idea + "." +
      "\n\nDEMONSTRATE\n" + demonstrationFor(idea) + "\n" + lessonWorkedExample(idea) + "\nExplain why each step matters and identify one common mistake to avoid." +
      "\n\nPRACTISE\n" + practiceFor(idea) +
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
    version: "1.4.2", componentCount: components.length, components: components.slice(), generate,
    component: (family, seed) => component(clean(family), clean(seed)),
    caption: raw => caption(clean(raw)), video: (raw, tone, creator) => video(raw, tone, creator),
    course: (raw, full) => course(raw, full), story: (raw, tone) => story(raw, tone), lesson: raw => lesson(raw)
  };
})(typeof window !== "undefined" ? window : globalThis);
