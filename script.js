// ============================================================
// NIELSEN'S HEURISTICS — script.js
// All game logic: data, shuffle, render, answer handling
// ============================================================

// ---- Game state variables ----------------------------------
var _score    = 0;   // number of correct answers so far
var _answered = 0;   // total questions answered (correct + wrong)
var _current  = 0;   // index into _order[] for the current scenario
var _order    = [];  // shuffled array of allScenarios indices
var total     = 20;  // total number of scenarios in the quiz


// ---- Heuristic answer button labels ------------------------
// These 10 labels are rendered as clickable buttons.
// They are shuffled into a random order per scenario so
// students cannot memorise button positions.
var heuristics = [
  "1. Visibility of system status",
  "2. Match with real world",
  "3. User control and freedom",
  "4. Consistency and standards",
  "5. Error prevention",
  "6. Recognition not recall",
  "7. Flexibility and efficiency",
  "8. Aesthetic and minimalist design",
  "9. Help users recognize, diagnose, and recover from errors",
  "10. Help and documentation"
];


// ---- Heuristic definitions lookup table --------------------
// Keys must exactly match the strings in the heuristics array
// and the correctLabel field of each scenario.
// The matching definition is appended below wrong-answer
// feedback so students always leave with the correct text.
var heuristicDefs = {
  "1. Visibility of system status":
    "The system should always keep users informed about what is going on, through appropriate feedback within reasonable time. Tell people what is happening, or they will assume the worst — and then click Submit eleven more times.",

  "2. Match with real world":
    "The system should speak the users' language — words, phrases, and concepts familiar to the user rather than system-oriented terms. Follow real-world conventions so information appears in a natural and logical order.",

  "3. User control and freedom":
    "Users often choose system functions by mistake. They need a clearly marked emergency exit to leave the unwanted state without going through an extended ordeal. Support undo and redo — because humans are fallible, and that is fine.",

  "4. Consistency and standards":
    "Users should not have to wonder whether different words, situations, or actions mean the same thing. Follow platform and industry conventions so the interface behaves predictably every single time.",

  "5. Error prevention":
    "Even better than a helpful error message is a design that stops the mistake happening in the first place. Eliminate error-prone conditions, or check for them and present a confirmation step before the user commits to something irreversible.",

  "6. Recognition not recall":
    "Minimise the user's memory load by making objects, actions, and options visible. The user should not have to remember information from one part of an interface to another — the interface should do that job.",

  "7. Flexibility and efficiency":
    "Accelerators — hidden from the novice user — may speed up interaction for the expert, so the system can serve both. Allow users to tailor frequent actions.",

  "8. Aesthetic and minimalist design":
    "Dialogues should not contain irrelevant or rarely needed information. Every extra unit of information competes with the relevant information and reduces its relative visibility. The cheese videos were not helping anyone.",

  "9. Help users recognize, diagnose, and recover from errors":
    "Error messages should be expressed in plain language (no error codes), precisely indicate the problem, and constructively suggest a solution. 'XMIT_ERR_0x4F2' does not count.",

  "10. Help and documentation":
    "Even though it is better if the system can be used without help, when help is needed it should be easy to search, focused on the user's task, and consist of concrete steps — not a loop that links back to itself."
};


