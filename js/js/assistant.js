/* =========================================================
   VITAL LOOP — VITAAI ASSISTANT ENGINE
   js/assistant.js
   ========================================================= */

(function () {
  "use strict";

  /* =======================================================
     CONFIGURATION
     ======================================================= */

  const CONFIG = {
    chatSelector: "#chatBody",
    inputSelector: "#chatInput",
    formSelector: "#chatForm",
    typingDelay: 450,
    maxHistory: 30
  };

  const STORAGE_KEY = "vitalLoopAIHistory";


  /* =======================================================
     STATE
     ======================================================= */

  let conversationHistory = [];

  let isProcessing = false;


  /* =======================================================
     INITIALIZE
     ======================================================= */

  document.addEventListener(
    "DOMContentLoaded",
    function () {

      loadHistory();

      initializeAssistant();

    }
  );


  function initializeAssistant() {

    const form =
      document.querySelector(
        CONFIG.formSelector
      );

    const input =
      document.querySelector(
        CONFIG.inputSelector
      );

    if (!form || !input) {
      return;
    }

    /*
      The page-level assistant fallback may also listen
      to this form. Prevent duplicate processing by using
      the data attribute below.
    */

    if (
      form.dataset.vitalAssistantReady ===
      "true"
    ) {
      return;
    }

    form.dataset.vitalAssistantReady =
      "true";

    form.addEventListener(
      "submit",
      handleSubmit
    );

    initializeQuickActions();

  }


  /* =======================================================
     SUBMIT
     ======================================================= */

  function handleSubmit(event) {

    event.preventDefault();

    if (isProcessing) {
      return;
    }

    const input =
      document.querySelector(
        CONFIG.inputSelector
      );

    if (!input) {
      return;
    }

    const message =
      input.value.trim();

    if (!message) {
      return;
    }

    processMessage(message);

  }


  /* =======================================================
     MESSAGE PROCESSOR
     ======================================================= */

  function processMessage(message) {

    if (isProcessing) {
      return;
    }

    isProcessing = true;

    const input =
      document.querySelector(
        CONFIG.inputSelector
      );

    if (input) {
      input.value = "";
      input.style.height = "44px";
    }

    addMessage(
      message,
      "user"
    );

    saveHistoryItem({
      role: "user",
      text: message,
      timestamp: Date.now()
    });

    const typing =
      showTyping();

    setTimeout(
      function () {

        if (typing) {
          typing.remove();
        }

        const response =
          generateResponse(message);

        addMessage(
          response.text,
          "ai"
        );

        if (
          Array.isArray(
            response.actions
          )
        ) {

          addActionButtons(
            response.actions
          );

        }

        saveHistoryItem({
          role: "assistant",
          text: response.text,
          timestamp: Date.now()
        });

        isProcessing = false;

      },
      CONFIG.typingDelay
    );

  }


  /* =======================================================
     RESPONSE ENGINE
     ======================================================= */

  function generateResponse(message) {

    const text =
      normalize(message);

    /* ---------- GREETING ---------- */

    if (
      matches(text, [
        "hello",
        "hi",
        "hey",
        "namaste",
        "good morning",
        "good evening",
        "good afternoon"
      ])
    ) {

      return {
        text:
          "Namaste! 👋\n\n" +
          "Main VitaAI hoon — Vital Loop ka healthcare coordination assistant.\n\n" +
          "Aap emergency request, potential blood resources, donor network, healthcare facility, camps, request tracking ya blood education ke baare mein pooch sakte hain.",

        actions: [
          [
            "🚨 Emergency Request",
            "blood-request.html"
          ],
          [
            "🔎 Find Resources",
            "find-blood.html"
          ],
          [
            "✦ Easy Mode",
            "easy-mode.html"
          ]
        ]
      };

    }


    /* ---------- EMERGENCY ---------- */

    if (
      containsAny(text, [
        "emergency",
        "urgent",
        "bahut urgent",
        "jaldi blood",
        "abhi blood",
        "emergency blood",
        "critical"
      ])
    ) {

      return {
        text:
          "Agar situation medically urgent hai, sabse pehle authorised healthcare facility ya appropriate emergency service se contact karein.\n\n" +
          "Vital Loop aapko structured blood request create karne, potential resources discover karne aur coordination journey track karne mein help kar sakta hai.\n\n" +
          "Blood availability ko final/guaranteed na samjhein — authorised blood centre se verification zaroori hai.",

        actions: [
          [
            "🚨 Create Emergency Request",
            "blood-request.html"
          ],
          [
            "🔎 Find Resources",
            "find-blood.html"
          ],
          [
            "📍 Track Request",
            "tracking.html"
          ]
        ]
      };

    }


    /* ---------- BLOOD REQUEST ---------- */

    if (
      containsAny(text, [
        "blood request",
        "request create",
        "request banana",
        "request bnani",
        "blood chahiye",
        "blood required",
        "blood ki need",
        "mujhe blood chahiye",
        "blood dena hai"
      ])
    ) {

      const group =
        detectBloodGroup(text);

      if (group) {

        return {
          text:
            "Aapne " +
            group +
            " blood group mention kiya hai.\n\n" +
            "Main aapke liye request create karne ka next step open kar sakta hoon. Required details submit karne ke baad potential resource information ko authorised facility se verify karein.",

          actions: [
            [
              "🚨 Create Request",
              "blood-request.html"
            ],
            [
              "🔎 Find Resources",
              "find-blood.html"
            ]
          ]
        };

      }

      return {
        text:
          "Blood request create karne ke liye Vital Loop ka Emergency Request page open karein. Wahan required information structured form mein submit ki ja sakti hai.",

        actions: [
          [
            "🚨 Create Blood Request",
            "blood-request.html"
          ]
        ]
      };

    }


    /* ---------- BLOOD RESOURCE ---------- */

    if (
      containsAny(text, [
        "find blood",
        "blood bank",
        "blood centre",
        "blood center",
        "nearby blood",
        "near me blood",
        "blood resource",
        "resources find",
        "blood kaha milega",
        "blood kahan milega",
        "nearby resource"
      ])
    ) {

      return {
        text:
          "Vital Loop potential blood resources discover karne mein help karta hai.\n\n" +
          "Search result ko verified availability na samjhein. Actual stock, eligibility, compatibility aur release authorised blood centre/healthcare professionals se confirm hota hai.",

        actions: [
          [
            "🔎 Find Blood Resources",
            "find-blood.html"
          ],
          [
            "🚨 Create Request",
            "blood-request.html"
          ]
        ]
      };

    }


    /* ---------- BLOOD GROUP ---------- */

    const bloodGroup =
      detectBloodGroup(text);

    if (bloodGroup) {

      return {
        text:
          "Aapne " +
          bloodGroup +
          " blood group ke baare mein poocha hai.\n\n" +
          "Main blood groups ke educational information aur resource-discovery steps explain kar sakta hoon. Clinical compatibility ya transfusion decision authorised healthcare professionals hi determine karte hain.",

        actions: [
          [
            "📚 Blood Education",
            "blood-education.html"
          ],
          [
            "🔎 Find Resources",
            "find-blood.html"
          ]
        ]
      };

    }


    /* ---------- DONOR ---------- */

    if (
      containsAny(text, [
        "donor",
        "donors",
        "donate blood",
        "blood donate",
        "donation",
        "donor network",
        "donor registration",
        "donor banna"
      ])
    ) {

      return {
        text:
          "Vital Loop ka Donor Network section donor coordination ke liye hai.\n\n" +
          "Blood donation ki eligibility aur suitability individual situation par depend karti hai, isliye donation centre ya healthcare professional se confirmation zaroor karein.",

        actions: [
          [
            "👥 Donor Network",
            "donor.html"
          ],
          [
            "📅 Donation Camps",
            "camps.html"
          ],
          [
            "📚 Learn About Donation",
            "blood-education.html"
          ]
        ]
      };

    }


    /* ---------- CAMPS ---------- */

    if (
      containsAny(text, [
        "camp",
        "camps",
        "donation camp",
        "blood camp",
        "blood donation camp"
      ])
    ) {

      return {
        text:
          "Vital Loop ke Camps section mein available donation-camp information explore kar sakte hain.\n\n" +
          "Event timing, venue aur organiser details ko attend karne se pehle verify karna useful hai.",

        actions: [
          [
            "📅 Explore Camps",
            "camps.html"
          ]
        ]
      };

    }


    /* ---------- FACILITY / HOSPITAL ---------- */

    if (
      containsAny(text, [
        "hospital",
        "healthcare facility",
        "health facility",
        "clinic",
        "facility near",
        "nearby hospital",
        "hospital near me",
        "nearest hospital"
      ])
    ) {

      return {
        text:
          "Main healthcare facility discovery ke next step mein guide kar sakta hoon.\n\n" +
          "Emergency care ke liye facility ki current emergency capability directly verify karein.",

        actions: [
          [
            "🏥 Find Facility",
            "find-blood.html"
          ],
          [
            "🚨 Emergency Request",
            "blood-request.html"
          ]
        ]
      };

    }


    /* ---------- TRACKING ---------- */

    if (
      containsAny(text, [
        "track",
        "tracking",
        "request status",
        "status check",
        "meri request",
        "request kaha",
        "request kahan",
        "status kya hai"
      ])
    ) {

      return {
        text:
          "Aap Vital Loop Tracking page par apni saved coordination request ka current prototype status dekh sakte hain.",

        actions: [
          [
            "📍 Open Tracking",
            "tracking.html"
          ],
          [
            "📊 Dashboard",
            "dashboard.html"
          ]
        ]
      };

    }


    /* ---------- EDUCATION ---------- */

    if (
      containsAny(text, [
        "blood education",
        "blood groups",
        "blood group kya",
        "blood components",
        "blood ke bare",
        "blood information",
        "blood facts",
        "myths",
        "blood myth"
      ])
    ) {

      return {
        text:
          "Vital Loop Blood Education section mein blood groups, components, donation basics aur common myths ke baare mein educational information available hai.\n\n" +
          "Ye information educational purpose ke liye hai aur medical decision ka replacement nahi hai.",

        actions: [
          [
            "📚 Open Blood Education",
            "blood-education.html"
          ]
        ]
      };

    }


    /* ---------- PRESCRIPTION ---------- */

    if (
      containsAny(text, [
        "prescription",
        "prescription scan",
        "prescription upload",
        "medicine list",
        "medicine information",
        "medicine details",
        "medicine name"
      ])
    ) {

      return {
        text:
          "Vital Loop Prescription Intelligence prescription se visible information ko organise karne mein help kar sakta hai, jaise medicine name, visible strength, dates aur prescription par likhe instructions.\n\n" +
          "Main diagnosis, prescription change ya personalised medicine dose decide nahi karta. Unclear information ko doctor ya pharmacist se confirm karein.",

        actions: [
          [
            "💊 Prescription Intelligence",
            "prescription.html"
          ],
          [
            "📖 Medicine Information",
            "medicine.html"
          ]
        ]
      };

    }


    /* ---------- MEDICINE / DOSE ---------- */

    if (
      containsAny(text, [
        "medicine",
        "tablet",
        "capsule",
        "syrup",
        "dose",
        "dosage",
        "kitni medicine",
        "kitna dose",
        "age wise dose",
        "child dose"
      ])
    ) {

      return {
        text:
          "Main medicine information ko organise ya explain karne mein help kar sakta hoon, lekin personalised dose, age-based dose ya prescription change provide nahi karta.\n\n" +
          "Medicine ki exact instructions ke liye prescription aur doctor/pharmacist ki advice follow karein.",

        actions: [
          [
            "💊 Prescription",
            "prescription.html"
          ],
          [
            "📖 Medicine Information",
            "medicine.html"
          ]
        ]
      };

    }


    /* ---------- EASY MODE ---------- */

    if (
      containsAny(text, [
        "easy mode",
        "simple mode",
        "bada button",
        "large text",
        "elderly",
        "senior citizen",
        "simple interface",
        "easy interface"
      ])
    ) {

      return {
        text:
          "Easy Mode Vital Loop ko simpler banata hai — larger controls, clearer text, icon-based actions aur guided steps ke saath.\n\n" +
          "Ye emergency-stressed ya technology se unfamiliar users ke liye simplified navigation provide karta hai.",

        actions: [
          [
            "♿ Open Easy Mode",
            "easy-mode.html"
          ]
        ]
      };

    }


    /* ---------- LOCATION ---------- */

    if (
      containsAny(text, [
        "location",
        "my location",
        "meri location",
        "where am i",
        "near me"
      ])
    ) {

      return {
        text:
          "Location-based discovery ke liye browser/device permission required ho sakti hai.\n\n" +
          "Location share karne ke baad nearby potential resources ya healthcare facilities discover ki ja sakti hain.",

        actions: [
          [
            "🔎 Find Resources",
            "find-blood.html"
          ]
        ]
      };

    }


    /* ---------- VITAL LOOP ---------- */

    if (
      containsAny(text, [
        "what is vital loop",
        "vital loop kya hai",
        "vital loop",
        "about vital loop"
      ])
    ) {

      return {
        text:
          "Vital Loop ek healthcare coordination platform concept hai jo emergency requirements ko potential blood resources, donor networks aur authorised healthcare facilities ke saath structured coordination journey mein connect karne par focus karta hai.\n\n" +
          "Vital Loop blood ko store, test, transport, release ya distribute nahi karta.",

        actions: [
          [
            "ℹ About Vital Loop",
            "about.html"
          ]
        ]
      };

    }


    /* ---------- HELP ---------- */

    if (
      containsAny(text, [
        "help",
        "what can you do",
        "kya kar sakte ho",
        "how can you help",
        "options",
        "features"
      ])
    ) {

      return {
        text:
          "Main in areas mein guide kar sakta hoon:\n\n" +
          "🚨 Emergency blood request\n" +
          "🔎 Potential blood-resource discovery\n" +
          "👥 Donor network\n" +
          "🏥 Healthcare facility discovery\n" +
          "📅 Donation camps\n" +
          "📍 Request tracking\n" +
          "📚 Blood education\n" +
          "💊 Prescription information organisation\n" +
          "♿ Easy Mode",

        actions: [
          [
            "🚨 Emergency",
            "blood-request.html"
          ],
          [
            "🔎 Find Resources",
            "find-blood.html"
          ],
          [
            "📚 Education",
            "blood-education.html"
          ]
        ]
      };

    }


    /* ---------- THANK YOU ---------- */

    if (
      containsAny(text, [
        "thank you",
        "thanks",
        "thank",
        "dhanyawad"
      ])
    ) {

      return {
        text:
          "You're welcome! 💚\n\n" +
          "Vital Loop mein main aapko healthcare coordination ke next step tak guide karne ke liye available hoon."
      };

    }


    /* ---------- DEFAULT ---------- */

    return {
      text:
        "Main aapki request ko healthcare coordination ke context mein samajhne ki koshish kar raha hoon.\n\n" +
        "Aap simple words mein bata sakte hain ki aapko blood resource, emergency request, donor, hospital/facility, camp, tracking, education ya prescription information mein kis cheez ki help chahiye.",

      actions: [
        [
          "🚨 Emergency Request",
          "blood-request.html"
        ],
        [
          "🔎 Find Resources",
          "find-blood.html"
        ],
        [
          "✦ Easy Mode",
          "easy-mode.html"
        ]
      ]
    };

  }


  /* =======================================================
     TEXT HELPERS
     ======================================================= */

  function normalize(value) {

    return String(value || "")
      .toLowerCase()
      .replace(/[?!,.;:()[\]{}]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  }


  function containsAny(
    text,
    phrases
  ) {

    return phrases.some(
      function (phrase) {

        return text.includes(
          normalize(phrase)
        );

      }
    );

  }


  function matches(
    text,
    phrases
  ) {

    return phrases.some(
      function (phrase) {

        return text ===
          normalize(phrase);

      }
    );

  }


  function detectBloodGroup(text) {

    const normalized =
      normalize(text);

    const groups = [
      "AB negative",
      "AB positive",
      "AB-",
      "AB+",
      "A negative",
      "A positive",
      "A-",
      "A+",
      "B negative",
      "B positive",
      "B-",
      "B+",
      "O negative",
      "O positive",
      "O-",
      "O+"
    ];

    for (
      let i = 0;
      i < groups.length;
      i++
    ) {

      const group =
        groups[i];

      if (
        normalized.includes(
          normalize(group)
        )
      ) {

        return group
          .replace(
            "positive",
            "+"
          )
          .replace(
            "negative",
            "-"
          )
          .replace(
            /\s+/g,
            ""
          );

      }

    }

    return null;

  }


  /* =======================================================
     UI — ADD MESSAGE
     ======================================================= */

  function addMessage(
    text,
    type
  ) {

    const chatBody =
      document.querySelector(
        CONFIG.chatSelector
      );

    if (!chatBody) {
      return null;
    }

    const row =
      document.createElement(
        "div"
      );

    row.className =
      "message-row" +
      (
        type === "user"
          ? " user"
          : ""
      );

    const avatar =
      document.createElement(
        "div"
      );

    avatar.className =
      "message-mini-avatar";

    avatar.textContent =
      type === "user"
        ? "●"
        : "✦";

    const bubble =
      document.createElement(
        "div"
      );

    bubble.className =
      "message " +
      (
        type === "user"
          ? "user"
          : "ai"
      );

    bubble.textContent =
      text;

    row.appendChild(
      avatar
    );

    row.appendChild(
      bubble
    );

    chatBody.appendChild(
      row
    );

    scrollChat();

    return row;

  }


  /* =======================================================
     TYPING
     ======================================================= */

  function showTyping() {

    const chatBody =
      document.querySelector(
        CONFIG.chatSelector
      );

    if (!chatBody) {
      return null;
    }

    const row =
      document.createElement(
        "div"
      );

    row.className =
      "message-row";

    row.dataset.vitaTyping =
      "true";

    const avatar =
      document.createElement(
        "div"
      );

    avatar.className =
      "message-mini-avatar";

    avatar.textContent =
      "✦";

    const bubble =
      document.createElement(
        "div"
      );

    bubble.className =
      "message ai";

    const typing =
      document.createElement(
        "span"
      );

    typing.className =
      "typing";

    for (
      let i = 0;
      i < 3;
      i++
    ) {

      const dot =
        document.createElement(
          "span"
        );

      typing.appendChild(
        dot
      );

    }

    bubble.appendChild(
      typing
    );

    row.appendChild(
      avatar
    );

    row.appendChild(
      bubble
    );

    chatBody.appendChild(
      row
    );

    scrollChat();

    return row;

  }


  /* =======================================================
     ACTION BUTTONS
     ======================================================= */

  function addActionButtons(
    actions
  ) {

    if (
      !Array.isArray(actions) ||
      actions.length === 0
    ) {
      return;
    }

    const chatBody =
      document.querySelector(
        CONFIG.chatSelector
      );

    if (!chatBody) {
      return;
    }

    const wrapper =
      document.createElement(
        "div"
      );

    wrapper.className =
      "vita-ai-actions";

    actions.forEach(
      function (action) {

        if (
          !Array.isArray(action) ||
          action.length < 2
        ) {
          return;
        }

        const button =
          document.createElement(
            "a"
          );

        button.href =
          action[1];

        button.textContent =
          action[0];

        button.className =
          "vita-ai-action-link";

        wrapper.appendChild(
          button
        );

      }
    );

    chatBody.appendChild(
      wrapper
    );

    scrollChat();

  }


  /* =======================================================
     QUICK ACTIONS
     ======================================================= */

  function initializeQuickActions() {

    const buttons =
      document.querySelectorAll(
        ".quick-btn"
      );

    buttons.forEach(
      function (button) {

        if (
          button.dataset.vitaReady ===
          "true"
        ) {
          return;
        }

        button.dataset.vitaReady =
          "true";

        button.addEventListener(
          "click",
          function () {

            const message =
              button.dataset.message;

            if (
              message
            ) {

              processMessage(
                message
              );

            }

          }
        );

      }
    );

  }


  /* =======================================================
     SCROLL
     ======================================================= */

  function scrollChat() {

    const chatBody =
      document.querySelector(
        CONFIG.chatSelector
      );

    if (!chatBody) {
      return;
    }

    requestAnimationFrame(
      function () {

        chatBody.scrollTo({
          top:
            chatBody.scrollHeight,

          behavior:
            "smooth"
        });

      }
    );

  }


  /* =======================================================
     HISTORY
     ======================================================= */

  function loadHistory() {

    try {

      const saved =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (!saved) {
        return;
      }

      const parsed =
        JSON.parse(saved);

      if (
        Array.isArray(parsed)
      ) {

        conversationHistory =
          parsed.slice(
            -CONFIG.maxHistory
          );

      }

    } catch (error) {

      conversationHistory =
        [];

    }

  }


  function saveHistoryItem(
    item
  ) {

    conversationHistory.push(
      item
    );

    if (
      conversationHistory.length >
      CONFIG.maxHistory
    ) {

      conversationHistory =
        conversationHistory.slice(
          -CONFIG.maxHistory
        );

    }

    try {

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          conversationHistory
        )
      );

    } catch (error) {

      /*
        Storage can be unavailable in
        private/restricted browser contexts.
      */

    }

  }


  function clearHistory() {

    conversationHistory =
      [];

    try {

      localStorage.removeItem(
        STORAGE_KEY
      );

    } catch (error) {
      /* Ignore storage errors. */
    }

  }


  /* =======================================================
     PUBLIC API
     ======================================================= */

  window.VitalLoopAI = {

    send: function (
      message
    ) {

      if (
        typeof message !==
        "string"
      ) {
        return;
      }

      processMessage(
        message
      );

    },

    respond: function (
      message
    ) {

      return generateResponse(
        message
      );

    },

    clearHistory: function () {

      clearHistory();

    },

    getHistory: function () {

      return conversationHistory
        .slice();

    },

    isProcessing: function () {

      return isProcessing;

    }

  };


})();
