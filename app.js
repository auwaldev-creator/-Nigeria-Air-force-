/* NAF Recruitment Portal - Main Application Script */
document.addEventListener("DOMContentLoaded", () => {

    const NAF_DB = {
        users: "naf_portal_users",
        session: "naf_portal_session",
        appDataPrefix: "naf_app_data_"
    };

    // === UTILITY FUNCTIONS ===

    /** Nuna sako a sama (Toast Notification) */
    function showToast(message, type = 'success') {
        const toast = document.getElementById("toast");
        if (!toast) return;
        
        toast.textContent = message;
        toast.className = `toast show ${type}`;
        
        setTimeout(() => {
            toast.className = toast.className.replace("show", "");
        }, 3000);
    }

    /** Nuna sako a cikin form */
    function showFormError(elementId, message) {
        const errorEl = document.getElementById(elementId);
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = "block";
        }
    }

    /** Boye sako a cikin form */
    function clearFormError(elementId) {
        const errorEl = document.getElementById(elementId);
        if (errorEl) {
            errorEl.textContent = "";
            errorEl.style.display = "none";
        }
    }

    /** Samu bayanai daga localStorage */
    function getFromDB(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }

    /** Adana bayanai a localStorage */
    function saveToDB(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    // === MOBILE MENU LOGIC (Dukkan Shafuka) ===
    const navToggle = document.getElementById("navToggle");
    const navMenu = document.getElementById("navMenu");

    if (navToggle && navMenu) {
        navToggle.addEventListener("click", () => {
            navMenu.classList.toggle("active");
            // Canja icon
            const icon = navToggle.querySelector('i');
            if (navMenu.classList.contains("active")) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // === REQUIREMENTS PAGE LOGIC (requirements.html) ===
    const acceptCheckbox = document.getElementById("acceptGuidelines");
    const proceedBtn = document.getElementById("proceedBtn");
    const acceptError = document.getElementById("acceptError");

    if (acceptCheckbox && proceedBtn) {
        acceptCheckbox.addEventListener("change", () => {
            if (acceptCheckbox.checked) {
                proceedBtn.disabled = false;
                proceedBtn.innerHTML = '<i class="fas fa-lock-open"></i> Proceed to Register';
                proceedBtn.classList.remove('btn-primary');
                proceedBtn.classList.add('btn-success');
                if(acceptError) acceptError.style.display = 'none';
            } else {
                proceedBtn.disabled = true;
                proceedBtn.innerHTML = '<i class="fas fa-lock"></i> Proceed to Register';
                proceedBtn.classList.remove('btn-success');
                proceedBtn.classList.add('btn-primary');
            }
        });

        proceedBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if (acceptCheckbox.checked) {
                // Tura zuwa shafin rijista
                window.location.href = "register.html";
            } else {
                 if(acceptError) acceptError.style.display = 'block';
            }
        });
    }

    // === REGISTRATION PAGE LOGIC (register.html) ===
    const registerForm = document.getElementById("registerForm");

    if (registerForm) {
        registerForm.addEventListener("submit", (e) => {
            e.preventDefault();
            clearFormError("registerError");

            const fullName = document.getElementById("fullName").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirmPassword").value;

            if (password !== confirmPassword) {
                showFormError("registerError", "Passwords do not match.");
                return;
            }

            let users = getFromDB(NAF_DB.users) || [];
            
            // Bincika ko an yi rijista da email din
            const existingUser = users.find(user => user.email === email);
            if (existingUser) {
                showFormError("registerError", "Email address is already registered.");
                return;
            }

            // Adana sabon user
            const newUser = { fullName, email, password }; // A aikin gaske, zaa boye password (hash)
            users.push(newUser);
            saveToDB(NAF_DB.users, users);

            // Yi login da shi kai tsaye
            saveToDB(NAF_DB.session, { email: newUser.email, fullName: newUser.fullName });

            // Tura zuwa shafin cika form
            window.location.href = "apply.html";
        });
    }

    // === LOGIN PAGE LOGIC (login.html) ===
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            clearFormError("loginError");

            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            let users = getFromDB(NAF_DB.users) || [];
            
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                // An yi nasarar shiga
                saveToDB(NAF_DB.session, { email: user.email, fullName: user.fullName });
                window.location.href = "apply.html";
            } else {
                // Bayanai ba daidai ba
                showFormError("loginError", "Invalid email or password.");
            }
        });
    }


    // === APPLICATION FORM LOGIC (apply.html) ===
    const applicationForm = document.getElementById("applicationForm");

    if (applicationForm) {
        
        // --- Kariyar Shafi (Route Protection) ---
        const session = getFromDB(NAF_DB.session);
        if (!session) {
            // Idan baa shiga ba, mayar da shi shafin login
            window.location.href = "login.html";
            return; // Dakatar da sauran aikin
        }

        // --- Gaisuwa & Logout ---
        const welcomeUser = document.getElementById("welcomeUser");
        const logoutBtn = document.getElementById("logoutBtn");

        if (welcomeUser) {
            welcomeUser.textContent = `Welcome, ${session.fullName}`;
        }
        if (logoutBtn) {
            logoutBtn.addEventListener("click", () => {
                localStorage.removeItem(NAF_DB.session);
                window.location.href = "index.html";
            });
        }

        // --- Loda Bayanan da Aka Adana ---
        const appEmail = document.getElementById("appEmail");
        const appFullName = document.getElementById("appFullName");
        const appDataKey = `${NAF_DB.appDataPrefix}${session.email}`;
        
        // Sanya email da suna a form
        if(appEmail) appEmail.value = session.email;
        if(appFullName) appFullName.value = session.fullName;

        function loadSavedApplication() {
            const savedData = getFromDB(appDataKey);
            if (savedData) {
                // Cika dukkan form da bayanan da aka adana
                Object.keys(savedData).forEach(key => {
                    const field = applicationForm.elements[key];
                    if (field && field.type !== 'file') {
                        field.value = savedData[key];
                    }
                });
                showToast("Application data loaded successfully.", "success");
            }
        }
        loadSavedApplication(); // Loda bayanan lokacin da shafin ya bude


        // --- Form Wizard (Multi-step) Logic ---
        const steps = Array.from(document.querySelectorAll(".form-step"));
        const wizardSteps = Array.from(document.querySelectorAll(".wizard-step"));
        const nextBtns = document.querySelectorAll("[data-action='next']");
        const prevBtns = document.querySelectorAll("[data-action='prev']");
        let currentStep = 0;

        function showStep(stepIndex) {
            steps.forEach((step, index) => {
                step.classList.toggle("active", index === stepIndex);
            });
            wizardSteps.forEach((step, index) => {
                step.classList.toggle("active", index === stepIndex);
                if (index < stepIndex) {
                    step.classList.add("completed");
                } else {
                    step.classList.remove("completed");
                }
            });
            currentStep = stepIndex;
        }

        nextBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                // TODO: Add validation here before going next
                if (currentStep < steps.length - 1) {
                    showStep(currentStep + 1);
                }
            });
        });

        prevBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                if (currentStep > 0) {
                    showStep(currentStep - 1);
                }
            });
        });

        // --- Aikin Submit Form ---
        applicationForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const formData = new FormData(applicationForm);
            const data = {};
            formData.forEach((value, key) => {
                // Kar a adana file, adana sunan file kawai
                if (value instanceof File) {
                    data[key] = value.name ? value.name : '';
                } else {
                    data[key] = value;
                }
            });

            // Adana bayanan a localStorage
            saveToDB(appDataKey, data);

            // Nuna sako
            showToast("Application Submitted Successfully!", "success");
            
            // Bayan 3 seconds, tura zuwa index
            setTimeout(() => {
                // A aikin gaske, zaka iya tura shi zuwa "dashboard"
                window.location.href = "index.html"; 
            }, 3000);
        });
    }

});
