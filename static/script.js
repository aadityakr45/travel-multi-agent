let currentThreadId = localStorage.getItem("travel_thread_id") || null;
let latestAnswerMarkdown = "";
let latestResultData = {};
let waitingForApproval = false;
let activeArtifactTab = "overview";

const AGENT_LABELS = {
  flight_agent: "Flight Agent",
  hotel_agent: "Hotel Agent",
  weather_agent: "Weather Agent",
  budget_agent: "Budget Agent",
  itinerary_agent: "Itinerary Agent"
};

const AGENT_STATES = {
  supervisor: "Routing the request",
  guardrail: "Checking the request",
  flight_agent: "Research complete",
  hotel_agent: "Research complete",
  weather_agent: "Research complete",
  budget_agent: "Analysis complete",
  itinerary_agent: "Draft ready",
  human_review: "Your decision point"
};

function setPrompt(text) {
  const input = document.getElementById("userInput");
  input.value = text;
  input.focus();
  resizeComposer();
}

function resizeComposer() {
  const input = document.getElementById("userInput");
  if (!input) return;
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 170)}px`;
}

function setLoading(isLoading, mode = "draft") {
  const sendBtn = document.getElementById("sendBtn");
  const btnText = document.getElementById("btnText");
  const btnLoader = document.getElementById("btnLoader");
  const approveBtn = document.getElementById("approveBtn");
  const reviseBtn = document.getElementById("reviseBtn");
  const typingMessage = document.getElementById("typingMessage");

  sendBtn.disabled = isLoading;
  approveBtn.disabled = isLoading;
  reviseBtn.disabled = isLoading;

  if (isLoading && mode === "draft") {
    btnText.classList.add("hidden");
    btnLoader.classList.remove("hidden");
    typingMessage.classList.remove("hidden");
    typingMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });
  } else {
    btnText.classList.remove("hidden");
    btnLoader.classList.add("hidden");
    typingMessage.classList.add("hidden");
  }
}

function showError(message) {
  const errorBox = document.getElementById("errorBox");
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
  errorBox.scrollIntoView({ behavior: "smooth", block: "center" });
}

function hideError() {
  const errorBox = document.getElementById("errorBox");
  errorBox.classList.add("hidden");
  errorBox.textContent = "";
}

function renderMarkdown(element, markdown) {
  if (typeof marked !== "undefined") {
    element.innerHTML = marked.parse(markdown || "");
  } else {
    element.textContent = markdown || "";
  }
}

function markdownToHtml(markdown) {
  if (typeof marked !== "undefined") {
    return marked.parse(markdown || "");
  }
  return `<p>${escapeHtml(markdown || "")}</p>`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function readConstraint(constraints, keys, fallback = "—") {
  for (const key of keys) {
    const value = constraints?.[key];
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value).trim();
    }
  }
  return fallback;
}

function updateThreadIdentity(data, userMessage = "") {
  const constraints = data.trip_constraints || {};
  const destination = readConstraint(constraints, ["destination", "to", "dest"], "");
  const duration = readConstraint(constraints, ["duration_days", "duration", "days"], "");
  const title = destination ? `Trip to ${destination}` : (userMessage.slice(0, 34) || "Travel planning thread");
  const meta = duration ? `${duration} · Active planning thread` : "Active planning thread";

  document.getElementById("conversationTitle").textContent = title;
  document.getElementById("threadLabel").textContent = title;
  document.getElementById("threadMeta").textContent = meta;
  document.getElementById("threadInfo").textContent = data.thread_id ? `Thread ${data.thread_id}` : "Active thread";
}

function showUserMessage(message) {
  document.getElementById("welcomeState").classList.add("hidden");
  document.getElementById("userMessage").classList.remove("hidden");
  document.getElementById("userMessageText").textContent = message;
}

function updateMission(status, label, text, progress, tone = "") {
  document.getElementById("missionStatusLabel").textContent = label;
  const pill = document.getElementById("missionStatusPill");
  pill.textContent = status;
  pill.className = `status-pill ${tone}`.trim();
  document.getElementById("missionStatusText").textContent = text;
  document.getElementById("missionProgressBar").style.width = `${progress}%`;
}

function setAgentState(agent, state, detail, tone = "") {
  const step = document.querySelector(`.agent-step[data-agent="${agent}"]`);
  if (!step) return;
  step.classList.remove("active", "complete", "blocked");
  if (tone) step.classList.add(tone);
  const stateText = step.querySelector(".agent-state");
  const detailText = step.querySelector("small");
  if (stateText) stateText.textContent = state;
  if (detailText && detail) detailText.textContent = detail;
}

function showWorkflow(data) {
  const selectedAgents = data.selected_agents || [];
  const guardrailPassed = data.guardrail_allowed !== false;
  const requiresApproval = data.requires_approval === true;
  const completedCount = selectedAgents.length + 2 + (requiresApproval ? 0 : 2);
  const progress = Math.min(100, Math.round((completedCount / 9) * 100));

  setAgentState("supervisor", "Complete", data.supervisor_reasoning ? "Routing complete" : AGENT_STATES.supervisor, "complete");
  setAgentState("guardrail", guardrailPassed ? "Passed" : "Blocked", data.guardrail_reason || AGENT_STATES.guardrail, guardrailPassed ? "complete" : "blocked");

  ["flight_agent", "hotel_agent", "weather_agent", "budget_agent", "itinerary_agent"].forEach((agent) => {
    if (selectedAgents.includes(agent)) {
      setAgentState(agent, "Complete", AGENT_STATES[agent], "complete");
    } else {
      setAgentState(agent, "Skipped", "Not selected for this route");
    }
  });

  if (!guardrailPassed) {
    setAgentState("human_review", "Blocked", "Request did not pass guardrails", "blocked");
    setAgentState("final_response", "Blocked", "Waiting for a valid request", "blocked");
    updateMission("Blocked", "Guardrail blocked", data.guardrail_reason || "This request cannot enter the travel workflow.", 25, "blocked");
  } else if (requiresApproval) {
    setAgentState("human_review", "Active", "Review the draft itinerary", "active");
    setAgentState("final_response", "Pending", "Waiting for your approval");
    updateMission("Review", "Draft ready", "The agent network has prepared a draft. Your review is the next step.", Math.max(progress, 82), "warn");
  } else {
    setAgentState("human_review", "Complete", "Review completed", "complete");
    setAgentState("final_response", "Complete", "Route delivered", "complete");
    updateMission("Complete", "Route finalized", "The agent network has completed this travel plan.", 100);
  }

  document.getElementById("agentCount").textContent = `${Math.min(completedCount, 9)} / 9`;
  document.getElementById("missionReasoning").querySelector("p").textContent = data.supervisor_reasoning || "Supervisor routing completed. The selected specialists contributed to this route.";
}

function summaryMarkup(data) {
  const constraints = data.trip_constraints || {};
  const items = [
    ["Origin", readConstraint(constraints, ["origin", "from", "departure"])],
    ["Destination", readConstraint(constraints, ["destination", "to", "dest"])],
    ["Duration", readConstraint(constraints, ["duration_days", "duration", "days"])],
    ["Budget", readConstraint(constraints, ["budget", "budget_limit", "max_budget"])]
  ];
  return items.map(([label, value]) => `<div class="summary-item"><span>${label}</span><strong title="${escapeHtml(value)}">${escapeHtml(value)}</strong></div>`).join("");
}

function artifactContent(tab) {
  const data = latestResultData;
  const answer = latestAnswerMarkdown;
  const sourceMap = {
    flights: data.flight_results,
    hotels: data.hotel_results,
    weather: data.weather_results,
    budget: data.budget_results,
    itinerary: data.itinerary || answer
  };

  if (tab === "overview") {
    if (!answer) return '<div class="artifact-placeholder">Voyanta has not returned a travel summary yet.</div>';
    return `<div class="overview-intro">Here is the current travel intelligence for this planning thread.</div>${markdownToHtml(answer)}`;
  }

  const content = sourceMap[tab];
  if (!content) {
    return `<div class="artifact-placeholder">No separate ${tab} artifact was returned. Related guidance may be included in the overview or final itinerary.</div>`;
  }
  return markdownToHtml(content);
}

function renderActiveArtifact() {
  const resultBox = document.getElementById("resultBox");
  resultBox.innerHTML = artifactContent(activeArtifactTab);
  document.querySelectorAll(".artifact-tab").forEach((tab) => {
    const isActive = tab.dataset.tab === activeArtifactTab;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });
}

function showResult(answer, threadId, isDraft = false, data = {}) {
  latestAnswerMarkdown = answer || "";
  latestResultData = data;
  activeArtifactTab = "overview";

  const assistantMessage = document.getElementById("assistantMessage");
  assistantMessage.classList.remove("hidden");
  document.getElementById("welcomeState").classList.add("hidden");
  document.getElementById("resultSection").classList.remove("hidden");
  document.getElementById("resultEyebrow").textContent = isDraft ? "Draft artifact" : "Final travel artifact";
  document.getElementById("resultTitle").textContent = isDraft ? "Your draft route" : "Your finalized route";
  document.getElementById("assistantIntro").textContent = isDraft
    ? "I’ve assembled a draft route from the agent network. Review it before I finalize the plan."
    : "The route is finalized. You can explore the research artifacts or export the complete plan.";
  document.getElementById("tripSummary").innerHTML = summaryMarkup(data);
  renderActiveArtifact();
  updateThreadIdentity({ ...data, thread_id: threadId });

  assistantMessage.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showApproval(data) {
  waitingForApproval = true;
  const section = document.getElementById("approvalSection");
  document.getElementById("approvalRequest").textContent = data.approval_request || "Approve the draft or provide feedback before the final plan is generated.";
  section.classList.remove("hidden");
}

function hideApproval() {
  waitingForApproval = false;
  document.getElementById("approvalSection").classList.add("hidden");
  document.getElementById("approvalFeedback").value = "";
}

function resetConversation() {
  currentThreadId = null;
  latestAnswerMarkdown = "";
  latestResultData = {};
  waitingForApproval = false;
  localStorage.removeItem("travel_thread_id");
  document.getElementById("userInput").value = "";
  document.getElementById("welcomeState").classList.remove("hidden");
  document.getElementById("userMessage").classList.add("hidden");
  document.getElementById("assistantMessage").classList.add("hidden");
  document.getElementById("typingMessage").classList.add("hidden");
  document.getElementById("approvalSection").classList.add("hidden");
  document.getElementById("conversationTitle").textContent = "A new route starts here";
  document.getElementById("threadLabel").textContent = "New travel plan";
  document.getElementById("threadMeta").textContent = "Ready when you are";
  document.getElementById("threadInfo").textContent = "No thread yet";
  document.getElementById("userMessageText").textContent = "";
  updateMission("Ready", "Standing by", "Your agent network is ready for a new planning thread.", 0);
  document.getElementById("agentCount").textContent = "0 / 9";
  document.querySelectorAll(".agent-step").forEach((step) => {
    step.classList.remove("active", "complete", "blocked");
    const agent = step.dataset.agent;
    step.querySelector(".agent-state").textContent = agent === "human_review" ? "Waiting" : agent === "final_response" ? "Pending" : agent === "supervisor" || agent === "guardrail" ? "Idle" : "Standby";
  });
  document.getElementById("missionReasoning").querySelector("p").textContent = "When a conversation begins, Voyanta will explain which specialists it selected and why.";
  hideError();
  resizeComposer();
}

async function sendMessage() {
  hideError();

  if (waitingForApproval) {
    showError("Review the current draft before starting another planning thread.");
    return;
  }

  const input = document.getElementById("userInput");
  const message = input.value.trim();

  if (!message) {
    showError("Describe the trip you want Voyanta to plan first.");
    input.focus();
    return;
  }

  showUserMessage(message);
  updateThreadIdentity({}, message);
  setLoading(true, "draft");

  try {
    const response = await fetch("/api/travel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, thread_id: currentThreadId })
    });

    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.error || "Something went wrong.");

    currentThreadId = data.thread_id;
    localStorage.setItem("travel_thread_id", currentThreadId);
    showWorkflow(data);

    if (data.requires_approval) {
      showResult(data.itinerary || data.answer, data.thread_id, true, data);
      showApproval(data);
    } else {
      hideApproval();
      showResult(data.answer, data.thread_id, false, data);
    }
  } catch (error) {
    showError(error.message);
  } finally {
    setLoading(false, "draft");
  }
}

async function submitApproval(approved) {
  hideError();

  if (!currentThreadId || !waitingForApproval) {
    showError("There is no draft waiting for review.");
    return;
  }

  const feedbackInput = document.getElementById("approvalFeedback");
  const feedback = feedbackInput.value.trim();

  if (!approved && !feedback) {
    showError("Tell Voyanta what you would like changed before requesting a revision.");
    feedbackInput.focus();
    return;
  }

  setLoading(true, "approval");

  try {
    const response = await fetch("/api/travel/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ thread_id: currentThreadId, approved, feedback })
    });

    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.error || "Could not resume the travel workflow.");

    showWorkflow(data);
    hideApproval();
    showResult(data.answer, data.thread_id, false, data);
  } catch (error) {
    showError(error.message);
  } finally {
    setLoading(false, "approval");
  }
}

function copyResult() {
  if (!latestAnswerMarkdown) return;
  navigator.clipboard.writeText(latestAnswerMarkdown)
    .then(() => {
      const button = document.querySelector(".copy-btn");
      const oldText = button.textContent;
      button.textContent = "Copied";
      setTimeout(() => { button.textContent = oldText; }, 1400);
    })
    .catch(() => showError("Could not copy the travel plan."));
}

function downloadPDF() {
  const pdfContent = document.getElementById("pdfContent");
  if (!latestAnswerMarkdown || !pdfContent || typeof html2pdf === "undefined") {
    showError("No travel plan is available to download yet.");
    return;
  }

  const downloadButton = document.querySelector(".download-btn");
  const oldText = downloadButton.textContent;
  downloadButton.textContent = "Preparing...";
  downloadButton.disabled = true;

  const options = {
    margin: 0.5,
    filename: "voyanta-ai-travel-plan.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
    jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ["avoid-all", "css", "legacy"] }
  };

  html2pdf().set(options).from(pdfContent).save()
    .then(() => { downloadButton.textContent = oldText; downloadButton.disabled = false; })
    .catch(() => {
      downloadButton.textContent = oldText;
      downloadButton.disabled = false;
      showError("Could not download the travel plan.");
    });
}

function initializeWorkspace() {
  document.getElementById("userInput").addEventListener("input", resizeComposer);
  document.querySelectorAll(".artifact-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      activeArtifactTab = tab.dataset.tab;
      renderActiveArtifact();
    });
  });

  document.getElementById("newThreadBtn").addEventListener("click", resetConversation);
  document.getElementById("themeToggle").addEventListener("click", () => {
    document.documentElement.classList.toggle("light-mode");
    localStorage.setItem("voyanta_theme", document.documentElement.classList.contains("light-mode") ? "light" : "dark");
  });

  document.getElementById("missionToggle").addEventListener("click", () => {
    document.querySelector(".app-shell").classList.toggle("mission-collapsed");
  });

  if (localStorage.getItem("voyanta_theme") === "light") {
    document.documentElement.classList.add("light-mode");
  }

  resizeComposer();
}

document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    event.preventDefault();
    sendMessage();
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    document.getElementById("userInput").focus();
  }
});

document.addEventListener("DOMContentLoaded", initializeWorkspace);