// ---- Scenarios set A (original 7) --------------------------
// Each object has:
//   title           short heading shown on the card
//   desc            the humorous situation description
//   correctLabel    must exactly match a key in heuristicDefs
//                   AND a string in the heuristics array above
//   feedbackCorrect shown in green when the student is right
//   feedbackWrong   shown in red when the student is wrong;
//                   the formal definition is auto-appended
var scenarios = [

  // Heuristic 1 — Visibility of system status
  {
    title: "The spinning wheel of mystery",
    desc: "You click 'Submit Assignment' on Terrible Tech High's portal. The button goes grey. Nothing else happens. No spinner. No message. No sound. You sit there for 45 seconds wondering if your internet died, if the hamster powering the server fell off its wheel, or if your assignment is now orbiting Jupiter. You click Submit again. You have now submitted it eleven times. Excellent.",
    correctLabel: "1. Visibility of system status",
    feedbackCorrect: "Tino pai! The system said absolutely nothing — a great way to cause panic, duplicate submissions, and one student emailing their teacher seventeen times. Nielsen says the system should always keep users informed about what is going on through appropriate feedback within reasonable time. A spinner. A tick. Literally any sign of life.",
    feedbackWrong: "Not quite. This one is about the system going completely silent while the user spirals into existential dread. That is a Visibility of System Status violation — the system must tell users what is happening, or they will assume the worst and click the button eleven more times."
  },

  // Heuristic 9 — Help users recognize, diagnose, and recover from errors
  {
    title: "The 'XMIT_ERR_0x4F2' experience",
    desc: "You mistype your password. The screen erupts in red and displays: 'XMIT_ERR_0x4F2 — Authentication vector mismatch. Reattempt handshake protocol.' You stare at it. You Google it. Google also stares at it. Your teacher stares at it. No one has any idea. Somewhere, a developer is laughing.",
    correctLabel: "9. Help users recognize, diagnose, and recover from errors",
    feedbackCorrect: "Ae, tino pai! The error has occurred — that part is done — but the message gives the user zero useful information about what went wrong or what to do next. Nielsen says error messages should be in plain language, identify the problem clearly, and suggest a fix. 'Wrong password, try again' would have been perfectly adequate.",
    feedbackWrong: "Close-ish, but not quite. The error has already happened here — the question is what the system does about it. Telling the user 'XMIT_ERR_0x4F2' is essentially saying 'something went wrong, best of luck, byeee.' That is an Error Recovery violation. Plain language, clear problem, suggested solution — that is the standard."
  },

  // Heuristic 3 — User control and freedom
  {
    title: "The confirmation-free delete",
    desc: "Terrible Tech High lets you delete your entire portfolio with one click. No 'Are you sure?' No undo. No warning. No dramatic pause to reflect on your choices. Just — gone. Three months of carefully crafted work, vanished faster than your will to live. Kua mutu. The cursor blinks at you, unbothered.",
    correctLabel: "3. User control and freedom",
    feedbackCorrect: "Ae, spot on! The user accidentally triggered a catastrophic action and the system offered absolutely no way out — no undo, no confirmation, no safety net. Nielsen says users need clearly marked emergency exits. An 'Are you sure?' step or an undo option would have saved three months of someone's digital life.",
    feedbackWrong: "Good instinct, but the key here is not just that the bad thing happened — it is that there was no escape, no undo, no way back once it did. Nielsen calls this User Control and Freedom: users must be able to reverse mistakes. The system locked the door and swallowed the key."
  },

  // Heuristic 4 — Consistency and standards
  {
    title: "The button that does whatever it feels like",
    desc: "On the homepage the blue 'Go' button takes you to your dashboard. On the assignments page the blue 'Go' button logs you out. On the profile page the blue 'Go' button submits a blank form to an unknown recipient. Every 'Go' button is a new adventure. An unwanted adventure. Students now approach it the way you approach a suspicious puddle.",
    correctLabel: "4. Consistency and standards",
    feedbackCorrect: "Tino pai! Same label, same colour, completely different outcomes depending on which page you are on. Users build mental models of how things work — when those models are wrong every single time, trust collapses rapidly. Nielsen says follow consistent conventions so users never have to wonder whether the same word means the same thing.",
    feedbackWrong: "Good thinking, but this is specifically about the same visual element behaving differently in different contexts, which destroys the user's mental model entirely. If 'Go' means 'log out' on one page and 'submit a form' on another, the interface is lying to you on a regular basis. That is a Consistency and Standards violation."
  },

  // Heuristic 6 — Recognition not recall
  {
    title: "The menu that ghosted you",
    desc: "The navigation menu appears for exactly two seconds when you log in, then vanishes forever. The only way to navigate is to have memorised the URLs from that brief window. There is no search bar. The back button takes you to a page about the 2009 school gala. There is only memory, regret, and the 2009 school gala.",
    correctLabel: "6. Recognition not recall",
    feedbackCorrect: "Ae, perfect. The interface is demanding that users memorise information rather than letting them recognise options on screen. Nielsen says to minimise the user's memory load by keeping objects, actions, and options visible. Navigation should be present when you need it — not a fleeting apparition you had two seconds to photograph.",
    feedbackWrong: "Nearly, but the core issue is that the system is outsourcing its job to the user's brain. Instead of showing options, it demands the user remember them — like the site is giving you a quiz. That is Recognition not Recall: keep options visible so users can recognise what they need, rather than dredge it from memory."
  },

  // Heuristic 8 — Aesthetic and minimalist design
  {
    title: "The wall of absolutely everything",
    desc: "The school calendar page loads. There are six animated GIFs of dancing cats. A weather widget showing conditions in Reykjavik, Iceland. Three auto-playing videos about artisan cheese. The full school newsletter archive back to 2003. A live cryptocurrency ticker. A photo slideshow of someone's trip to Rotorua. And somewhere, buried like treasure no one asked for, the date of the next assembly.",
    correctLabel: "8. Aesthetic and minimalist design",
    feedbackCorrect: "Ae! Every irrelevant element on that page is actively fighting the one piece of information the user actually needed. Nielsen says every extra unit of information competes with the relevant information and reduces its visibility. Less is significantly more. The Reykjavik weather forecast was not helping anyone find the assembly time.",
    feedbackWrong: "Not the right one, though we respect your effort to make sense of a page that also features Icelandic weather. The issue is not the type of content but the overwhelming volume of irrelevant content drowning out what matters. Nielsen's Aesthetic and Minimalist Design heuristic says: if it does not serve the user's task right now, it is in the way."
  },

  // Heuristic 10 — Help and documentation
  {
    title: "The help page that requires a PhD to access",
    desc: "The Terrible Tech High help page says: 'For assistance, please visit the help page.' It links back to itself. There is a contact form requiring your seven-digit staff reference number, which was posted to your home address in 2019. There is also a phone number. It rings for eleven minutes and then plays hold music from a completely different institution.",
    correctLabel: "10. Help and documentation",
    feedbackCorrect: "Tino pai! When a user is lost enough to seek help, the very least the system can do is actually provide some. Nielsen says help should be easy to find, focused on the user's task, and consist of concrete steps — not a circular loop of despair followed by eleven minutes of a rival school's hold music.",
    feedbackWrong: "Fair effort, but this one is about the help system being entirely useless at the moment the user most needs it. Nielsen says help and documentation should be easy to search, focused on the task, and give concrete steps to follow. A help page that links to itself and requires a seven-year-old letter is not that."
  }

]; // end scenarios set A


