fetch('/getstats')
  .then(res => res.json())
  .then(data => {
    const statsDiv = document.getElementById('stats-list');
    const bestWPM = document.getElementById('best-wpm');
    const bestAccuracy = document.getElementById('best-accuracy');

    if (data.length === 0) {
      statsDiv.innerHTML = "<p>No stats found. Do some tests!</p>";
      bestWPM.textContent = "-";
      bestAccuracy.textContent = "-";
      return;
    }

    let maxWPM = 0;
    let maxAccuracy = 0;

    data.forEach(s => {
      if (s.wpm > maxWPM) maxWPM = s.wpm;
      if (s.accuracy > maxAccuracy) maxAccuracy = s.accuracy;
    });

    bestWPM.textContent = `${maxWPM}`;
    bestAccuracy.textContent = `${maxAccuracy}%`;

    statsDiv.innerHTML = data.map(s => `
      <div class="stat-entry">
        <strong>WPM:</strong> ${s.wpm} <br/>
        <strong>Accuracy:</strong> ${s.accuracy}% <br/>
        <strong>Duration:</strong> ${s.duration}s <br/>
        <strong>Date:</strong> ${new Date(s.created_at).toLocaleString()}
      </div>
    `).join('');
  });

function logout() {
  fetch('/logout')
    .then(() => window.location.href = "/loginsignup.html");
}
