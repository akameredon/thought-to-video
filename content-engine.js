/* Thought to Video: deterministic, offline-first content engine.
 * 10 families x 10 strategies x 10 perspectives = 1,000 reusable logic components.
 * These are structured rules, not 1,000 hardcoded scripts or a trained AI model.
 */
(function (root) {
  "use strict";

  const families = [
    "hook", "explanation", "story", "example", "transition",
    "conclusion", "lesson", "course", "caption", "quality"
  ];
  const strategies = [
    "plain-language", "problem-first", "contrast", "question-led", "step-by-step",
    "myth-correction", "cause-and-effect", "beginner-friendly", "reflection", "action-first"
  ];
  const perspectives = [
    "beginner", "small-business", "creator", "educator", "freelancer",
    "personal-brand", "community", "practical", "storyteller", "coach"
  ];
  const components = [];
  for (const family of families) {
    for (const strategy of strategies) {
      for (const perspective of perspectives) {
        components.push({
          id: family + "-" + strategy + "-" + perspective,
          family, strategy, perspective,
          instruction: "Use a " + strategy + " approach from a " + perspective + " perspective."
        });
      }
    }
  }

  const hooks = {
    natural: ["There’s something about this worth thinking through.", "Let’s talk honestly about this.", "Here’s an idea I’ve been turning over."],
    bold: ["Here’s the point we shouldn’t ignore.", "Let’s get straight to the useful part.", "One thing needs to be said clearly."],
    helpful: ["Let’s make this idea practical.", "Here’s a simple way to think about it.", "Let’s break this down into useful steps."],
    story: ["Let me start with the thought on my mind.", "Imagine facing this in everyday life.", "Every useful lesson starts with a moment worth noticing."]
  };
  const endings = {
    natural: "You do not need every answer today. Understand the idea well enough to take one useful next step. What would that step look like for you?",
    bold: "Do not wait for a perfect plan. Choose one useful action, do it, and learn from the result. What is your next step?",
    helpful: "Try this: write down the problem, choose one small action, and decide how you will measure whether it helped. Keep it simple and adjust as you learn.",
    story: "I’m sharing a thought, not pretending to have every answer. Sometimes putting an idea into words is the first step toward doing something useful. How do you see it?"
  };
  const clean = value => String(value || "").replace(/\s+/g, " ").trim();
  const sentences = value => (value.match(/[^.!?]+[.!?]?/g) || [value]).map(s => s.trim()).filter(Boolean);
  const hash = value => {
    let n = 2166136261;
    for (let i = 0; i < value.length; i++) n = Math.imul(n ^ value.charCodeAt(i), 16777619);
    return n >>> 0;
  };
  function choose(list, seed) { return list[hash(seed) % list.length]; }
  function component(family, seed) {
    return components[hash(family + "|" + seed) % components.length];
  }
  function caption(topic) {
    const short = topic.length > 130 ? topic.slice(0, 127).trim() + "…" : topic;
    return short + "\n\nA thought worth sharing—and a reminder to turn ideas into practical next steps.\n\nWhat’s your take? Share it in the comments.\n\n#ThoughtToVideo #ContentCreation";
  }
  function video(thought, tone, creator) {
    const idea = clean(thought), parts = sentences(idea), first = (parts[0] || idea).replace(/[.!?]+$/, "");
    const body = parts.length > 1 ? parts.slice(1).join(" ") :
      "The useful thing is to slow down and look at what this means in everyday life. Break the idea into smaller parts and focus on what you can influence.";
    const seed = idea + "|" + tone + "|" + (creator || "");
    const hook = choose(hooks[tone] || hooks.natural, seed + "|" + component("hook", seed).id);
    const example = "For example, take this idea and ask three questions: what is happening, why does it matter, and what is one realistic action you can take next? That turns a vague thought into something you can work with.";
    const close = endings[tone] || endings.natural;
    return (parts.length >= 3 ? first + ".\n\n" + parts.slice(1).join(" ") : hook + "\n\n" + first + ".\n\n" + body) + "\n\n" + example + "\n\n" + close;
  }
  function course(thought, full) {
    const topic = clean(thought).replace(/[.!?]+$/, "");
    const lessons = full ? [
      ["Start here: understand the idea", "Explain the problem in plain language, who it affects, and what learners will be able to do."],
      ["Learn the building blocks", "Introduce essential concepts and define unfamiliar terms with a simple example."],
      ["Follow the process", "Demonstrate the process in small actions learners can copy."],
      ["Work through a real example", "Show a realistic example and explain how to correct common mistakes."],
      ["Practise independently", "Give learners a guided task, a checklist, and a clear standard for success."],
      ["Build a repeatable system", "Explain how to repeat the process, improve quality, and choose the next step."]
    ] : [
      ["Understand the basics", "Explain the idea in simple terms and show why it matters."],
      ["Follow the steps", "Demonstrate a beginner-friendly process from start to finish."],
      ["Try it yourself", "Work through an example, identify common mistakes, and set a short practice task."]
    ];
    let out = (full ? "COURSE OUTLINE" : "MINI-COURSE OUTLINE") + "\n" + topic +
      "\n\nWHO IT IS FOR\nBeginners who want a clear, practical way to understand and apply this idea." +
      "\n\nLEARNING PROMISE\nLearners should be able to explain the main idea and complete a first practical attempt.";
    lessons.forEach((lesson, index) => {
      out += "\n\nLESSON " + (index + 1) + ": " + lesson[0] +
        "\nWhat to teach: " + lesson[1] +
        "\nExample: Demonstrate the lesson using an ordinary, realistic situation." +
        "\nLearner task: Ask learners to try the step and note what happened.";
    });
    return out + "\n\nFINAL PROJECT\nAsk learners to apply the steps to produce one small result they can show or use." +
      "\n\nCHECK FOR UNDERSTANDING\n1. What is the main idea?\n2. Which step would you take first?\n3. What would you do if you got stuck?" +
      "\n\nCREATOR NOTE\nAdd an example from your own experience. Keep each lesson focused on one outcome, demonstrate rather than only explain, and avoid promising results that cannot be guaranteed.";
  }
  function story(thought, tone) {
    const idea = clean(thought);
    return "THE SITUATION\n" + idea +
      "\n\nTHE TENSION\nWhat made this situation difficult, surprising, or important? Explain the obstacle without exaggerating." +
      "\n\nTHE TURNING POINT\nDescribe the realisation, choice, or small action that changed how you understood the situation." +
      "\n\nTHE LESSON\nExplain what someone else can learn from it and where the lesson may not apply." +
      "\n\nTHE CLOSE\n" + (endings[tone] || endings.natural);
  }
  function lesson(thought) {
    const idea = clean(thought);
    return "LESSON: " + idea +
      "\n\n1. LEARNING GOAL\nBy the end, the learner should be able to explain the idea and try one practical step." +
      "\n\n2. EXPLAIN\nDefine the idea in everyday language. Introduce only the terms needed to understand it." +
      "\n\n3. DEMONSTRATE\nShow a realistic example, then explain why each step matters." +
      "\n\n4. PRACTISE\nAsk the learner to try the same process with their own situation." +
      "\n\n5. CHECK UNDERSTANDING\nAsk the learner to explain the idea in their own words and identify one next action." +
      "\n\n6. RECAP\nSummarise the most important point and name one common mistake to avoid.";
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
    version: "1.0.0",
    componentCount: components.length,
    components: components.slice(),
    generate,
    caption: raw => caption(clean(raw)),
    video: (raw, tone, creator) => video(raw, tone, creator),
    course: (raw, full) => course(raw, full),
    story: (raw, tone) => story(raw, tone),
    lesson: raw => lesson(raw)
  };
})(typeof window !== "undefined" ? window : globalThis);