// ---- Scenarios set B (additional 13) -----------------------
// Brings every heuristic up to at least 2 scenarios each.
// Same object structure as set A above.
var scenariosB = [

  // Heuristic 1 — Visibility of system status (2nd scenario)
  {
    title: "The upload bar that lied to you",
    desc: "You are uploading your 47-slide presentation to Terrible Tech High's portal. The progress bar reaches 99% and stops. It stays at 99% for six minutes. Is it uploading? Is it stuck? Has it finished and forgotten to tell you? You stare at it. It stares back. You have a meeting with your teacher in four minutes. The bar remains, serenely, at 99%.",
    correctLabel: "1. Visibility of system status",
    feedbackCorrect: "Tino pai! A progress bar that stops moving tells the user nothing useful — is the system working, frozen, or quietly composing its resignation letter? Nielsen says the system must keep users informed through appropriate feedback within reasonable time. At 99% for six minutes, the feedback has become actively misleading.",
    feedbackWrong: "Not this time. The problem is not the upload itself but the total absence of honest feedback about what is actually happening. That progress bar reaching 99% and parking there is a Visibility of System Status failure — the system is supposed to tell you what it is doing, not taunt you with a nearly-complete lie."
  },

  // Heuristic 2 — Match with real world
  {
    title: "The form that speaks fluent bureaucrat",
    desc: "Terrible Tech High's enrolment form asks you to enter your 'Tertiary Matriculation Identifier', your 'Domicile Postcode Designation', and your 'Guardian Signatory Authentication Code'. You are thirteen. You have no idea what any of this means. The form does not explain. There is a tooltip. It uses the same words again, only smaller.",
    correctLabel: "2. Match with real world",
    feedbackCorrect: "Ae, perfect! The system is speaking entirely in jargon that means nothing to the people actually using it. Nielsen says the system should speak the user's language — words, phrases and concepts familiar to the user, not system-oriented or bureaucratic terminology. 'Student ID', 'postcode', and 'parent signature code' would have done nicely.",
    feedbackWrong: "Not quite. The issue here is language — the system is communicating in terms that make no sense to the actual user. That is a Match with the Real World violation. Nielsen says use words and concepts your users already know, not technical or institutional jargon that requires a separate qualification to decode."
  },

  // Heuristic 3 — User control and freedom (2nd scenario)
  {
    title: "The settings page you cannot leave",
    desc: "You accidentally open the accessibility settings on Terrible Tech High's app. You did not want to be here. There is no back button. There is no close button. There is an 'Apply' button and a 'Confirm Apply' button and a 'Finalise Confirmation' button, but none of them take you anywhere useful. You are trapped in a cascade of confirmation dialogues. Your phone battery is at 3%.",
    correctLabel: "3. User control and freedom",
    feedbackCorrect: "Ae! The user wandered somewhere by mistake and the system has made escape essentially impossible. Nielsen says users frequently make accidental navigation decisions and need a clearly marked emergency exit — a simple back button, a close icon, something. Three confirmation buttons that lead nowhere is not an exit. It is a labyrinth.",
    feedbackWrong: "Good thinking, but the heart of this one is the lack of escape — no back button, no way out of an unwanted state. That is User Control and Freedom. Nielsen says support undo and provide clearly marked exits so users can leave any situation without going through a drawn-out ordeal. Trapping someone in settings is a good way to get one-star reviews."
  },

  // Heuristic 4 — Consistency and standards (2nd scenario)
  {
    title: "The icon that means seventeen different things",
    desc: "Terrible Tech High uses a star icon throughout its interface. On the dashboard it means 'Favourites'. On the assignments page it means 'Priority'. On the gradebook it means 'Teacher comment'. In the calendar it means 'Public holiday'. In the messaging app it means 'Mark as unread'. Students have started avoiding all stars on principle, which is unfortunate for their astronomy unit.",
    correctLabel: "4. Consistency and standards",
    feedbackCorrect: "Tino pai! When the same icon means something different in every context, the user cannot build any reliable mental model of how the system works. Nielsen says follow consistent conventions — the same symbol should mean the same thing throughout. A star that means five different things means nothing at all.",
    feedbackWrong: "Close, but this is specifically about an identical element being used inconsistently across the interface — which breaks the user's understanding of how the whole system works. That is a Consistency and Standards violation. Nielsen says the same symbol or label should always mean the same thing. A star cannot simultaneously mean 'favourite', 'priority', and 'public holiday'."
  },

  // Heuristic 5 — Error prevention (1st scenario)
  {
    title: "The date field that accepts anything",
    desc: "The Terrible Tech High timetable system asks for your date of birth. You type '32/13/2009'. It accepts it without complaint. You type 'banana'. It accepts that too. You type your actual date of birth and it tells you that you are 847 years old and ineligible for Year 11. The field will accept anything. It just will not accept the truth.",
    correctLabel: "5. Error prevention",
    feedbackCorrect: "Ae! The system has no validation whatsoever — it happily accepts impossible dates, nonsense words, and bananas, then falls over when it tries to process them. Nielsen says good design prevents errors from occurring in the first place. A simple date picker, or a field that rejects obviously invalid input at the point of entry, would have stopped all of this.",
    feedbackWrong: "Not quite. The key here is that the system lets bad data in without any resistance — there is no validation, no check, no gentle 'that is not a real date' before the damage is done. That is an Error Prevention failure. Nielsen says prevent the problem from occurring in the first place. Stop the banana at the door."
  },

  // Heuristic 7 — Flexibility and efficiency
  {
    title: "The keyboard shortcut that has no shortcut",
    desc: "You are a fast typist. You want to navigate Terrible Tech High's portal using the keyboard like a sensible person. There are no keyboard shortcuts. Every single action requires a precise mouse click on a small target. The submit button is 8 pixels wide. You are not sure if it is a button or a decorative full stop. Advanced users receive no special treatment. Everyone suffers equally.",
    correctLabel: "7. Flexibility and efficiency",
    feedbackCorrect: "Ae! The system treats every user identically — there is no way for experienced users to work faster, no shortcuts, no accelerators. Nielsen says the system should cater to both novice and expert users. Keyboard shortcuts, quick actions, and efficient paths for experienced users are not luxuries — they are part of good design.",
    feedbackWrong: "Not this one. The issue here is that experienced users have no way to work more efficiently — no shortcuts, no accelerators, no options that go beyond the basic point-and-click routine. That is a Flexibility and Efficiency violation. Nielsen says allow users to tailor frequent actions and provide shortcuts for those who know what they are doing."
  },

  // Heuristic 9 — Help users recognize, diagnose, and recover from errors (2nd scenario)
  {
    title: "The password reset that forgets what it was doing",
    desc: "You trigger a password reset on Terrible Tech High. You receive an email. You click the link. It takes you to the homepage. No reset form. No prompt. No explanation. You search for the reset option. You find it. You click it. It says the link has expired. You request another one. It says you have requested too many resets and must wait 24 hours. Your lesson starts in seven minutes.",
    correctLabel: "9. Help users recognize, diagnose, and recover from errors",
    feedbackCorrect: "Tino pai! The system has failed the user at every possible recovery point — a link that goes nowhere, an expired token with no explanation, a lockout with no useful guidance. Nielsen says when errors occur, messages should explain what happened in plain language and suggest a concrete path forward. 'Your reset link has expired — click here to request a new one' would have been a start.",
    feedbackWrong: "Good instinct, but the real issue here is what happens after things go wrong. The system fails to guide the user through recovery at every step — no clear explanation, no useful next step, just more walls. That is an Error Recovery violation. When something goes wrong, the system must tell the user what happened and what to do about it, in plain language."
  },

  // Heuristic 4 — Consistency and standards (3rd scenario)
  {
    title: "The student portal's identity crisis",
    desc: "Terrible Tech High's main site uses blue buttons with white text. The student portal uses green buttons with black text. The library system uses red buttons with no text at all — just ambiguous icons. The timetable app uses hyperlinks styled as buttons and buttons styled as hyperlinks. A student who learns one part of the system is no better prepared for any other part. Each section is its own adventure.",
    correctLabel: "4. Consistency and standards",
    feedbackCorrect: "Ae! Every part of the system has reinvented itself visually and behaviourally, so knowledge from one section transfers to nothing. Nielsen says users should not have to wonder whether different words, situations, or actions mean the same thing — follow platform conventions so the interface feels like one coherent system, not four different websites at war with each other.",
    feedbackWrong: "Not quite. The core problem here is that each part of the system looks and behaves differently, so users get no benefit from experience — they have to relearn everything every time. That is a Consistency and Standards violation. A coherent system lets what you learn in one place work everywhere else."
  },

  // Heuristic 5 — Error prevention (2nd scenario)
  {
    title: "The file format roulette",
    desc: "Terrible Tech High's assignment submission page accepts files. It does not say which file formats. You upload a PDF. It rejects it. You upload a Word document. It rejects it. You upload a JPEG of your work. It accepts it. You upload a correctly formatted document three weeks later and it rejects it again for reasons it declines to share. The accepted formats appear to be determined by the phase of the moon.",
    correctLabel: "5. Error prevention",
    feedbackCorrect: "Ae! The system could easily have told the user which formats are accepted before they attempted anything — a simple label, a tooltip, an accepted formats list. Instead it allows users to spend time uploading files only to reject them silently. Nielsen says prevent errors before they occur. Display the accepted formats. Save everyone the lunar consultation.",
    feedbackWrong: "Not this one. The problem is that the system could easily have told users what it needed before they tried and failed. It did not, so users waste time on rejected uploads. That is Error Prevention — stopping the problem before it happens. A simple 'accepted formats: .docx, .pdf' label would have been sufficient."
  },

  // Heuristic 6 — Recognition not recall (2nd scenario)
  {
    title: "The dropdown with 847 options",
    desc: "Terrible Tech High's timetable system asks you to select your form class from a dropdown menu. The dropdown contains every class the school has ever offered since 1987, sorted by the first name of the teacher who created it, most of whom have since retired. There is no search. There is no filter. There is no grouping. There is scrolling. Lots of scrolling. The class you want is, statistically, somewhere in the middle.",
    correctLabel: "6. Recognition not recall",
    feedbackCorrect: "Ae, nice work! The system is burying the correct option in an enormous unsorted list and forcing users to hunt through it manually. Nielsen says minimise the user's memory load by making relevant options visible and accessible. A search field, sensible grouping, or a filtered list would let users recognise their class immediately rather than scrolling through the shadow of 1987.",
    feedbackWrong: "Nearly. The issue is that the system is making users work unnecessarily hard to find something they should be able to recognise immediately. Burying the right option in an unsorted list of hundreds forces recall and manual searching rather than easy recognition. That is a Recognition not Recall violation — make options visible and findable, do not make users hunt."
  },

  // Heuristic 8 — Aesthetic and minimalist design (2nd scenario)
  {
    title: "The notification that never ends",
    desc: "Terrible Tech High sends you a notification. Then another. Then seventeen more within the same minute. Your phone vibrates continuously for three minutes like it is auditioning for a percussion ensemble. The notifications include: a new assignment, a reminder about the assignment, a reminder about the reminder, a notice that the assignment has been viewed, a notice that you viewed the notice, and a motivational quote from someone called Gerald.",
    correctLabel: "8. Aesthetic and minimalist design",
    feedbackCorrect: "Ae! Every irrelevant or redundant notification is competing with the ones that actually matter. When everything is urgent, nothing is urgent. Nielsen says the interface — including its communications — should not contain irrelevant or rarely needed information. A notification that you have viewed a notification is not useful. Gerald's quote, while perhaps sincere, was not helping.",
    feedbackWrong: "Not quite. The problem is not that notifications exist but that the system is sending so many that the important ones are completely lost. Every extra message dilutes the signal. Nielsen's Aesthetic and Minimalist Design heuristic applies beyond just visual layout — unnecessary information in any form reduces the visibility of what actually matters."
  },

  // Heuristic 10 — Help and documentation (2nd scenario)
  {
    title: "The contextless search",
    desc: "Terrible Tech High's help search bar returns results for 'password reset'. The results are: a 2014 newsletter article mentioning the word 'password', a staff handbook entry about password policy for teachers, a photo of the server room labelled 'where passwords live', and a PDF titled 'FAQ' that is entirely blank. The actual password reset process is not among the results. It never is.",
    correctLabel: "10. Help and documentation",
    feedbackCorrect: "Tino pai! Help that surfaces irrelevant results and buries the actual answer is not help — it is a filing system that has given up. Nielsen says help and documentation should be easy to search and focused on the user's task. A search for 'password reset' should return instructions for resetting a password. A photo of a server room is not that.",
    feedbackWrong: "Fair try, but this is specifically about the help system failing at its only job. When a user searches for help and the results are useless, Nielsen's Help and Documentation heuristic is being violated. Help should be easy to search and return results focused on the user's actual task — not archival photographs and blank PDFs."
  },

  // Heuristic 5 — Error prevention (3rd scenario)
  {
    title: "The text field with secret rules",
    desc: "You create a username for Terrible Tech High. It must be between 7 and 12 characters, contain at least one uppercase letter, one number, one symbol, not start with a number, not end with a symbol, not contain the letters Q or Z, and not match any username used by any student since 1994. None of these rules are displayed. You discover each one only after the system rejects your attempt. Again. And again. You are on attempt fourteen.",
    correctLabel: "5. Error prevention",
    feedbackCorrect: "Ae! The system knows exactly what it needs, but refuses to say so upfront. Every rejection could have been avoided by simply displaying the rules before the user started typing. Nielsen says good design prevents errors in the first place — and telling users what you need from them before they try is the most straightforward form of prevention there is.",
    feedbackWrong: "Not quite. The system here is withholding information that would stop the user making mistakes. If the rules were displayed upfront, the user would not be on attempt fourteen. That is an Error Prevention failure — Nielsen says prevent errors before they happen, and the most basic way to do that is to tell users what you need before they guess."
  }

]; // end scenarios set B


