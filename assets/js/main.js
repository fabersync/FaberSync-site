/* FaberSync — interacțiuni site */

// Pentru automatizare viitoare: pune aici URL-ul webhook-ului (Make, n8n, Zapier etc.).
// Cât timp e gol, formularul deschide clientul de email cu mesajul precompletat.
const FORM_WEBHOOK_URL = "";
const CONTACT_EMAIL = "contact@fabersync.com";

(function () {
  const header = document.querySelector(".site-header");
  const onScroll = () => header && header.classList.toggle("scrolled", window.scrollY > 20);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Meniu mobil
  const toggle = document.querySelector(".menu-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const open = document.body.classList.toggle("menu-open");
      toggle.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });
  }

  // Animații la scroll
  const items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add("in"));
  }

  // Anul curent în footer
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  // Hero: cardul de lead se schimbă periodic, ca o notificare în timp real
  const lead = document.querySelector(".hv-lead");
  if (lead && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const leads = [
      ["Andrei Marin", "Cerere ofertă · Site de prezentare"],
      ["Ioana Popescu", "Cerere ofertă · Magazin online"],
      ["Mihai Dobre", "Consultanță · Automatizare AI"],
      ["Elena Stan", "Cerere ofertă · Landing page"],
    ];
    const nameEl = lead.querySelector("[data-lead-name]");
    const needEl = lead.querySelector("[data-lead-need]");
    let i = 0;
    setInterval(() => {
      if (document.hidden) return;
      lead.classList.add("swap");
      lead.classList.remove("pop");
      setTimeout(() => {
        i = (i + 1) % leads.length;
        nameEl.textContent = leads[i][0];
        needEl.textContent = leads[i][1];
        lead.classList.remove("swap");
        void lead.offsetWidth;
        lead.classList.add("pop");
      }, 380);
    }, 4500);
  }

  // Filtre proiecte
  const filterBtns = document.querySelectorAll(".filter-btn");
  const projects = document.querySelectorAll(".projects-grid .project");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const f = btn.dataset.filter;
      projects.forEach((p) => {
        const show = f === "toate" || (p.dataset.cat || "").split(" ").includes(f);
        p.classList.toggle("hidden", !show);
      });
    });
  });

  // Formular contact
  const form = document.querySelector("#contact-form");
  if (form) {
    const status = form.querySelector(".form-status");
    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      if (!form.reportValidity()) return;
      const data = Object.fromEntries(new FormData(form).entries());

      if (FORM_WEBHOOK_URL) {
        try {
          const res = await fetch(FORM_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...data, sursa: "fabersync.com", data_trimiterii: new Date().toISOString() }),
          });
          if (!res.ok) throw new Error(res.status);
          status.textContent = "Mulțumim! Am primit mesajul și revenim în maxim 24 de ore.";
          status.classList.add("show");
          form.reset();
        } catch (err) {
          status.textContent = "A apărut o eroare. Scrie-ne direct la " + CONTACT_EMAIL + ".";
          status.style.color = "#ff8a8a";
          status.classList.add("show");
        }
        return;
      }

      const subject = `Proiect nou — ${data.nume || ""}${data.firma ? " (" + data.firma + ")" : ""}`;
      const body = [
        `Nume: ${data.nume || ""}`,
        `Firmă: ${data.firma || "-"}`,
        `Email: ${data.email || ""}`,
        `Telefon: ${data.telefon || "-"}`,
        `Serviciu: ${data.serviciu || "-"}`,
        `Buget: ${data.buget || "-"}`,
        "",
        data.mesaj || "",
      ].join("\n");
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      status.textContent = "Se deschide aplicația de email cu mesajul tău precompletat.";
      status.classList.add("show");
    });
  }
})();
