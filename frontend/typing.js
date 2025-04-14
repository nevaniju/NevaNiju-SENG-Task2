  const words = [
    "open", "great", "help", "general", "early", "stand", "first", "place", "year", "face",
    "hand", "own", "after", "only", "lead", "public", "few", "while", "fact", "turn",
    "show", "this", "come", "where", "see", "do", "own", "thing", "light", "elevate", 
    "moment", "potential", "shine", "influence", "dream", "contribution",
    "calm", "spectrum", "focus", "dynamic", "hold", "discovery", "clear", "revolutionary",
    "strong", "integrity", "depth", "transform", "path", "perspective", "change", "explore",
    "wise", "unpredictable", "open", "inspire", "glow", "realize", "momentum", "success"
  ];
  
  let typedIndex = 0;
  let testStarted = false;
  let startTime;
  let timerInterval;
  let currentChars = [];
  const wordCount = 30;
  
  const wordsContainer = document.getElementById("words-container");
  const hiddenInput = document.getElementById("hidden-input");
  const wpmDisplay = document.getElementById("wpm");
  const accuracyDisplay = document.getElementById("accuracy");
  
  function generateWords() {
    let randomWords = [];
    for (let i = 0; i < wordCount; i++) {
      const rand = words[Math.floor(Math.random() * words.length)];
      randomWords.push(rand);
    }
    return randomWords.join(" ");
  }
  
  function renderWords() {
    const wordStr = generateWords();
    wordsContainer.innerHTML = "";
    currentChars = [];
  
    wordStr.split("").forEach((char, index) => {
      const span = document.createElement("span");
      span.innerText = char;
      span.classList.add("char");
      if (index === 0) span.classList.add("active");
      wordsContainer.appendChild(span);
      currentChars.push(span);
    });
  
    typedIndex = 0;
  }
  
  function startTest() {
    clearInterval(timerInterval);
    renderWords();
    wpmDisplay.textContent = "WPM: 0";
    accuracyDisplay.textContent = "Accuracy: 100%";
    testStarted = false;
  }
  
  function calculateStats() {
    const elapsedTime = (Date.now() - startTime) / 1000 / 60;
    const typedChars = typedIndex;
    const correctChars = currentChars.filter(c => c.classList.contains("correct")).length;
    const wpm = Math.round((correctChars / 5) / elapsedTime);
    const accuracy = Math.round((correctChars / typedChars) * 100) || 0;
  
    wpmDisplay.textContent = `WPM: ${wpm}`;
    accuracyDisplay.textContent = `Accuracy: ${accuracy}%`;
  }
  
  hiddenInput.addEventListener("input", () => {
    const input = hiddenInput.value;
    const currentChar = currentChars[typedIndex];
  
    if (!testStarted) {
      startTime = Date.now();
      testStarted = true;
      timerInterval = setInterval(calculateStats, 1000);
    }
  
    if (!currentChar) return;
  
    const expectedChar = currentChar.innerText;
    const typedChar = input.slice(-1);
  
    if (typedChar === expectedChar) {
      currentChar.classList.add("correct");
    } else {
      currentChar.classList.add("incorrect");
    }
  
    currentChar.classList.remove("active");
    typedIndex++;
    if (currentChars[typedIndex]) currentChars[typedIndex].classList.add("active");
    hiddenInput.value = "";
  });
  
  startTest();
  