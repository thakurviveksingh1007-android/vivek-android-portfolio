(() => {
  "use strict";

  /* ---------- Preloader ---------- */
  window.addEventListener("load", () => {
    const pre = document.getElementById("preloader");
    if (!pre) return;
    const log = document.getElementById("preloaderLog");
    const lines = [
      "$ ./build_portfolio.sh",
      "> compiling ui ...",
      "> running tests ... 24 passed",
      "BUILD SUCCESSFUL in 1.2s",
    ];
    if (log) {
      let step = 0;
      log.textContent = lines[0];
      const tick = setInterval(() => {
        step += 1;
        if (step < lines.length) log.textContent = lines[step];
        else clearInterval(tick);
      }, 240);
    }
    setTimeout(() => pre.classList.add("done"), 1050);
    setTimeout(() => pre.remove(), 1750);
  });

  /* ---------- Year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Theme ---------- */
  const root = document.documentElement;
  const toggle = document.getElementById("themeToggle");
  const stored = localStorage.getItem("theme");
  if (stored) root.setAttribute("data-theme", stored);

  toggle?.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });

  /* ---------- Nav scroll ---------- */
  const nav = document.getElementById("nav");
  const onScroll = () => {
    nav?.classList.toggle("scrolled", window.scrollY > 24);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  const burger = document.getElementById("navBurger");
  const links = document.getElementById("navLinks");
  const closeMenu = () => {
    burger?.classList.remove("open");
    links?.classList.remove("open");
    document.body.style.overflow = "";
  };
  burger?.addEventListener("click", () => {
    const open = !links?.classList.contains("open");
    burger.classList.toggle("open", open);
    links?.classList.toggle("open", open);
    document.body.style.overflow = open ? "hidden" : "";
  });
  links?.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (e) => e.key === "Escape" && closeMenu());

  /* ---------- Active nav link ---------- */
  const sections = [...document.querySelectorAll("section[id]")];
  const navLinks = [...document.querySelectorAll(".nav__link")];

  const bpHud = document.getElementById("bpHud");
  const bpHudSections = document.getElementById("bpHudSections");
  const bpScroll = document.getElementById("bpScroll");
  const bpSection = document.getElementById("bpSection");
  const bpY = document.getElementById("bpY");
  const bpProgress = document.getElementById("bpProgress");
  const bpPaths = [...document.querySelectorAll("#bpDraw path")];
  const bpLabels = {
    home: "Home",
    about: "About",
    skills: "Skills",
    playground: "Playground",
    projects: "Projects",
    experience: "Experience",
    contact: "Contact",
  };
  const bpHudItems = [];

  sections.forEach((section, index) => {
    if (!bpHudSections) return;
    const li = document.createElement("li");
    li.dataset.section = section.id;
    li.textContent = `${String(index + 1).padStart(2, "0")} ${bpLabels[section.id] || section.id}`;
    bpHudSections.appendChild(li);
    bpHudItems.push(li);
  });

  const setBpHudActive = (id) => {
    bpHudItems.forEach((item) => item.classList.toggle("active", item.dataset.section === id));
    const index = sections.findIndex((section) => section.id === id);
    if (bpSection) bpSection.textContent = String(Math.max(index + 1, 0)).padStart(2, "0");
  };

  const updateBpProgress = () => {
    const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const progress = Math.min(Math.max(window.scrollY / max, 0), 1);
    bpHud?.style.setProperty("--bp-p", String(progress));
    if (bpProgress) bpProgress.style.transform = `scaleX(${progress})`;
    if (bpScroll) bpScroll.textContent = `${String(Math.round(progress * 100)).padStart(3, "0")}%`;
    if (bpY) bpY.textContent = String(Math.round(window.scrollY)).padStart(5, "0");
    bpPaths.forEach((path) => (path.style.strokeDashoffset = String(1 - progress)));
  };

  let bpTicking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (bpTicking) return;
      bpTicking = true;
      requestAnimationFrame(() => {
        updateBpProgress();
        bpTicking = false;
      });
    },
    { passive: true }
  );
  window.addEventListener("resize", updateBpProgress);
  setBpHudActive("home");
  updateBpProgress();

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === `#${id}`));
        setBpHudActive(id);
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
  );
  sections.forEach((s) => spy.observe(s));

  /* ---------- Reveal on scroll ---------- */
  const revealObs = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => revealObs.observe(el));

  /* ---------- Skill bars ---------- */
  const barObs = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const bar = entry.target;
        const w = bar.dataset.w || "0";
        requestAnimationFrame(() => (bar.style.width = `${w}%`));
        obs.unobserve(bar);
      });
    },
    { threshold: 0.4 }
  );
  document.querySelectorAll(".bar__track i").forEach((b) => barObs.observe(b));

  /* ---------- Counters ---------- */
  const animateCount = (el) => {
    const target = Number(el.dataset.count || 0);
    const suffix = el.dataset.suffix || "";
    const dur = 1400;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const countObs = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.6 }
  );
  document.querySelectorAll("[data-count]").forEach((el) => countObs.observe(el));

  /* ---------- Typewriter ---------- */
  const typeEl = document.getElementById("typewriter");
  const roles = [
    "Android Developer",
    "Kotlin & Java Engineer",
    "MVVM Enthusiast",
    "Problem Solver",
    "Immediate Joiner",
  ];
  if (typeEl) {
    let ri = 0;
    let ci = 0;
    let deleting = false;
    const tick = () => {
      const word = roles[ri];
      if (!deleting) {
        ci++;
        typeEl.textContent = word.slice(0, ci);
        if (ci === word.length) {
          deleting = true;
          return setTimeout(tick, 1900);
        }
        setTimeout(tick, 62 + Math.random() * 42);
      } else {
        ci--;
        typeEl.textContent = word.slice(0, ci);
        if (ci === 0) {
          deleting = false;
          ri = (ri + 1) % roles.length;
          return setTimeout(tick, 320);
        }
        setTimeout(tick, 30);
      }
    };
    setTimeout(tick, 700);
  }

  /* ---------- Cursor glow ---------- */
  const glow = document.getElementById("cursorGlow");
  if (glow && window.matchMedia("(pointer: fine)").matches) {
    let gx = 0;
    let gy = 0;
    let cx = 0;
    let cy = 0;
    window.addEventListener("mousemove", (e) => {
      gx = e.clientX;
      gy = e.clientY;
      glow.style.opacity = "1";
    });
    const loop = () => {
      cx += (gx - cx) * 0.12;
      cy += (gy - cy) * 0.12;
      glow.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    };
    loop();
  }

  /* ---------- Tilt on code card ---------- */
  const card = document.querySelector(".code-card");
  if (card && window.matchMedia("(pointer: fine)").matches) {
    const terminalForm = card.querySelector(".terminal__form");
    terminalForm?.addEventListener("focusin", () => card.classList.add("is-typing"));
    terminalForm?.addEventListener("focusout", () => card.classList.remove("is-typing"));
    card.addEventListener("mousemove", (e) => {
      if (card.classList.contains("is-typing") || e.target.closest(".terminal__form, .terminal__quick")) return;
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(1200px) rotateY(${px * 10}deg) rotateX(${-py * 8}deg) translateY(-6px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  }

  /* ---------- Floating code glyphs ---------- */
  const rain = document.getElementById("codeRain");
  if (rain && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const glyphs = ["</>", "{ }", "( )", "fun", "val", "01", "//", "=>", "[ ]", "git", "px", "++", "&&", "λ"];
    const count = window.innerWidth < 700 ? 9 : 18;
    for (let i = 0; i < count; i++) {
      const s = document.createElement("span");
      s.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
      s.style.left = `${Math.random() * 100}%`;
      s.style.top = `${Math.random() * 100}%`;
      s.style.fontSize = `${(10 + Math.random() * 16) | 0}px`;
      s.style.setProperty("--dur", `${(7 + Math.random() * 8).toFixed(1)}s`);
      s.style.setProperty("--delay", `${(-Math.random() * 8).toFixed(1)}s`);
      s.style.setProperty("--dx", `${((Math.random() * 40) - 20) | 0}px`);
      s.style.setProperty("--dy", `${(-20 - Math.random() * 40) | 0}px`);
      s.style.setProperty("--rot", `${((Math.random() * 20) - 10) | 0}deg`);
      s.style.opacity = (0.5 + Math.random() * 0.5).toFixed(2);
      rain.appendChild(s);
    }
  }

  /* ---------- Blueprint -> reality lab ---------- */
  const labStage = document.getElementById("labStage");
  const labRange = document.getElementById("labRange");

  if (labStage) {
    let labPos = 96;
    let labDragging = false;
    let labTouched = false;
    let labMin = 20;
    let labMax = 80;

    const labPhone = labStage.querySelector(".phone--real");

    const measureLab = () => {
      if (!labPhone) return;
      const stageRect = labStage.getBoundingClientRect();
      const phoneRect = labPhone.getBoundingClientRect();
      if (!stageRect.width) return;
      labMin = ((phoneRect.left - stageRect.left) / stageRect.width) * 100;
      labMax = ((phoneRect.right - stageRect.left) / stageRect.width) * 100;
    };

    const setLabPos = (value) => {
      labPos = Math.max(4, Math.min(96, value));
      const stagePos = labMin + (labPos / 100) * (labMax - labMin);
      labStage.style.setProperty("--lab-pos", `${stagePos}%`);
      if (labRange) labRange.value = String(Math.round(labPos));
    };

    const posFromEvent = (e) => {
      const rect = labStage.getBoundingClientRect();
      const stagePos = ((e.clientX - rect.left) / rect.width) * 100;
      return ((stagePos - labMin) / (labMax - labMin)) * 100;
    };

    measureLab();
    setLabPos(96);
    window.addEventListener("resize", () => {
      measureLab();
      setLabPos(labPos);
    });

    labRange?.addEventListener("input", () => {
      labTouched = true;
      setLabPos(Number(labRange.value));
    });

    labStage.addEventListener("pointerdown", (e) => {
      if (e.target.closest("input")) return;
      labDragging = true;
      labTouched = true;
      labStage.setPointerCapture(e.pointerId);
    });
    labStage.addEventListener("pointermove", (e) => {
      if (labDragging) setLabPos(posFromEvent(e));
    });
    const stopLabDrag = () => {
      labDragging = false;
    };
    labStage.addEventListener("pointerup", stopLabDrag);
    labStage.addEventListener("pointercancel", stopLabDrag);

    labStage.addEventListener("keydown", (e) => {
      if (e.target.closest("input")) return;
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      labTouched = true;
      setLabPos(labPos + (e.key === "ArrowLeft" ? -2 : 2));
    });

    const labObs = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          obs.unobserve(entry.target);
          if (labTouched) return;
          const start = performance.now();
          const from = 96;
          const to = 50;
          const animate = (now) => {
            if (labTouched) return;
            const p = Math.min((now - start) / 1250, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setLabPos(from + (to - from) * eased);
            if (p < 1) requestAnimationFrame(animate);
          };
          setTimeout(() => requestAnimationFrame(animate), 220);
        });
      },
      { threshold: 0.35 }
    );
    labObs.observe(labStage.closest(".lab") || labStage);
  }

  /* ---------- Command palette ---------- */
  const cmdk = document.getElementById("cmdk");
  const cmdkInput = document.getElementById("cmdkInput");
  const cmdkList = document.getElementById("cmdkList");
  const cmdkTrigger = document.getElementById("cmdkTrigger");
  const toastEl = document.getElementById("toast");
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform);
  let cmdkActive = 0;
  let cmdkResults = [];

  document.querySelectorAll(".cmdk-trigger__kbd").forEach((el) => {
    el.textContent = isMac ? "\u2318K" : "Ctrl K";
  });

  const toast = (message, ms = 2200) => {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add("show");
    clearTimeout(toastEl._timer);
    toastEl._timer = setTimeout(() => toastEl.classList.remove("show"), ms);
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.cssText = "position:fixed;top:-1000px;opacity:0";
      document.body.appendChild(field);
      field.select();
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      }
      field.remove();
      return ok;
    }
  };

  const closeCmdk = () => {
    if (!cmdk) return;
    cmdk.classList.remove("open");
    cmdk.setAttribute("aria-hidden", "true");
  };

  const scrollToSection = (id) => {
    closeCmdk();
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const commands = [
    { icon: "\u25c8", label: "Go to About", hint: "section", run: () => scrollToSection("#about") },
    { icon: "\u25c6", label: "Go to Skills", hint: "section", run: () => scrollToSection("#skills") },
    { icon: "\u25d0", label: "Go to Playground", hint: "section", run: () => scrollToSection("#playground") },
    { icon: "\u25a6", label: "Go to Projects", hint: "section", run: () => scrollToSection("#projects") },
    { icon: "\u25a4", label: "Go to Experience", hint: "section", run: () => scrollToSection("#experience") },
    { icon: "\u2709", label: "Go to Contact", hint: "section", run: () => scrollToSection("#contact") },
    { icon: "\u2193", label: "Download CV", hint: "PDF", run: () => { closeCmdk(); window.location.href = "assets/Vivek_Singh_Resume.pdf"; } },
    { icon: "\u29c9", label: "Copy email address", hint: "thakurviveksingh1007@gmail.com", run: async () => { const ok = await copyText("thakurviveksingh1007@gmail.com"); toast(ok ? "Email copied to clipboard" : "Could not copy email"); closeCmdk(); } },
    { icon: "\u2197", label: "Open GitHub", hint: "github.com", run: () => { closeCmdk(); window.open("https://github.com/thakurviveksingh1007-android", "_blank", "noopener"); } },
    { icon: "in", label: "Open LinkedIn", hint: "linkedin.com", run: () => { closeCmdk(); window.open("https://www.linkedin.com/in/vivek-singh-6b281a236/", "_blank", "noopener"); } },
    { icon: "\u263e", label: "Toggle theme", hint: "appearance", run: () => { document.getElementById("themeToggle")?.click(); toast("Theme switched"); closeCmdk(); } },
  ];

  const setCmdkActive = (index) => {
    if (!cmdkList) return;
    const items = [...cmdkList.querySelectorAll(".cmdk__item")];
    if (!items.length) return;
    cmdkActive = (index + items.length) % items.length;
    items.forEach((item, i) => item.classList.toggle("active", i === cmdkActive));
    items[cmdkActive]?.scrollIntoView({ block: "nearest" });
  };

  const renderCmdk = (query = "") => {
    if (!cmdkList) return;
    const q = query.trim().toLowerCase();
    cmdkResults = commands.filter((cmd) => `${cmd.label} ${cmd.hint}`.toLowerCase().includes(q));
    cmdkActive = 0;
    cmdkList.innerHTML = "";
    if (!cmdkResults.length) {
      const empty = document.createElement("li");
      empty.className = "cmdk__empty";
      empty.textContent = "No command found. Try \u201cprojects\u201d or \u201ctheme\u201d.";
      cmdkList.appendChild(empty);
      return;
    }
    cmdkResults.forEach((cmd, index) => {
      const li = document.createElement("li");
      li.className = "cmdk__item" + (index === 0 ? " active" : "");
      const icon = document.createElement("span");
      icon.className = "cmdk__item-icon";
      icon.textContent = cmd.icon;
      const label = document.createElement("span");
      label.className = "cmdk__item-label";
      label.textContent = cmd.label;
      const hint = document.createElement("span");
      hint.className = "cmdk__item-hint";
      hint.textContent = cmd.hint;
      li.append(icon, label, hint);
      li.addEventListener("mouseenter", () => setCmdkActive(index));
      li.addEventListener("click", () => cmd.run());
      cmdkList.appendChild(li);
    });
  };

  const openCmdk = () => {
    if (!cmdk) return;
    cmdk.classList.add("open");
    cmdk.setAttribute("aria-hidden", "false");
    if (cmdkInput) {
      cmdkInput.value = "";
      renderCmdk("");
    }
    setTimeout(() => cmdkInput?.focus(), 60);
  };

  cmdkTrigger?.addEventListener("click", openCmdk);
  cmdk?.addEventListener("click", (e) => {
    if (e.target.closest("[data-cmdk-close]")) closeCmdk();
  });

  cmdkInput?.addEventListener("input", () => renderCmdk(cmdkInput.value));
  cmdkInput?.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCmdkActive(cmdkActive + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCmdkActive(cmdkActive - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      cmdkResults[cmdkActive]?.run();
    }
  });

  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (cmdk?.classList.contains("open")) closeCmdk();
      else openCmdk();
    }
    if (e.key === "Escape" && cmdk?.classList.contains("open")) closeCmdk();
  });

  const terminalForm = document.getElementById("terminalForm");
  const terminalInput = document.getElementById("terminalInput");
  const terminalOutput = document.getElementById("terminalOutput");
  if (terminalForm && terminalInput && terminalOutput) {
    const history = [];
    let historyIndex = -1;

    const print = (text, className = "") => {
      const line = document.createElement("div");
      line.className = `term-line${className ? ` ${className}` : ""}`;
      line.textContent = text;
      terminalOutput.appendChild(line);
      while (terminalOutput.children.length > 90) terminalOutput.firstElementChild.remove();
      terminalOutput.scrollTop = terminalOutput.scrollHeight;
    };

    const printCommand = (command) => {
      const line = document.createElement("div");
      line.className = "term-line";
      const prompt = document.createElement("span");
      prompt.className = "term-prompt";
      prompt.textContent = "➜ ~ ";
      line.append(prompt, document.createTextNode(command));
      terminalOutput.appendChild(line);
      while (terminalOutput.children.length > 90) terminalOutput.firstElementChild.remove();
      terminalOutput.scrollTop = terminalOutput.scrollHeight;
    };

    const downloadResume = () => {
      const link = document.createElement("a");
      link.href = "assets/Vivek_Singh_Resume.pdf";
      link.download = "";
      link.click();
    };

    const terminalCommands = {
      help: () => {
        print("Available commands:", "term-out");
        [
          "whoami      about me",
          "skills      core stack",
          "projects    jump to projects",
          "playground  blueprint playground",
          "experience  work history",
          "resume      download CV",
          "email       copy email address",
          "github      open GitHub",
          "linkedin    open LinkedIn",
          "theme       switch theme",
          "ls          list sections",
          "date        current date",
          "clear       clear terminal",
          "sudo hire-me",
        ].forEach((line) => print(`  ${line}`, "term-dim"));
      },
      whoami: () => {
        print("Vivek Singh — Android Developer", "term-out");
        print("B.Sc. Computer Science · 1 year experience · Indore", "term-dim");
      },
      about: () => {
        print("Opening about section...", "term-dim");
        scrollToSection("#about");
      },
      skills: () => {
        print("Android   Kotlin · Java · Jetpack Compose · XML UI", "term-out");
        print("Arch      MVVM · Retrofit · Coroutines · Hilt", "term-out");
        print("Tools     Git · Firebase · SQLite · Postman · Gradle", "term-out");
      },
      projects: () => {
        print("3 published GitHub projects: SkillForge, UserDirectory, Brewkery", "term-out");
        print("Opening projects...", "term-dim");
        scrollToSection("#projects");
      },
      playground: () => {
        print("Opening blueprint playground...", "term-dim");
        scrollToSection("#playground");
      },
      experience: () => {
        print("Arisetty Technologies · Logical Soft Tech · Universal Informatics", "term-out");
        print("Opening experience...", "term-dim");
        scrollToSection("#experience");
      },
      contact: () => {
        print("Opening contact...", "term-dim");
        scrollToSection("#contact");
      },
      resume: () => {
        print("Downloading Vivek_Singh_Resume.pdf...", "term-ok");
        downloadResume();
      },
      email: async () => {
        const ok = await copyText("thakurviveksingh1007@gmail.com");
        print(ok ? "Email copied to clipboard." : "Could not copy email.", ok ? "term-ok" : "term-err");
      },
      github: () => {
        print("Opening github.com/thakurviveksingh1007-android", "term-dim");
        window.open("https://github.com/thakurviveksingh1007-android", "_blank", "noopener");
      },
      linkedin: () => {
        print("Opening LinkedIn...", "term-dim");
        window.open("https://www.linkedin.com/in/vivek-singh-6b281a236/", "_blank", "noopener");
      },
      theme: () => {
        toggle?.click();
        print(`Theme switched to ${root.getAttribute("data-theme")}.`, "term-ok");
      },
      ls: () => {
        print(sections.map((section) => section.id).join("  "), "term-out");
      },
      date: () => {
        print(new Date().toLocaleString(), "term-out");
      },
      pwd: () => {
        print("/home/vivek/portfolio", "term-out");
      },
      exit: () => {
        print("Nice try. The portfolio stays open.", "term-accent");
      },
      sudo: (args) => {
        if (args.toLowerCase().replace(/\s+/g, "-") === "hire-me") {
          print("Permission granted. Opening contact...", "term-ok");
          scrollToSection("#contact");
        } else {
          print("sudo: permission denied. Try 'sudo hire-me'.", "term-err");
        }
      },
    };

    const runCommand = (raw) => {
      const value = raw.trim();
      if (!value) return;
      const [name, ...rest] = value.split(/\s+/);
      const key = name.toLowerCase();
      const args = rest.join(" ");
      history.push(value);
      historyIndex = -1;

      if (key === "clear") {
        terminalOutput.innerHTML = "";
        return;
      }

      printCommand(value);

      if (key === "echo") {
        print(args, "term-out");
        return;
      }

      const command = terminalCommands[key];
      if (!command) {
        print(`command not found: ${key}`, "term-err");
        print("type 'help' to see available commands", "term-dim");
        return;
      }
      command(args);
    };

    terminalForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const value = terminalInput.value;
      terminalInput.value = "";
      runCommand(value);
    });

    terminalInput.addEventListener("keydown", (event) => {
      if (event.key === "ArrowUp") {
        if (!history.length) return;
        event.preventDefault();
        historyIndex = historyIndex < 0 ? history.length - 1 : Math.max(historyIndex - 1, 0);
        terminalInput.value = history[historyIndex];
        terminalInput.setSelectionRange(terminalInput.value.length, terminalInput.value.length);
      } else if (event.key === "ArrowDown") {
        if (historyIndex < 0) return;
        event.preventDefault();
        historyIndex += 1;
        if (historyIndex >= history.length) {
          historyIndex = -1;
          terminalInput.value = "";
        } else {
          terminalInput.value = history[historyIndex];
          terminalInput.setSelectionRange(terminalInput.value.length, terminalInput.value.length);
        }
      } else if (event.key === "Tab") {
        const prefix = terminalInput.value.trim().toLowerCase();
        if (!prefix) return;
        const match = Object.keys(terminalCommands).find((command) => command.startsWith(prefix));
        if (match) {
          event.preventDefault();
          terminalInput.value = match;
        }
      }
    });

    document.querySelectorAll("[data-cmd]").forEach((button) => {
      button.addEventListener("click", () => {
        terminalInput.value = "";
        runCommand(button.dataset.cmd);
        terminalInput.focus();
      });
    });
  }

  const projectPreviews = {
    kavach: {
      title: "KavachApp",
      tag: "Enterprise",
      sub: "Enterprise Workflow Automation · Arisetty Technologies",
      desc: "30+ screens across attendance, leave, visitor management, gate pass, incident reporting and map-based patrol. 10–15 REST APIs, token auth, Firebase push, Crashlytics and Google Maps.",
      tech: ["Java", "MVVM", "Retrofit", "Firebase", "Maps"],
      link: "",
      accent: "#7c5cff",
      nav: ["Home", "Tasks", "Patrol", "Profile"],
      screens: [
        {
          label: "Dashboard",
          type: "dashboard",
          title: "Kavach",
          sub: "Mon, 19 Oct · Indore",
          greeting: "Good morning, Vivek",
          stats: [["98%", "Attendance"], ["12", "Gate Pass"], ["4", "Visitors"]],
          rows: [
            ["◷", "Attendance", "Checked in · 09:12", "On time"],
            ["▤", "Leave", "2 requests pending", "2"],
            ["◉", "Visitor", "4 visitors today", "4"],
            ["⌖", "Patrol", "Sector 4 route active", "Live"],
          ],
        },
        {
          label: "Attendance",
          type: "list",
          title: "Attendance",
          sub: "October 2026",
          search: "Search employee",
          rows: [
            ["VS", "Vivek Singh", "Android Developer", "09:12"],
            ["AK", "Amit Kumar", "Field Ops", "09:18"],
            ["RS", "Riya Sharma", "Admin", "09:24"],
            ["MP", "Manish Patel", "Security", "09:31"],
          ],
        },
        {
          label: "Patrol",
          type: "map",
          title: "Live Patrol",
          sub: "Sector 4 · 3 checkpoints",
          rows: [
            ["01", "Main Gate", "Scan complete", "10:04"],
            ["02", "Parking Lot", "Scan complete", "10:18"],
            ["03", "Server Room", "Pending", "—"],
          ],
        },
      ],
    },
    gkb: {
      title: "GharKaBazaar",
      tag: "In Progress",
      sub: "Hyperlocal Marketplace App · Personal Project",
      desc: "A marketplace connecting local businesses with customers. Compose, MVVM, Retrofit, Coroutines and Hilt power an API-driven catalog, cart and orders with loading and error states.",
      tech: ["Kotlin", "Compose", "MVVM", "Hilt", "Retrofit"],
      link: "",
      accent: "#22d3ee",
      nav: ["Home", "Market", "Cart", "Profile"],
      screens: [
        {
          label: "Market",
          type: "grid",
          nav: 1,
          title: "GharKaBazaar",
          sub: "Nearby stores",
          search: "Search products",
          chips: ["All", "Grocery", "Dairy", "Home"],
          cards: [["Fresh Basket", "₹ 240"], ["Daily Dairy", "₹ 120"], ["Home Needs", "₹ 310"], ["Local Picks", "₹ 180"]],
          section: {
            title: "Nearby stores",
            action: "See all",
            rows: [["FM", "FreshMart", "1.4 km · 18 min", "Open"], ["DN", "Daily Needs", "2.1 km · 24 min", "Open"]],
          },
        },
        {
          label: "Product",
          type: "detail",
          title: "Organic Basket",
          sub: "Fresh · 2 km away",
          hero: "🥬",
          badges: ["4.8 ★", "30 min", "In stock"],
          lines: [85, 60, 72],
          cta: "Add to cart",
        },
        {
          label: "Cart",
          type: "cart",
          title: "Your cart",
          sub: "2 items · 1 store",
          rows: [["Organic Basket", "1 × ₹ 240", "₹ 240"], ["Daily Dairy", "2 × ₹ 120", "₹ 240"]],
          total: "₹ 480",
          cta: "Checkout",
        },
      ],
    },
    skillforge: {
      title: "SkillForge",
      tag: "Compose",
      sub: "Online Learning App · 3-Screen Flow",
      desc: "Home, Course Detail and Lesson screens with horizontal category lists, popular courses, instructor cards, free and locked lessons, video-lesson UI and loading states.",
      tech: ["Kotlin", "Compose", "Hilt", "Coil", "Navigation"],
      link: "https://github.com/thakurviveksingh1007-android/skillforge-android-assignment",
      accent: "#facc15",
      nav: ["Home", "Courses", "Saved", "Profile"],
      screens: [
        {
          label: "Home",
          type: "grid",
          title: "SkillForge",
          sub: "Learn by building",
          search: "Search courses",
          chips: ["All", "Compose", "Kotlin", "UI"],
          cards: [["Design Systems", "4.8 ★"], ["Compose Basics", "4.7 ★"], ["Kotlin Flow", "4.9 ★"], ["Clean UI", "4.6 ★"]],
          section: {
            title: "Continue learning",
            action: "Resume",
            rows: [["04", "Kotlin Flow", "Lesson 04 · 62%", "▶"], ["05", "UI Patterns", "Lesson 05 · 18%", "▶"]],
          },
        },
        {
          label: "Course",
          type: "detail",
          title: "Design Systems",
          sub: "Course detail · 12 lessons",
          hero: "▶",
          badges: ["4.8 ★", "12 lessons", "2h 10m"],
          lines: [90, 65, 78],
          cta: "Start learning",
        },
        {
          label: "Lesson",
          type: "lesson",
          title: "Design Systems",
          sub: "Lesson 04 · Tokens",
          progress: 62,
          rows: [
            ["01", "Color tokens", "08:24", "✓"],
            ["02", "Spacing scale", "12:10", "✓"],
            ["03", "Typography", "10:02", "✓"],
            ["04", "Components", "Locked", "🔒"],
          ],
        },
      ],
    },
    userdir: {
      title: "UserDirectory",
      tag: "REST + MVVM",
      sub: "User Directory App · List & Detail",
      desc: "Splash to list to detail flow using a paginated REST API. Sealed UI states for Loading, Success, Error, No Internet and Empty, plus SwipeRefresh retry and DiffUtil lists.",
      tech: ["Kotlin", "MVVM", "Retrofit", "StateFlow", "Glide", "DiffUtil"],
      link: "https://github.com/thakurviveksingh1007-android/UserDirectory",
      accent: "#60a5fa",
      nav: ["Home", "Users", "Search", "Profile"],
      screens: [
        {
          label: "List",
          type: "list",
          title: "UserDirectory",
          sub: "120 users · REST API",
          search: "Search users",
          rows: [
            ["AS", "Aarav Sharma", "aarav@example.com", "View"],
            ["DI", "Diya Iyer", "diya@example.com", "View"],
            ["KV", "Kabir Verma", "kabir@example.com", "View"],
            ["NR", "Neha Rao", "neha@example.com", "View"],
          ],
        },
        {
          label: "Detail",
          type: "detail",
          title: "Aarav Sharma",
          sub: "Product Designer · Bengaluru",
          hero: "AS",
          badges: ["REST", "MVVM", "StateFlow"],
          lines: [82, 64, 74],
          cta: "Contact user",
        },
        {
          label: "States",
          type: "states",
          title: "UI States",
          sub: "Loading → Success → Error",
          states: [
            ["◌", "Loading", "Skeleton + shimmer"],
            ["✓", "Success", "List + detail"],
            ["!", "Error", "Retry action"],
            ["∅", "Empty", "No users found"],
          ],
        },
      ],
    },
    pharmacy: {
      title: "Pharmacy Store App",
      tag: "Internship",
      sub: "Medicine Search & Ordering · Logical Soft Tech",
      desc: "Medicine search, cart, order placement and tracking with admin inventory management. Built with Java, XML UI, REST integration and SQLite persistence fundamentals.",
      tech: ["Java", "REST", "SQLite", "XML UI"],
      link: "",
      accent: "#34d399",
      nav: ["Home", "Medicines", "Cart", "Profile"],
      screens: [
        {
          label: "Search",
          type: "list",
          title: "Pharmacy Store",
          sub: "Medicine search",
          search: "Search medicine",
          rows: [
            ["💊", "Paracetamol", "500 mg · 10 tablets", "₹ 32"],
            ["💊", "Cetirizine", "10 mg · 10 tablets", "₹ 45"],
            ["💊", "Vitamin C", "500 mg · 15 tablets", "₹ 80"],
            ["💊", "ORS", "Powder · 1 sachet", "₹ 20"],
          ],
        },
        {
          label: "Cart",
          type: "cart",
          title: "Your cart",
          sub: "3 medicines",
          rows: [["Paracetamol", "2 × ₹ 32", "₹ 64"], ["Cetirizine", "1 × ₹ 45", "₹ 45"], ["Vitamin C", "1 × ₹ 80", "₹ 80"]],
          total: "₹ 189",
          cta: "Place order",
        },
        {
          label: "Order",
          type: "order",
          title: "Order #PH-1042",
          sub: "Placed · 19 Oct",
          steps: [["Order placed", "done"], ["Packed", "done"], ["Out for delivery", "active"], ["Delivered", ""]],
          rows: [["Paracetamol", "2 × ₹ 32", "₹ 64"], ["Cetirizine", "1 × ₹ 45", "₹ 45"]],
          cta: "Track order",
        },
      ],
    },
    brew: {
      title: "Brewkery",
      tag: "Assignment",
      sub: "Coffee Ordering App · 4-Screen Flow",
      desc: "Menu to Item Detail to Cart to Order Status with Compose, MVVM, Retrofit, Coroutines and Coil. Includes unit tests and a clean cart quantity and category filtering model.",
      tech: ["Kotlin", "Compose", "MVVM", "Coil", "Testing"],
      link: "https://github.com/thakurviveksingh1007-android/Brewkery",
      accent: "#f472b6",
      nav: ["Home", "Menu", "Cart", "Profile"],
      screens: [
        {
          label: "Menu",
          type: "grid",
          title: "Brewkery",
          sub: "Coffee, fresh daily",
          search: "Search menu",
          chips: ["All", "Coffee", "Tea", "Bakes"],
          cards: [["Flat White", "₹ 180"], ["Cold Brew", "₹ 210"], ["Masala Chai", "₹ 90"], ["Croissant", "₹ 120"]],
          section: {
            title: "Popular pairings",
            action: "See all",
            rows: [["☕", "Flat White + Croissant", "Combo · save ₹ 20", "₹ 280"], ["🧋", "Cold Brew + Bakes", "Combo · save ₹ 30", "₹ 300"]],
          },
        },
        {
          label: "Item",
          type: "detail",
          title: "Flat White",
          sub: "Coffee · 240 ml",
          hero: "☕",
          badges: ["4.9 ★", "Hot", "2 min"],
          lines: [88, 55, 70],
          cta: "Add to cart",
        },
        {
          label: "Cart",
          type: "cart",
          title: "Your order",
          sub: "2 items",
          rows: [["Flat White", "1 × ₹ 180", "₹ 180"], ["Croissant", "1 × ₹ 120", "₹ 120"]],
          total: "₹ 300",
          cta: "Place order",
        },
      ],
    },
  };

  const makeEl = (tag, className = "", text = "") => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };

  const buildTop = (screen, project) => {
    const top = makeEl("div", "pv-top");
    const main = makeEl("div", "pv-top__main");
    const title = screen.type === "detail" ? project.title : screen.title;
    const sub = screen.type === "detail" ? "Detail view" : screen.sub;
    main.append(makeEl("div", "pv-top__title", title || ""), makeEl("div", "pv-top__sub", sub || ""));
    top.append(main, makeEl("span", "pv-avatar"));
    return top;
  };

  const buildRows = (rows = []) => {
    const list = makeEl("div", "pv-list");
    rows.forEach(([icon, title, sub, meta]) => {
      const row = makeEl("div", "pv-row");
      const main = makeEl("div", "pv-row__main");
      main.append(makeEl("div", "pv-row__title", title || ""), makeEl("div", "pv-row__sub", sub || ""));
      row.append(makeEl("span", "pv-row__icon", icon || "•"), main, makeEl("span", "pv-row__meta", meta || ""));
      list.appendChild(row);
    });
    return list;
  };

  const buildStats = (stats = []) => {
    const wrap = makeEl("div", "pv-stats");
    stats.forEach(([value, label]) => {
      const stat = makeEl("div", "pv-stat");
      stat.append(makeEl("b", "", value), makeEl("span", "", label));
      wrap.appendChild(stat);
    });
    return wrap;
  };

  const buildChips = (chips = []) => {
    const wrap = makeEl("div", "pv-chips");
    chips.forEach((label, index) => wrap.appendChild(makeEl("span", `pv-chip${index === 0 ? " active" : ""}`, label)));
    return wrap;
  };

  const buildCards = (cards = []) => {
    const grid = makeEl("div", "pv-grid");
    cards.forEach(([title, price]) => {
      const card = makeEl("div", "pv-card");
      const body = makeEl("div", "pv-card__body");
      body.append(makeEl("div", "pv-card__title", title), makeEl("div", "pv-card__price", price));
      card.append(makeEl("div", "pv-card__img"), body);
      grid.appendChild(card);
    });
    return grid;
  };

  const navIcons = [
    '<svg viewBox="0 0 24 24"><path d="M3 10.6 12 3l9 7.6V21H3z"/><path d="M9 21v-6h6v6"/></svg>',
    '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.6"/><rect x="14" y="3" width="7" height="7" rx="1.6"/><rect x="3" y="14" width="7" height="7" rx="1.6"/><rect x="14" y="14" width="7" height="7" rx="1.6"/></svg>',
    '<svg viewBox="0 0 24 24"><path d="M6 8h12l-1 12H7z"/><path d="M9 8a3 3 0 0 1 6 0"/></svg>',
    '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.6"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>',
  ];

  const buildNav = (labels = [], active = 0) => {
    const nav = makeEl("div", "pv-nav");
    labels.forEach((label, index) => {
      const item = makeEl("div", `pv-nav__item${index === active ? " active" : ""}`);
      item.innerHTML = navIcons[index % navIcons.length];
      item.appendChild(makeEl("span", "", label));
      nav.appendChild(item);
    });
    return nav;
  };

  const buildSection = (section) => {
    const wrap = makeEl("div", "pv-section");
    const head = makeEl("div", "pv-section__head");
    head.append(makeEl("span", "", section.title || ""), makeEl("span", "", section.action || ""));
    const list = makeEl("div", "pv-section__list");
    (section.rows || []).forEach(([icon, title, sub, meta]) => {
      const row = makeEl("div", "pv-section__row");
      const main = makeEl("div", "pv-row__main");
      main.append(makeEl("div", "pv-section__title", title || ""), makeEl("div", "pv-section__sub", sub || ""));
      row.append(makeEl("span", "pv-section__icon", icon || "•"), main, makeEl("span", "pv-section__meta", meta || ""));
      list.appendChild(row);
    });
    wrap.append(head, list);
    return wrap;
  };

  const navIndexByType = { dashboard: 0, grid: 0, list: 1, detail: 1, cart: 2, order: 2, map: 2, lesson: 1, states: 1 };

  const renderProjectScreen = (target, project, screen) => {
    if (!target) return;
    target.innerHTML = "";
    target.style.setProperty("--pv-accent", project.accent);
    target.appendChild(buildTop(screen, project));
    const body = makeEl("div", "pv-body");

    if (screen.type === "dashboard") {
      body.appendChild(makeEl("div", "pv-greeting", screen.greeting || ""));
      body.appendChild(buildStats(screen.stats));
      body.appendChild(buildRows(screen.rows));
    } else if (screen.type === "list") {
      if (screen.search) body.appendChild(makeEl("div", "pv-search", screen.search));
      body.appendChild(buildRows(screen.rows));
    } else if (screen.type === "grid") {
      if (screen.search) body.appendChild(makeEl("div", "pv-search", screen.search));
      if (screen.chips) body.appendChild(buildChips(screen.chips));
      body.appendChild(buildCards(screen.cards));
      if (screen.section) body.appendChild(buildSection(screen.section));
    } else if (screen.type === "detail") {
      const hero = makeEl("div", "pv-hero");
      hero.appendChild(makeEl("span", "", screen.hero || "→"));
      const badges = makeEl("div", "pv-badges");
      (screen.badges || []).forEach((badge) => badges.appendChild(makeEl("span", "pv-badge", badge)));
      const lines = makeEl("div", "pv-block");
      (screen.lines || []).forEach((width) => {
        const line = makeEl("div", "pv-line");
        line.style.width = `${width}%`;
        lines.appendChild(line);
      });
      body.append(hero, makeEl("div", "pv-title", screen.title), makeEl("div", "pv-sub", screen.sub), badges, lines, makeEl("div", "pv-cta", screen.cta || "Open"));
    } else if (screen.type === "cart" || screen.type === "order") {
      if (screen.type === "order" && screen.steps) {
        const steps = makeEl("div", "pv-order");
        screen.steps.forEach(([label, state]) => {
          const step = makeEl("div", `pv-step${state ? ` ${state}` : ""}`);
          step.append(makeEl("i"), makeEl("span", "", label));
          steps.appendChild(step);
        });
        body.appendChild(steps);
      }
      const rows = (screen.rows || []).map(([title, sub, meta]) => ["•", title, sub, meta]);
      body.appendChild(buildRows(rows));
      if (screen.total) {
        const total = makeEl("div", "pv-total");
        total.append(makeEl("span", "", "Total"), makeEl("b", "", screen.total));
        body.appendChild(total);
      }
      body.appendChild(makeEl("div", "pv-cta", screen.cta || "Continue"));
    } else if (screen.type === "map") {
      const map = makeEl("div", "pv-map");
      map.innerHTML =
        '<svg viewBox="0 0 220 140" preserveAspectRatio="none"><path d="M20 120 C60 90 70 40 110 55 S170 110 200 30" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="4 4"/><circle cx="20" cy="120" r="4" fill="currentColor"/><circle cx="110" cy="55" r="4" fill="currentColor"/><circle cx="200" cy="30" r="4" fill="currentColor"/></svg>';
      body.append(map, buildRows(screen.rows));
    } else if (screen.type === "lesson") {
      const video = makeEl("div", "pv-video");
      video.appendChild(makeEl("span", "", "▶"));
      const progress = makeEl("div", "pv-progress");
      const fill = makeEl("i");
      fill.style.width = `${screen.progress || 0}%`;
      progress.appendChild(fill);
      body.append(video, progress, buildRows(screen.rows));
    } else if (screen.type === "states") {
      const list = makeEl("div", "pv-list");
      (screen.states || []).forEach(([icon, title, sub]) => {
        const state = makeEl("div", "pv-state");
        const main = makeEl("div");
        main.append(makeEl("div", "pv-state__title", title), makeEl("div", "pv-state__sub", sub));
        state.append(makeEl("span", "pv-state__icon", icon), main);
        list.appendChild(state);
      });
      body.appendChild(list);
    } else {
      body.appendChild(buildRows(screen.rows));
    }

    const activeNav = Number.isInteger(screen.nav) ? screen.nav : navIndexByType[screen.type] || 0;
    target.append(body, buildNav(project.nav, activeNav), makeEl("div", "pv-homebar"));
  };

  const hoverFine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  document.querySelectorAll("[data-project-card]").forEach((visual) => {
    const project = projectPreviews[visual.dataset.projectCard];
    const screenEl = visual.querySelector("[data-card-screen]");
    const dotsEl = visual.querySelector("[data-card-dots]");
    if (!project || !screenEl) return;
    let index = 0;
    let timer = null;

    const show = (next) => {
      index = (next + project.screens.length) % project.screens.length;
      renderProjectScreen(screenEl, project, project.screens[index]);
      if (!dotsEl) return;
      dotsEl.innerHTML = "";
      project.screens.forEach((_, dotIndex) => {
        const dot = document.createElement("i");
        dot.classList.toggle("active", dotIndex === index);
        dotsEl.appendChild(dot);
      });
    };

    const start = () => {
      if (timer || !hoverFine) return;
      timer = window.setInterval(() => show(index + 1), 2600);
    };
    const stop = () => {
      window.clearInterval(timer);
      timer = null;
    };

    show(0);
    visual.addEventListener("mouseenter", start);
    visual.addEventListener("mouseleave", stop);
    visual.addEventListener("focusin", start);
    visual.addEventListener("focusout", stop);
  });

  const preview = document.getElementById("projectPreview");
  const previewScreen = document.getElementById("previewScreen");
  const previewDots = document.getElementById("previewDots");
  const previewTabs = document.getElementById("previewTabs");
  const previewTag = document.getElementById("previewTag");
  const previewTitle = document.getElementById("previewTitle");
  const previewSub = document.getElementById("previewSub");
  const previewDesc = document.getElementById("previewDesc");
  const previewTech = document.getElementById("previewTech");
  const previewLink = document.getElementById("previewLink");
  const previewClose = document.getElementById("previewClose");
  let previewKey = null;
  let previewIndex = 0;
  let previewTrigger = null;
  let previousOverflow = "";

  const syncPreviewControls = () => {
    [...(previewTabs?.children || [])].forEach((tab, index) => {
      tab.classList.toggle("active", index === previewIndex);
      tab.setAttribute("aria-selected", String(index === previewIndex));
    });
    [...(previewDots?.children || [])].forEach((dot, index) => dot.classList.toggle("active", index === previewIndex));
  };

  const showPreviewScreen = (index) => {
    const project = projectPreviews[previewKey];
    if (!project) return;
    previewIndex = (index + project.screens.length) % project.screens.length;
    renderProjectScreen(previewScreen, project, project.screens[previewIndex]);
    syncPreviewControls();
  };

  const openPreview = (key, trigger) => {
    const project = projectPreviews[key];
    if (!project || !preview) return;
    previewKey = key;
    previewIndex = 0;
    previewTrigger = trigger || document.activeElement;
    if (previewTag) previewTag.textContent = project.tag;
    if (previewTitle) previewTitle.textContent = project.title;
    if (previewSub) previewSub.textContent = project.sub;
    if (previewDesc) previewDesc.textContent = project.desc;
    if (previewTech) {
      previewTech.innerHTML = "";
      project.tech.forEach((tech) => previewTech.appendChild(makeEl("span", "", tech)));
    }
    if (previewLink) {
      previewLink.hidden = !project.link;
      if (project.link) previewLink.href = project.link;
    }
    if (previewTabs) {
      previewTabs.innerHTML = "";
      project.screens.forEach((screen, index) => {
        const tab = makeEl("button", "", screen.label);
        tab.type = "button";
        tab.setAttribute("role", "tab");
        tab.setAttribute("aria-selected", String(index === 0));
        tab.addEventListener("click", () => showPreviewScreen(index));
        previewTabs.appendChild(tab);
      });
    }
    if (previewDots) {
      previewDots.innerHTML = "";
      project.screens.forEach((screen, index) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", `Show ${screen.label} screen`);
        dot.addEventListener("click", () => showPreviewScreen(index));
        previewDots.appendChild(dot);
      });
    }
    showPreviewScreen(0);
    preview.classList.add("open");
    preview.setAttribute("aria-hidden", "false");
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setTimeout(() => previewClose?.focus(), 80);
  };

  const closePreview = () => {
    if (!preview) return;
    preview.classList.remove("open");
    preview.setAttribute("aria-hidden", "true");
    document.body.style.overflow = previousOverflow;
    previewTrigger?.focus();
  };

  document.querySelectorAll("[data-preview]").forEach((button) => {
    button.addEventListener("click", () => openPreview(button.dataset.preview, button));
  });
  preview?.addEventListener("click", (event) => {
    if (event.target.closest("[data-preview-close], #previewClose")) closePreview();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && preview?.classList.contains("open")) closePreview();
  });
  preview?.addEventListener("keydown", (event) => {
    if (event.key !== "Tab" || !preview.classList.contains("open")) return;
    const focusable = [...preview.querySelectorAll("button, a[href]")].filter((node) => node.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  /* ---------- Contact form ---------- */
  const form = document.getElementById("contactForm");
  const note = document.getElementById("formNote");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const nameEl = form.querySelector("#name");
    const emailEl = form.querySelector("#email");
    const messageEl = form.querySelector("#message");
    const name = nameEl.value.trim();
    const email = emailEl.value.trim();
    const message = messageEl.value.trim();
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!name || !validEmail || message.length < 8) {
      note.textContent = "Please fill your name, a valid email and a short message.";
      note.classList.add("err");
      return;
    }
    note.classList.remove("err");
    note.textContent = "Opening your email app...";

    const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name}\n${email}`);
    window.location.href = `mailto:thakurviveksingh1007@gmail.com?subject=${subject}&body=${body}`;
    form.reset();
    setTimeout(() => (note.textContent = "Thanks! Your email draft is ready to send."), 900);
  });
})();
