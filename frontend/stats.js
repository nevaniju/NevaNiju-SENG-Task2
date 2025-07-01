fetch('/getstats')
  .then(res => res.json())
  .then(data => {
    const statsDiv = document.getElementById('stats-list');
    if (data.length === 0) {
      statsDiv.innerHTML = "<p>No stats found. Do some tests!</p>";
      return;
    }
    statsDiv.innerHTML = data.map(s => `
      <div class="stat-entry">
        <strong>WPM:</strong> ${s.wpm} <br/>
        <strong>Accuracy:</strong> ${s.accuracy}% <br/>
        <strong>Duration:</strong> ${s.duration}s <br/>
        <strong>Date:</strong> ${new Date(s.created_at).toLocaleString()}
      </div>
    `).join('');
  });
