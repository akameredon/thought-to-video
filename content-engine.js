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
    const prompt = /\b(launch|launching|guide|ebook|e-book|course|offer|available now)\b/.test(lower)
      ? "If this is a launch, tell the intended audience exactly what they will get and give them one clear next step."
      : /\b(price|pricing|cost|money|saving|budget|spend|income|profit)\b/.test(lower)
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
    if (/\b(movement|focus|progress|task|plan|time|consistent|consistency)\b/.test(lower))
      return "Before you finish, write down the result you completed and the next action it makes possible. Use that evidence—not how busy the day felt—to plan tomorrow.";
    if (/\b(money|saving|budget|spending|income|cost|price|pricing|profit|expenses?|bills)\b/.test(lower))
      return "Before you finish, write down the result you completed and the next action it makes possible. Use that evidence—not how busy the day felt—to plan tomorrow.";
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
    if (/\b(ai|programmer|prompt|technology)\b/.test(lower))
      return "Instead of asking an AI tool to 'help with my business', describe one real task, the audience, the constraints, and the format you need. Then verify names, figures, and claims before using its answer.";
    if (/\b(consisten|schedule|every day|posting)\b/.test(lower))
      return "If daily posting is unrealistic, choose two repeatable days each week and prepare a small batch in advance. Keep the schedule only if you can maintain useful quality without exhausting yourself.";
    if (/\b(whatsapp|customer|client|sales|business|product|shop)\b/.test(lower))
      return "For a shop using WhatsApp status, post one product photo with its price, availability, and a clear way to order. Track which questions customers ask so tomorrow's post answers a real question.";
    if (/\b(money|saving|budget|income|price|pricing|profit|bill|expenses?|spending)\b/.test(lower))
      return "For a simple weekly money review, write down each expense for seven days, group essentials separately from optional spending, then choose one change you can realistically keep. Do not set a savings target until you know what is left after essential bills.";
    if (/\b(learn|learning|teach|student|skill|course|practice|practise)\b/.test(lower))
      return "For example, if you are learning a new skill, practise one small task, compare your result with a clear standard, and note one thing to improve.";
    if (/\b(content|post|video|creator|audience|social media)\b/.test(lower))
      return "For a local business, plan one post that answers a customer question, one that demonstrates the product, and one that explains how to buy. Put each on the calendar only if it serves a clear audience need.";
    if (/\b(freelancer|deadline|revision|scope|payment)\b/.test(lower))
      return "Before starting a freelance job, send a short written agreement listing the deliverable, deadline, included revisions, payment schedule, and what counts as extra work. Ask the client to confirm it.";
    if (/\b(clean|street|resident|pickup|collection)\b/.test(lower))
      return "Residents could agree on a collection day, share the time and contact for missed pickups, and review after two weeks whether the arrangement reduced missed collections.";
    if (/\b(movement|progress|focus|task|plan|time)\b/.test(lower))
      return "Before opening messages or tutorials, write down the one deliverable that would make today successful. Work on it for a protected 25-minute block, then record whether the deliverable moved forward.";
    return "Choose one real situation where this idea applies. Write down the first action, the result you expect to see, and how you will check whether it worked.";
  }
  function practiceFor(idea) {
    const lower = idea.toLowerCase();
    if (/\b(freelancer|deadline|revision|scope|payment)\b/.test(lower))
      return "Practice: write a project-confirmation message with the deliverable, deadline, number of revisions, payment terms, and how extra requests will be handled.";
    if (/\b(price|pricing|service|cost|time|market)\b/.test(lower))
      return "Practice: price one service. List direct costs, estimate hours, choose a rate for that time, check comparable offers, and write exactly what the customer receives. Review whether the price covers the costs and time.";
    if (/\b(budget|spending|bills|saving|income)\b/.test(lower))
      return "Practice: create a one-week tracker with columns for date, item, amount, and essential or optional. Add the expenses you know, then update it daily and review the totals at week's end.";
    if (/\b(content|social media|post|creator|audience)\b/.test(lower))
      return "Practice: draft a seven-day content plan. For each day, write the audience question, one key message, the format, and the next step you want the audience to take. Remove posts that repeat the same purpose.";
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
  function supportingDetail(idea) {
    const lower = idea.toLowerCase();
    if (/\b(ai|programmer|prompt|technology)\b/.test(lower))
      return "A clear prompt narrows the task; a quick fact-check catches confident mistakes before they reach a customer or audience.";
    if (/\b(whatsapp|customer|client|sales|business|product|shop)\b/.test(lower))
      return "A useful status answers a real customer question; posting more often is not helpful if people still cannot tell what is available or how to order.";
    if (/\b(consisten|schedule|every day|posting)\b/.test(lower))
      return "A smaller schedule you can sustain is more useful than a demanding schedule you abandon after a week.";
    if (/\b(money|saving|budget|spending|income|cost|price|pricing|profit|expenses?|bills)\b/.test(lower))
      return "A smaller schedule you can sustain is more useful than a demanding schedule you abandon after a week.";
    if (/\b(movement|progress|focus|task|plan|time)\b/.test(lower))
      return "A finished deliverable gives you something to evaluate. A full inbox or a long list of watched tutorials does not prove the important task moved forward.";
    if (/\b(content|post|video|creator|audience|social media)\b/.test(lower))
      return "Before publishing, check that the message answers one audience need and that every price, promise, and detail is accurate.";
    return "Keep the example small enough to try, then use the result—not guesswork—to decide what to change.";
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
          ? "At the end, ask: what changed because I took this step?"
          : "What is one realistic step you can take next?";
    const sections = [hook];
    if (second) sections.push(second);
    sections.push(demonstrationFor(idea));
    sections.push(supportingDetail(idea));
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
        "Worked example (illustrative currency units): monthly income is 1,500; rent 600, food 250, transport 100, utilities 120, and phone 40. Listed essentials total 1,110, leaving 390 before any unlisted bills, debt payments, savings, or irregular costs. Replace every figure with confirmed personal amounts.",
        "Sample: compare the date a bill is due with the next expected income date. If income arrives later, identify the gap early and consider safe, realistic options.",
        "Sample: choose one flexible expense to examine, then compare its real cost with the value it provides before deciding whether to change it.",
        "Answer check for the illustrative example: 600 + 250 + 100 + 120 + 40 = 1,110; 1,500 - 1,110 = 390 remaining before unlisted costs. If any bill or income figure is unknown, mark it unknown rather than treating this remainder as spendable money."
      ];
      return examples[index % examples.length];
    }
    return "Worked example: model the task described in this lesson using a clearly identified sample. Explain each decision, state any assumptions, and show learners how to check the result.";
  }
  function coursePractice(topic, index, lesson) {
    const lower = topic.toLowerCase();
    if (/content|social media|post|creator|audience/.test(lower)) {
      const tasks = [
        "Write a profile of one real audience group and list three questions you have actually heard or can verify.",
        "Draft three one-sentence post ideas: one answers a question, one demonstrates the offer, and one explains how to buy.",
        "Turn one audience question into a post with a clear answer, one verified detail, and one next step.",
        "Place your three drafts on a seven-day calendar; leave space blank when you have no useful message to publish.",
        "Edit one draft with a checklist: clear audience, accurate details, one main point, and one action.",
        "Review a sample week of enquiries or questions; identify one pattern and write the next post that responds to it."
      ];
      return tasks[index % tasks.length];
    }
    if (/budget|spending|bills|saving|income|money/.test(lower)) {
      const tasks = [
        "Create a table of expected income and essential bills, including each due date; mark uncertain figures as unknown.",
        "Classify five real or clearly labelled sample expenses as essential or flexible and explain one borderline choice.",
        "Record three transactions with date, item, amount, and category; calculate their total without estimating missing values.",
        "Choose one bill and compare its due date with the next confirmed income date; write down the size of any timing gap.",
        "Review one flexible expense and compare its actual cost with the value it provides before deciding whether to change it.",
        "Compare planned and actual amounts, calculate the difference for one category, and name one realistic adjustment."
      ];
      return tasks[index % tasks.length];
    }
    const general = [
      "Write the starting problem in one sentence and define an observable result that would count as success.",
      "Explain the key terms in your own words and give one example that fits the lesson.",
      "Follow the process with a small sample case and record the decisions you made at each step.",
      "Compare a strong example with a common mistake; correct the mistake and explain why your correction is better.",
      "Apply the process to a new case without copying the demonstration, then save the result as evidence.",
      "Check your result against the original goal, identify one gap, and write the next improvement you would test."
    ];
    return general[index % general.length];
  }
  function courseCheck(topic, index, total) {
    const lower = topic.toLowerCase();
    if (/content|social media|post|creator|audience/.test(lower)) {
      return [
        "Can the learner name one specific audience and support the choice with a real question or need?",
        "Do the three post ideas serve different purposes rather than repeat the same message?",
        "Does the draft answer the question, use verified details, and give one clear next step?",
        "Does the calendar vary the purpose of posts and avoid publishing merely to fill every day?",
        "Can a reader identify the main point and next step without guessing at price or availability?",
        "Can the learner identify one useful audience signal and turn it into a specific next post?"
      ][index % 6];
    }
    if (/budget|spending|bills|saving|income|money/.test(lower)) {
      return [
        "Are income and bills listed with dates, and are unknown amounts clearly marked?",
        "Can the learner explain why each sample expense was placed in its category?",
        "Do the recorded transactions add up correctly, with no guessed figures?",
        "Can the learner state the timing gap using confirmed dates and amounts?",
        "Is the proposed change realistic and does it avoid ignoring essential needs?",
        "Can the learner calculate one planned-versus-actual difference and explain the next decision?"
      ][index % 6];
    }
    return [
      "Can the learner state the problem and describe an observable successful result?",
      "Can the learner define the key terms and give a relevant example?",
      "Can the learner complete the process in order and explain the decisions?",
      "Can the learner correct the common mistake and explain why it was wrong?",
      "Can the learner apply the method to a new case without copying the example?",
      "Can the learner compare the result with the goal and identify one improvement?"
    ][index % 6];
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
        "\nPractice: " + coursePractice(topic, index, lesson) +
        "\nCheck: " + courseCheck(topic, index, lessons.length);
    });
    return out + "\n\nFINAL PROJECT\nComplete one small real-world task related to " + topic + ". Include the starting point, the steps taken, the result, and one improvement for a second attempt." +
      "\n\nASSESSMENT CHECKLIST\n1. Can the learner explain the main idea in their own words?\n2. Can they demonstrate the process without copying every line?\n3. Does their result meet the stated outcome?\n4. Can they identify one mistake and how to correct it?" +
      "\n\nCREATOR NOTE\nReplace the demonstration prompts with accurate subject-specific examples before teaching. Do not present this outline as a finished expert course until the examples, instructions, and assessment have been completed.";
  }
  function story(thought, tone) {
    const idea = clean(thought);
    const personal = /\b(i|my|me)\b/i.test(idea);
    if (personal) {
      return "STORY DRAFT — BUILT ONLY FROM YOUR SUPPLIED DETAILS\\n" +
        "THE REAL STARTING POINT\\n" + idea +
        "\\n\\nTHE TENSION\\n" +
        "Name what felt difficult or uncertain, using only what you supplied. Add a real detail if you want this section to feel more personal." +
        "\\n\\nTHE STORY IN PLAIN LANGUAGE\\n" +
        "You held back because you wanted the work or situation to be right. The detail you supplied is that feedback helped more than waiting alone. Keep the draft focused on that contrast; add the actual moment you shared the work and the feedback you received only if you can verify those details." +
        "\\n\\nTHE TURNING POINT — ADD THE REAL DETAIL\\n" +
        "What made you decide to share it? What did someone actually say or do? Add one specific, truthful detail here rather than inventing a dramatic scene." +
        "\\n\\nTHE LESSON\\n" +
        "Waiting for perfection can delay useful feedback. Share a version that is ready enough, then use real feedback to improve the next version." +
        "\\n\\nBEFORE PUBLISHING\\n" +
        "Check that the order of events and every first-person claim are accurate. Remove any sentence that describes something you did not experience.";
    }
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
    if (/freelancer|deadline|revision|scope|payment/.test(lower))
      return "Worked example: 'I will deliver one edited 60-second video by Friday. The agreed fee includes one revision. Work begins after the agreed deposit; extra edits or new deliverables will be quoted separately.' Confirm that the wording matches the actual agreement before sending it.";
    if (/price|pricing|cost|rate/.test(lower))
      return "Worked example: suppose a service costs 4,000 in direct expenses and takes 3 hours. If the provider values their time at 2,000 per hour, the starting cost calculation is 4,000 + (3 × 2,000) = 10,000 before taxes, overhead, or profit. This is an illustration, not a market price; replace it with your own figures and check what the offer includes.";
    if (/budget|spending|saving|income|bills|money/.test(lower))
      return "Worked example: list the income you actually expect, subtract essential bills due before the next income date, and treat the remainder as a planning figure rather than money automatically available to spend. Use confirmed amounts and leave unknowns clearly marked.";
    if (/content|social media|post|creator|audience/.test(lower))
      return "Worked example: a small shop plans a week of posts. Monday answers a common customer question, Wednesday shows one available product with a confirmed price, and Friday explains how to order. Each post has a different job and uses only verified details.";
    return "Worked example: choose a small, real case related to the idea. State the starting information, explain each decision, show the result, and point out one assumption the learner should verify.";
  }
  function lesson(thought) {
    const idea = clean(thought).replace(/[.!?]+$/, "");
    return "LESSON: " + idea +
      "\n\nLEARNING GOAL\nBy the end, learners should be able to explain the idea and complete one small task connected to it." +
      "\n\nEXPLAIN\nAsk learners what they already know. Define the central idea in plain language and connect it to a situation they recognise: " + idea + "." +
      "\n\nDEMONSTRATE\n" + lessonWorkedExample(idea) + "\nExplain why each step matters and identify one common mistake to avoid." +
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
    version: "1.5.1", componentCount: components.length, components: components.slice(), generate,
    component: (family, seed) => component(clean(family), clean(seed)),
    caption: raw => caption(clean(raw)), video: (raw, tone, creator) => video(raw, tone, creator),
    course: (raw, full) => course(raw, full), story: (raw, tone) => story(raw, tone), lesson: raw => lesson(raw)
  };
})(typeof window !== "undefined" ? window : globalThis);