// ---- Combine both sets ------------------------------------
// All game logic reads from allScenarios only.
// To extend the quiz: create a scenariosC array, concat it
// here, and update the total variable at the top.
var allScenarios = scenarios.concat(scenariosB);


// ---- SHUFFLE ----------------------------------------------
// Fisher-Yates algorithm: produces a randomly ordered copy
// of an array without modifying the original.
// Used for both scenario order and button order each render.
function shuffle(arr) {
  var a = arr.slice();                            // copy so original is unchanged
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;    // swap the two elements
  }
  return a;
}


// ---- HANDLE ANSWER ----------------------------------------
// Called by the onclick of every heuristic button.
// Parameters:
//   chosen  the label text of the clicked button
//   btn     the DOM button element itself
function handleAnswer(chosen, btn) {

  // Look up the current scenario using the shuffled order index
  var i       = _order[_current];
  var s       = allScenarios[i];
  var fb      = document.getElementById('fb-current');
  var btns    = document.querySelectorAll('#btns-current .heuristic-btn');
  var nextBtn = document.getElementById('next-btn');

  // Disable all buttons so the student cannot change their answer
  btns.forEach(function(b) { b.disabled = true; });

  var isCorrect = (chosen === s.correctLabel);

  if (isCorrect) {
    // Correct answer: highlight button green, show success feedback
    btn.classList.add('correct');
    fb.innerHTML = 'Tino pai! ' + s.feedbackCorrect;
    fb.className = 'feedback correct show';
    _score++;
  } else {
    // Wrong answer: red on clicked button, green on correct button,
    // wrong-answer explanation, then the formal heuristic definition
    btn.classList.add('wrong');
    btns.forEach(function(b) {
      if (b.textContent === s.correctLabel) b.classList.add('correct');
    });
    var def = heuristicDefs[s.correctLabel] || '';
    fb.innerHTML =
      s.feedbackWrong +
      // Definition block appended below the explanation
      '<div style="margin-top:10px; padding-top:10px; border-top:0.5px solid rgba(160,40,40,0.25);">' +
        '<span style="font-size:18px; font-weight:500;text-transform:uppercase; letter-spacing:0.05em; opacity:0.7;">' +
          'Definition — ' + s.correctLabel +
        '</span>' +
        '<p style="margin:4px 0 0; font-size:18px; line-height:1.6;">' + def + '</p>' +
      '</div>';
    fb.className = 'feedback wrong show';
  }

  // Update running score and increment answered count
  _answered++;
  document.getElementById('score-display').textContent = _score + ' / ' + total;

  // Relabel the Next button on the final question
  nextBtn.textContent = (_answered === total) ? 'See results' : 'Next scenario';
  nextBtn.style.display = 'inline-block';
}


