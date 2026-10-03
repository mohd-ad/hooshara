(() => {
  const persianDigits = value => String(value).replace(/[0-9]/g, digit => "۰۱۲۳۴۵۶۷۸۹"[digit]);
  const latinDigits = value => String(value).replace(/[۰-۹٠-٩]/g, digit => "۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩".indexOf(digit) < 10 ? "۰۱۲۳۴۵۶۷۸۹".indexOf(digit) : "۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩".indexOf(digit) - 10);
  const mod = (a, b) => a - Math.floor(a / b) * b;

  function jalaliCalendar(jy) {
    const breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];
    let jp = breaks[0], jump, jm, leapJ = -14, n, i;
    if (jy < jp || jy >= breaks[breaks.length - 1]) return { leap: 0, gy: jy + 621, march: 20 };
    for (i = 1; i < breaks.length; i += 1) { jm = breaks[i]; jump = jm - jp; if (jy < jm) break; leapJ += Math.floor(jump / 33) * 8 + Math.floor(mod(jump, 33) / 4); jp = jm; }
    n = jy - jp; leapJ += Math.floor(n / 33) * 8 + Math.floor((mod(n, 33) + 3) / 4);
    if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1;
    const leapG = Math.floor((jy + 621) / 4) - Math.floor((Math.floor((jy + 621) / 100) + 1) * 3 / 4) - 150;
    const march = 20 + leapJ - leapG;
    if (jump - n < 6) n = n - jump + Math.floor((jump + 4) / 33) * 33;
    let leap = mod(mod(n + 1, 33) - 1, 4); if (leap === -1) leap = 4;
    return { leap, gy: jy + 621, march };
  }

  function toGregorian(jy, jm, jd) {
    const cal = jalaliCalendar(jy);
    // Use the well-known Julian day conversion for reliable Gregorian output.
    const jdn = 1948320 + (jy - 1) * 365 + Math.floor((jy - 1) / 33) * 8 + Math.floor((mod(jy - 1, 33) + 3) / 4) + (jm <= 7 ? (jm - 1) * 31 : 186 + (jm - 7) * 30) + jd - 1;
    const j = jdn + 32044, g = Math.floor(j / 146097), dg = mod(j, 146097);
    const c = Math.floor((Math.floor(dg / 36524) + 1) * 3 / 4), dc = dg - c * 36524;
    const b = Math.floor(dc / 1461), db = mod(dc, 1461);
    const a = Math.floor((Math.floor(db / 365) + 1) * 3 / 4), da = db - a * 365;
    const y = g * 400 + c * 100 + b * 4 + a;
    const m = Math.floor((da * 5 + 308) / 153) - 2;
    const d = da - Math.floor((m + 4) * 153 / 5) + 122;
    const year = y - 4800 + Math.floor((m + 2) / 12);
    return new Date(Date.UTC(year, mod(m + 2, 12), d));
  }

  function fromGregorian(date) {
    const gy = date.getUTCFullYear(), gm = date.getUTCMonth() + 1, gd = date.getUTCDate();
    const gdm = [0,31,((gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0) ? 29 : 28,31,30,31,30,31,31,30,31,30,31];
    let jy = gy - 621, r = jalaliCalendar(jy), jdn = Math.floor(Date.UTC(gy, gm - 1, gd) / 86400000) + 2440588;
    const marchJdn = Math.floor(Date.UTC(r.gy, 2, r.march) / 86400000) + 2440588;
    let k = jdn - marchJdn;
    if (k >= 0) { if (k <= 185) return { jy, jm: 1 + Math.floor(k / 31), jd: mod(k, 31) + 1 }; k -= 186; }
    else { jy -= 1; k += 179; if (r.leap === 1) k += 1; }
    return { jy, jm: 7 + Math.floor(k / 30), jd: mod(k, 30) + 1 };
  }

  const monthNames = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
  const weekdayNames = ["ش", "ی", "د", "س", "چ", "پ", "ج"];
  const localNow = new Date();
  const today = fromGregorian(new Date(Date.UTC(localNow.getFullYear(), localNow.getMonth(), localNow.getDate())));

  function parseValue(value) {
    const parts = latinDigits(value).match(/(\d{3,4})\s*[\/.-]\s*(\d{1,2})\s*[\/.-]\s*(\d{1,2})/);
    if (!parts) return null;
    let y = Number(parts[1]), m = Number(parts[2]), d = Number(parts[3]);
    if (y > 1600) { const converted = fromGregorian(new Date(Date.UTC(y, m - 1, d))); y = converted.jy; m = converted.jm; d = converted.jd; }
    return m >= 1 && m <= 12 && d >= 1 && d <= (m <= 6 ? 31 : m === 12 && jalaliCalendar(y).leap === 0 ? 30 : m === 12 ? 29 : 30) ? { jy: y, jm: m, jd: d } : null;
  }

  document.querySelectorAll('input[data-persian-date], input[name="birthDate"]').forEach((input, index) => {
    input.setAttribute("autocomplete", "off");
    input.setAttribute("inputmode", "none");
    input.setAttribute("aria-haspopup", "dialog");
    input.setAttribute("aria-expanded", "false");
    const picker = document.createElement("div");
    picker.className = "persian-date-picker";
    picker.id = `persianDatePicker${index + 1}`;
    picker.setAttribute("role", "dialog");
    picker.setAttribute("aria-label", "انتخاب تاریخ شمسی");
    picker.hidden = true;
    picker.innerHTML = '<div class="pdp-header"><button type="button" class="pdp-nav pdp-prev" aria-label="ماه قبل">‹</button><div class="pdp-heading"><button type="button" class="pdp-month" aria-label="انتخاب ماه"></button><button type="button" class="pdp-year" aria-label="انتخاب سال"></button></div><button type="button" class="pdp-nav pdp-next" aria-label="ماه بعد">›</button></div><div class="pdp-months" hidden></div><div class="pdp-years" hidden></div><div class="pdp-calendar"><div class="pdp-weekdays"></div><div class="pdp-days" role="grid"></div></div><div class="pdp-footer"><button type="button" class="pdp-today">امروز</button><span>تقویم شمسی</span></div>';
    document.body.append(picker);
    input.setAttribute("aria-controls", picker.id);
    let view = parseValue(input.value) || { ...today }, selected = parseValue(input.value), suppressFocusOpen = false;

    function render() {
      picker.querySelector(".pdp-calendar").hidden = false;
      picker.querySelector(".pdp-months").hidden = true;
      picker.querySelector(".pdp-years").hidden = true;
      picker.querySelector(".pdp-month").textContent = monthNames[view.jm - 1];
      picker.querySelector(".pdp-year").textContent = persianDigits(view.jy);
      picker.querySelector(".pdp-weekdays").innerHTML = weekdayNames.map(day => `<span>${day}</span>`).join("");
      const first = toGregorian(view.jy, view.jm, 1), offset = (first.getUTCDay() + 1) % 7;
      const daysInMonth = view.jm <= 6 ? 31 : view.jm <= 11 ? 30 : jalaliCalendar(view.jy).leap === 0 ? 30 : 29;
      const cells = [];
      for (let i = 0; i < offset; i += 1) cells.push('<span class="pdp-empty" aria-hidden="true"></span>');
      for (let day = 1; day <= daysInMonth; day += 1) {
        const isSelected = selected && selected.jy === view.jy && selected.jm === view.jm && selected.jd === day;
        const isToday = today.jy === view.jy && today.jm === view.jm && today.jd === day;
        cells.push(`<button type="button" role="gridcell" class="pdp-day${isSelected ? " is-selected" : ""}${isToday ? " is-today" : ""}" data-day="${day}" aria-label="${persianDigits(day)} ${monthNames[view.jm - 1]} ${persianDigits(view.jy)}"${isToday ? ' aria-current="date"' : ""}>${persianDigits(day)}</button>`);
      }
      picker.querySelector(".pdp-days").innerHTML = cells.join("");
    }
    function moveMonth(amount) { let month = view.jm + amount, year = view.jy; if (month < 1) { month = 12; year -= 1; } if (month > 12) { month = 1; year += 1; } view = { jy: year, jm: month, jd: 1 }; render(); }
    function showMonths() {
      picker.querySelector(".pdp-calendar").hidden = true;
      picker.querySelector(".pdp-years").hidden = true;
      const list = picker.querySelector(".pdp-months");
      list.innerHTML = monthNames.map((name, i) => `<button type="button" class="pdp-option${view.jm === i + 1 ? " is-current" : ""}" data-month="${i + 1}">${name}</button>`).join("");
      list.hidden = false;
    }
    function showYears() {
      picker.querySelector(".pdp-calendar").hidden = true;
      picker.querySelector(".pdp-months").hidden = true;
      const list = picker.querySelector(".pdp-years");
      const years = Array.from({ length: 121 }, (_, i) => today.jy - i);
      if (!years.includes(view.jy)) years.push(view.jy);
      list.innerHTML = years.sort((a, b) => b - a).map(year => `<button type="button" class="pdp-option${view.jy === year ? " is-current" : ""}" data-year="${year}">${persianDigits(year)}</button>`).join("");
      list.hidden = false;
      list.querySelector(".is-current")?.scrollIntoView({ block: "center" });
    }
    function position() { const rect = input.getBoundingClientRect(); picker.style.top = `${Math.min(rect.bottom + 8, innerHeight - picker.offsetHeight - 12)}px`; picker.style.left = `${Math.max(12, Math.min(rect.left, innerWidth - picker.offsetWidth - 12))}px`; }
    function open() { document.querySelectorAll(".persian-date-picker:not([hidden])").forEach(other => { if (other !== picker) other.hidden = true; }); view = parseValue(input.value) || { ...today }; selected = parseValue(input.value); render(); picker.hidden = false; input.setAttribute("aria-expanded", "true"); position(); }
    function close() { picker.hidden = true; input.setAttribute("aria-expanded", "false"); }
    input.addEventListener("click", open);
    input.addEventListener("focus", () => { if (!suppressFocusOpen) open(); });
    input.addEventListener("keydown", event => { if (event.key === "Escape") close(); if (event.key === "ArrowDown" && picker.hidden) open(); });
    picker.querySelector(".pdp-prev").addEventListener("click", () => moveMonth(-1));
    picker.querySelector(".pdp-next").addEventListener("click", () => moveMonth(1));
    picker.querySelector(".pdp-month").addEventListener("click", showMonths);
    picker.querySelector(".pdp-year").addEventListener("click", showYears);
    picker.querySelector(".pdp-today").addEventListener("click", () => choose(today));
    picker.addEventListener("click", event => {
      const dayButton = event.target.closest(".pdp-day");
      const monthButton = event.target.closest(".pdp-option[data-month]");
      const yearButton = event.target.closest(".pdp-option[data-year]");
      if (dayButton) choose({ ...view, jd: Number(dayButton.dataset.day) });
      if (monthButton) { view.jm = Number(monthButton.dataset.month); render(); }
      if (yearButton) { view.jy = Number(yearButton.dataset.year); render(); }
    });
    function choose(date) { input.value = `${persianDigits(date.jy)}/${persianDigits(String(date.jm).padStart(2, "0"))}/${persianDigits(String(date.jd).padStart(2, "0"))}`; selected = { ...date }; input.dispatchEvent(new Event("input", { bubbles: true })); input.dispatchEvent(new Event("change", { bubbles: true })); close(); suppressFocusOpen = true; input.focus(); suppressFocusOpen = false; }
    document.addEventListener("pointerdown", event => { if (!picker.contains(event.target) && event.target !== input) close(); });
    document.addEventListener("keydown", event => { if (event.key === "Escape") close(); });
    window.addEventListener("resize", () => { if (!picker.hidden) position(); });
    window.addEventListener("scroll", () => { if (!picker.hidden) position(); }, true);
  });
})();
