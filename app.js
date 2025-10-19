// app.js - Don dukkan shafuka

document.addEventListener('DOMContentLoaded', () => {
  
  // --- Logic Don Mobile Menu (index.html) ---
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.getElementById('nav');
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      nav.classList.toggle('active');
    });
  }

  // --- Logic Don Login Page (login.html) ---
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = e.target.email.value;
      
      // A demo, muna adana email a localStorage don gaisuwa
      // A ainihin aiki, anan za'a tura zuwa server
      localStorage.setItem('naf_demo_user', email);
      
      alert('Login (Demo) Successful! Ana tura ka zuwa shafin cike form.');
      
      // Tura zuwa shafin cika form
      window.location.href = 'apply.html';
    });
  }

  // --- Logic Don Application Page (apply.html) ---
  const appForm = document.getElementById('appForm');
  const preview = document.getElementById('appPreview');
  const clearBtn = document.getElementById('clearBtn');
  const exportBtn = document.getElementById('exportBtn');
  const applicantNameEl = document.getElementById('applicantName');

  // Aiki don loda bayanan da aka adana
  function loadSavedData() {
    const raw = localStorage.getItem('naf_demo_app');
    if (!raw) {
      preview.textContent = 'Babu bayanan da aka adana.';
      return null;
    }
    try {
      const data = JSON.parse(raw);
      preview.innerHTML = `<strong>${data.fullname}</strong><div>${data.email}</div><div>Cadre: ${data.cadre}</div>`;
      return data;
    } catch (e) {
      preview.textContent = 'Babu bayanan da aka adana.';
      return null;
    }
  }

  // Aiki don nuna sunan mai cikawa
  function loadApplicantName() {
    const userEmail = localStorage.getItem('naf_demo_user');
    if (applicantNameEl && userEmail) {
      applicantNameEl.textContent = userEmail;
    }
  }

  if (appForm) {
    // Loda sunan mai amfani da bayanan da ya adana
    loadApplicantName();
    const savedData = loadSavedData();

    // Cika form da bayanan da aka adana
    if (savedData) {
      for (const key in savedData) {
        if (appForm.elements[key]) {
          appForm.elements[key].value = savedData[key];
        }
      }
    }

    // Aiki yayin submit form
    appForm.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(appForm);
      const obj = {};
      for (const [k, v] of fd.entries()) {
        if (v instanceof File && v.size === 0) {
            // Kar a adana file mara amfani
        } else {
            obj[k] = v instanceof File ? v.name : v;
        }
      }
      obj.savedAt = new Date().toISOString();
      
      localStorage.setItem('naf_demo_app', JSON.stringify(obj));
      
      alert('An Adana Bayananka (A Demo)! A aikin gaske, zaa tura zuwa server.');
      loadSavedData();
    });

    // Aikin maballin Goge Bayanai
    clearBtn.addEventListener('click', () => {
      if (confirm('Ka tabbata kana son goge bayanan da ka adana a wannan browser?')) {
        localStorage.removeItem('naf_demo_app');
        appForm.reset();
        loadSavedData();
      }
    });

    // Aikin maballin Fitar da JSON
    exportBtn.addEventListener('click', () => {
      const raw = localStorage.getItem('naf_demo_app');
      if (!raw) {
        alert('Babu bayanan demo da zaa fitar');
        return;
      }
      const blob = new Blob([raw], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'naf_application_demo.json';
      a.click();
      URL.revokeObjectURL(url);
    });
  }
});