// ---- NEXT SCENARIO ----------------------------------------
// Called by the Next / See results button.
// Either advances to the next question or triggers end screen.
function nextScenario() {
  if (_answered === total) {
    showFinished();
    return;
  }
  _current++;
  renderCurrent();
}


// ---- RENDER CURRENT ---------------------------------------
// Builds the HTML for one scenario card and injects it into
// the #scenarios div. Scrolls to top so students do not have
// to scroll up to read the new question.
function renderCurrent() {
  var i         = _order[_current];
  var s         = allScenarios[i];
  var container = document.getElementById('scenarios');

  // Shuffle button order freshly for each scenario
  var shuffled = shuffle(heuristics);
  var btnsHtml = shuffled.map(function(h) {
    // Escape single quotes to avoid breaking the inline onclick attribute
    return '<button class="heuristic-btn" onclick="handleAnswer(\'' +
      h.replace(/'/g, "\\'") + '\', this)">' + h + '</button>';
  }).join('');

  // Replace the scenario slot with the new card
  container.innerHTML =
    '<div class="scenario-card" id="sc-current">' +
      // Progress counter
      '<p style="font-size:12px; color:#888780; margin-bottom:6px;">' +
        'Scenario ' + (_current + 1) + ' of ' + total +
      '</p>' +
      '<h2>' + s.title + '</h2>' +
      '<p>' + s.desc + '</p>' +
      // Answer buttons
      '<div class="heuristic-grid" id="btns-current">' + btnsHtml + '</div>' +
      // Feedback box — hidden until handleAnswer fires
      '<div class="feedback" id="fb-current"></div>' +
      // Next button — hidden until handleAnswer fires
      '<div style="margin-top:12px;">' +
        '<button id="next-btn" class="reset-btn" style="display:none;" ' +
          'onclick="nextScenario()">Next scenario</button>' +
      '</div>' +
    '</div>';

  window.scrollTo(0, 0);
}


// ---- SHOW FINISHED ----------------------------------------
// Clears the scenario slot, reveals the end score card with
// an appropriate te reo response based on percentage, and
// unhides the confusion comparison card.
function showFinished() {
  document.getElementById('scenarios').innerHTML = '';

  var msg = document.getElementById('finished-msg');
  var txt = document.getElementById('finish-text');
  var pct = Math.round((_score / total) * 100);

  // Choose message based on score band
  if      (pct === 100) txt.textContent = 'He tino toa koe! Perfect score — ' + total + ' out of ' + total + '!';
  else if (pct >= 70)   txt.textContent = 'Ka pai! ' + _score + ' out of ' + total + '. Solid work.';
  else if (pct >= 50)   txt.textContent = _score + ' out of ' + total + '. Not bad — review the ones you missed.';
  else                  txt.textContent = _score + ' out of ' + total + '. Time to revisit the heuristics — he mahi ano.';

  msg.style.display = 'block';

  // Reveal the heuristics 3 / 5 / 9 comparison card
  document.getElementById('confusion-card').style.display = 'block';

  window.scrollTo(0, 0);
}


// ---- RESET ACTIVITY ---------------------------------------
// Resets all state, re-shuffles scenario order, hides the
// end cards, and renders the first question again.
// Called by the Try again button on the finished card.
function resetActivity() {
  _score    = 0;
  _answered = 0;
  _current  = 0;

  // Re-shuffle so students get a different order on each attempt
  _order = shuffle(allScenarios.map(function(_, i) { return i; }));

  document.getElementById('score-display').textContent    = '0 / ' + total;
  document.getElementById('finished-msg').style.display   = 'none';
  document.getElementById('confusion-card').style.display = 'none';

  renderCurrent();
}


// ---- INITIALISATION ---------------------------------------
// Runs once when the page loads (script is deferred in HTML).
// Creates the initial shuffled order and renders question 1.
_order = shuffle(allScenarios.map(function(_, i) { return i; }));
renderCurrent();
