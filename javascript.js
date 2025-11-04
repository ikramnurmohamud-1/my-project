/* ===== Ikraam Beauty Salon - javascript.js ===== */

/* Footer year */
(function(){
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();

/* Auto set active nav link */
(function(){
  var path = (location.pathname.split("/").pop() || "home.html").toLowerCase();
  var links = document.querySelectorAll("nav ul li a");
  for (var i = 0; i < links.length; i++) {
    var href = (links[i].getAttribute("href") || "").toLowerCase();
    if (href === path) links[i].classList.add("active");
  }
})();

/* Wire CTAs (buttons) to register if needed */
(function(){
  var ctas = document.querySelectorAll(".book-btn, .price-btn");
  for (var i = 0; i < ctas.length; i++) {
    if (ctas[i].tagName === "BUTTON") {
      ctas[i].addEventListener("click", function(){
        location.href = "register.html";
      });
    }
  }
})();

/* Lazy-load images */
(function(){
  var imgs = document.querySelectorAll("img");
  for (var i = 0; i < imgs.length; i++) {
    if (!imgs[i].getAttribute("loading")) imgs[i].setAttribute("loading", "lazy");
  }
})();

/* ===== Simple Gallery (Services + Prices) ===== */
/* (Haddii aadan isticmaalin gallery, qaybtaan way iska shaqaynaysaa — isla sidii code-kaagii hore) */
(function(){
  var triggers = document.querySelectorAll("[data-gallery-id]");
  var modal = document.getElementById("galleryModal");
  if (!triggers.length || !modal) return;

  var imgEl = document.getElementById("modalImage");
  var titleEl = document.getElementById("modalTitle");
  var subtitleEl = document.getElementById("modalSubtitle");
  var captionEl = document.getElementById("modalCaption");
  var priceEl = document.getElementById("modalPrice");
  var thumbsEl = document.getElementById("modalThumbs");
  var prevBtn = document.getElementById("prevBtn");
  var nextBtn = document.getElementById("nextBtn");

  var state = { list: [], idx: 0, title: "" };

  function render() {
    if (!state.list.length) return;
    var item = state.list[state.idx];
    imgEl.src = item.src;
    imgEl.alt = item.caption || state.title || "Gallery";
    captionEl.textContent = item.caption || "";
    priceEl.textContent = item.price ? ("Price: " + item.price) : "";
    subtitleEl.textContent = state.title || "";

    thumbsEl.innerHTML = "";
    for (var i = 0; i < state.list.length; i++) {
      var b = document.createElement("button");
      if (i === state.idx) b.className = "active";
      var ti = document.createElement("img");
      ti.src = state.list[i].src;
      ti.alt = state.list[i].caption || ("item " + (i + 1));
      b.appendChild(ti);
      (function(n){ b.addEventListener("click", function(){ state.idx = n; render(); });})(i);
      thumbsEl.appendChild(b);
    }
  }

  function open(id){
    var data = galleryData[id];
    if (!data || !data.items || !data.items.length) return;
    state.list = data.items.slice();
    state.idx = 0;
    state.title = data.title || "";
    titleEl.textContent = "Welcome Madam/Sir";
    render();
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function close(){ modal.hidden = true; document.body.style.overflow = ""; }

  prevBtn && prevBtn.addEventListener("click", function(){
    if (!state.list.length) return;
    state.idx = (state.idx - 1 + state.list.length) % state.list.length;
    render();
  });
  nextBtn && nextBtn.addEventListener("click", function(){
    if (!state.list.length) return;
    state.idx = (state.idx + 1) % state.list.length;
    render();
  });
  modal && modal.addEventListener("click", function(e){
    if (e.target.hasAttribute("data-close-modal")) close();
  });
  document.addEventListener("keydown", function(e){
    if (!modal || modal.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") prevBtn.click();
    if (e.key === "ArrowRight") nextBtn.click();
  });

  for (var i = 0; i < triggers.length; i++) {
    (function(el){
      el.style.cursor = "pointer";
      el.addEventListener("click", function(){ open(el.getAttribute("data-gallery-id")); });
    })(triggers[i]);
  }
})();

/* ===== Registration (NO redirect; error-ka waa baxaa) ===== */
/* — Stores every booking to localStorage array: "ikraam_bookings"
   — Shows success card
   — Refreshes the public list (table below the form) */
(function(){
  var form = document.getElementById("registerForm");
  if (!form) return;

  var box = document.getElementById("register-success");
  var nameEl = document.getElementById("name");
  var phoneEl = document.getElementById("phone");
  var serviceEl = document.getElementById("service");
  var dateEl = document.getElementById("date");

  var bkName = document.getElementById("bkName");
  var bkService = document.getElementById("bkService");
  var bkPrice = document.getElementById("bkPrice");
  var bkDate = document.getElementById("bkDate");

  // Somalia phone: +252 61 1234567, 061234567, 612345678, iwm
  var soPhone = /^\+?252\s?\d{2}\s?\d{6,7}$|^0?\d{8,9}$/;

  form.addEventListener("submit", function(e){
    e.preventDefault();
    var name = nameEl.value.trim();
    var phone = phoneEl.value.trim();
    var service = serviceEl.value.trim();
    var date = dateEl.value;

    if (!name){ alert("Please enter your name."); return; }
    if (!soPhone.test(phone)){ alert("Please enter a valid phone (e.g., +252 61 1234567)."); return; }
    if (!service){ alert("Please enter the requested service."); return; }

    var price = lookupPrice(service) || "—";

    // 1) Save to array storage
    var all = getBookings();
    var booking = {
      id: Date.now(),               // simple unique id
      name: name,
      phone: phone,
      service: service,
      price: price,
      date: date || "—"
    };
    all.push(booking);
    setBookings(all);

    // 2) Show success (latest booking)
    bkName.textContent = booking.name;
    bkService.textContent = booking.service;
    bkPrice.textContent = booking.price;
    bkDate.textContent = booking.date;
    box.style.display = "block";

    // 3) Reset form & refresh table
    form.reset();
    nameEl.focus();
    renderBookingTable();
  });

  // New booking button
  var nb = document.getElementById("newBooking");
  if (nb) nb.addEventListener("click", function(){
    box.style.display = "none";
    nameEl.focus();
  });

  // Helpers for storage
  function getBookings(){
    try { return JSON.parse(localStorage.getItem("ikraam_bookings")||"[]"); }
    catch(e){ return []; }
  }
  function setBookings(arr){
    localStorage.setItem("ikraam_bookings", JSON.stringify(arr));
  }

  // Price lookup (adigii hore)
  function lookupPrice(svc){
    var key = svc.toLowerCase().trim();
    key = key.replace("cilaan gacmaha","henna hands")
             .replace("cilaan lugaha","henna legs")
             .replace("aroos makeup","bridal makeup")
             .replace("xaflad makeup","party makeup")
             .replace("timo hagaajin","hair styling")
             .replace("timo jarid","hair cutting")
             .replace("waji dhaqis","facial");
    var map = {
      "henna hands":"$5",
      "henna legs":"$5",
      "bridal makeup":"$20-60",
      "party makeup":"$15-40",
      "hair styling":"$12-80",
      "hair cutting":"$10-30",
      "facial":"$15-50",
      "massage":"$10-150"
    };
    if (map[key]) return map[key];
    for (var k in map){ if (key.indexOf(k) > -1) return map[k]; }
    return "";
  }

  /* ===== Public booking list (table) ===== */
  var table = document.getElementById("bookingTable");
  var countEl = document.getElementById("bookingCount");
  var clearBtn = document.getElementById("clearBookings");
  var exportBtn = document.getElementById("exportBookings");

  function renderBookingTable(){
    if (!table) return;
    var tbody = table.querySelector("tbody");
    tbody.innerHTML = "";
    var data = getBookings();
    countEl && (countEl.textContent = data.length);

    data.forEach(function(bk, idx){
      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td>"+ (idx+1) +"</td>"+
        "<td>"+ escapeHtml(bk.name) +"</td>"+
        "<td>"+ escapeHtml(bk.phone||"") +"</td>"+
        "<td>"+ escapeHtml(bk.service) +"</td>"+
        "<td>"+ escapeHtml(bk.price||"—") +"</td>"+
        "<td>"+ escapeHtml(bk.date||"—") +"</td>"+
        '<td><button class="btn btn-outline" data-del="'+bk.id+'">Delete</button></td>';
      tbody.appendChild(tr);
    });

    // wire delete buttons
    tbody.querySelectorAll("[data-del]").forEach(function(btn){
      btn.addEventListener("click", function(){
        var id = +btn.getAttribute("data-del");
        var all = getBookings().filter(function(x){ return x.id !== id; });
        setBookings(all);
        renderBookingTable();
      });
    });
  }

  function escapeHtml(s){
    return (s||"").replace(/[&<>"']/g, function(c){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];
    });
  }

  clearBtn && clearBtn.addEventListener("click", function(){
    if (confirm("Delete ALL bookings?")) {
      localStorage.removeItem("ikraam_bookings");
      renderBookingTable();
    }
  });

  exportBtn && exportBtn.addEventListener("click", function(){
    var blob = new Blob([JSON.stringify(getBookings(), null, 2)], {type:"application/json"});
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = "ikraam_bookings.json"; a.click();
    URL.revokeObjectURL(url);
  });

  // render once on load
  renderBookingTable();
})();

/* ===== GALLERY DATA (Services + Prices) ===== */
/* Ku sii hay sidaad hore u haysay – waxaan hoos ku reebay isla xogtii aad dirtay */
var galleryData = {
  /* 🌸 HENNA */
  "henna-hands":{ title:"Henna (Hands)", items:[
    {src:"images/WhatsApp Image 2025-10-09 at 13.11.43.jpeg", caption:"Henna Hands - A"},
    {src:"images/WhatsApp Image 2025-10-09 at 13.11.44.jpeg", caption:"Henna Hands - B"}
  ]},
  "henna-legs":{ title:"Henna (Legs)", items:[
    {src:"images/white-bowl-with-turmeric-paste-stands-beneath-indian-bride.jpg", caption:"Henna Legs - A"}
  ]},

  /* 💄 MAKEUP */
  "makeup-bridal":{ title:"Bridal Makeup", items:[
    {src:"images/WhatsApp Image 2025-10-09 at 13.11.45.jpeg", caption:"Bridal - 1"},
    {src:"images/WhatsApp Image 2025-10-09 at 13.11.51.jpeg", caption:"Bridal - 2"},
    {src:"images/WhatsApp Image 2025-10-09 at 13.11.50.jpeg", caption:"Bridal - 3"}
  ]},
  "makeup-party":{ title:"Party Makeup", items:[
    {src:"images/WhatsApp Image 2025-10-09 at 13.11.52.jpeg", caption:"Party - 1"},
    {src:"images/WhatsApp Image 2025-10-09 at 13.11.44 (1).jpeg", caption:"Party - 2"}
  ]},
  "makeup-casual":{ title:"Casual Makeup", items:[
    {src:"images/WhatsApp Image 2025-10-09 at 13.11.49.jpeg", caption:"Casual - 1"},
    {src:"images/pexels-paduret-1377034.jpg", caption:"Casual - 2"},
    {src:"images/WhatsApp Image 2025-10-09 at 13.11.48.jpeg", caption:"Casual - 3"}
  ]},

  /* 💇 HAIR */
  "hair-style":{ title:"Hair Styling", items:[
    {src:"images/pexels-pixabay-355063.jpg", caption:"Styling - 1"},
    {src:"images/WhatsApp Image 2025-10-09 at 13.11.52 (1).jpeg", caption:"Styling - 2"},
    {src:"images/WhatsApp Image 2025-10-09 at 13.11.53.jpeg", caption:"Styling - 3"},
    {src:"images/WhatsApp Image 2025-10-09 at 13.11.54.jpeg", caption:"Styling - 4"}
  ]},
  "hair-cut":{ title:"Hair Cutting", items:[
    {src:"images/WhatsApp Image 2025-10-09 at 13.11.58.jpeg", caption:"Cut - 1"},
    {src:"images/WhatsApp Image 2025-10-09 at 13.11.59.jpeg", caption:"Cut - 2"},
    {src:"images/WhatsApp Image 2025-10-09 at 13.12.00 (1).jpeg", caption:"Cut - 3"}
  ]},
  "hair-dry":{ title:"Hair Drying", items:[
    {src:"images/WhatsApp Image 2025-10-09 at 13.11.55.jpeg", caption:"Drying - 1"},
    {src:"images/WhatsApp Image 2025-10-09 at 13.11.56.jpeg", caption:"Drying - 2"},
    {src:"images/WhatsApp Image 2025-10-09 at 13.11.56 (1).jpeg", caption:"Drying - 3"}
  ]},

  /* 🧖 SKIN */
  "skin-massage":{ title:"Massage", items:[
    {src:"images/WhatsApp Image 2025-10-09 at 13.12.02.jpeg", caption:"Massage - 1"},
    {src:"images/WhatsApp Image 2025-10-09 at 13.12.01.jpeg", caption:"Massage - 2"}
  ]},
  "skin-facial":{ title:"Facial", items:[
    {src:"images/pexels-anete-lusina-5240820.jpg", caption:"Facial - 1"},
    {src:"images/pexels-anntarazevich-5308660.jpg", caption:"Facial - 2"},
    {src:"images/pexels-cottonbro-4004122.jpg", caption:"Facial - 3"}
  ]},

  /* ===== PRICES (same galleries with prices) ===== */
  "price-henna-hands":{ title:"Henna (Hands) – Price", items:[
    {src:"images/WhatsApp Image 2025-10-09 at 13.11.43.jpeg", caption:"Hands - A", price:"$5"},
    {src:"images/WhatsApp Image 2025-10-09 at 13.11.44.jpeg", caption:"Hands - B", price:"$5"}
  ]},
  "price-henna-legs":{ title:"Henna (Legs) – Price", items:[
    {src:"images/white-bowl-with-turmeric-paste-stands-beneath-indian-bride.jpg", caption:"Legs - A", price:"$5"}
  ]},
  "price-makeup-bridal":{ title:"Bridal Makeup – Price", items:[
    {src:"images/WhatsApp Image 2025-10-09 at 13.11.45.jpeg", caption:"Bridal - 1", price:"$20-60"},
    {src:"images/WhatsApp Image 2025-10-09 at 13.11.51.jpeg", caption:"Bridal - 2", price:"$20-60"},
    {src:"images/WhatsApp Image 2025-10-09 at 13.11.50.jpeg", caption:"Bridal - 3", price:"$20-60"}
  ]},
  "price-makeup-party":{ title:"Party Makeup – Price", items:[
    {src:"images/WhatsApp Image 2025-10-09 at 13.11.52.jpeg", caption:"Party - 1", price:"$15-40"},
    {src:"images/WhatsApp Image 2025-10-09 at 13.11.44 (1).jpeg", caption:"Party - 2", price:"$15-40"}
  ]},
  "price-hair-style":{ title:"Hair Styling – Price", items:[
    {src:"images/pexels-pixabay-355063.jpg", caption:"Styling - 1", price:"$12-80"},
    {src:"images/WhatsApp Image 2025-10-09 at 13.11.52 (1).jpeg", caption:"Styling - 2", price:"$12-80"},
    {src:"images/WhatsApp Image 2025-10-09 at 13.11.53.jpeg", caption:"Styling - 3", price:"$12-80"},
    {src:"images/WhatsApp Image 2025-10-09 at 13.11.54.jpeg", caption:"Styling - 4", price:"$12-80"}
  ]},
  "price-hair-cut":{ title:"Hair Cutting – Price", items:[
    {src:"images/WhatsApp Image 2025-10-09 at 13.11.58.jpeg", caption:"Cut - 1", price:"$10-30"},
    {src:"images/WhatsApp Image 2025-10-09 at 13.11.59.jpeg", caption:"Cut - 2", price:"$10-30"},
    {src:"images/WhatsApp Image 2025-10-09 at 13.12.00 (1).jpeg", caption:"Cut - 3", price:"$10-30"}
  ]},
  "price-facial":{ title:"Facial – Price", items:[
    {src:"images/pexels-anete-lusina-5240820.jpg", caption:"Facial - 1", price:"$15-50"},
    {src:"images/pexels-anntarazevich-5308660.jpg", caption:"Facial - 2", price:"$15-50"},
    {src:"images/pexels-cottonbro-4004122.jpg", caption:"Facial - 3", price:"$15-50"}
  ]},
  "price-massage":{ title:"Massage – Price", items:[
    {src:"images/WhatsApp Image 2025-10-09 at 13.12.02.jpeg", caption:"Massage - 1", price:"$10-150"},
    {src:"images/WhatsApp Image 2025-10-09 at 13.12.01.jpeg", caption:"Massage - 2", price:"$10-150"}
  ]}
};/* ===== Ikraam Beauty Salon - javascript.js ===== */

/* Footer year */
(function(){
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();

/* Auto set active nav link */
(function(){
  var path = (location.pathname.split("/").pop() || "home.html").toLowerCase();
  var links = document.querySelectorAll("nav ul li a");
  for (var i = 0; i < links.length; i++) {
    var href = (links[i].getAttribute("href") || "").toLowerCase();
    if (href === path) links[i].classList.add("active");
  }
})();

/* Wire CTAs (buttons) to register if needed */
(function(){
  var ctas = document.querySelectorAll(".book-btn, .price-btn, .book-now-center");
  for (var i = 0; i < ctas.length; i++) {
    if (ctas[i].tagName === "BUTTON" || ctas[i].tagName === "A") {
      ctas[i].addEventListener("click", function(){
        location.href = "register.html";  // All buttons redirect to register page
      });
    }
  }
})();

/* Lazy-load images */
(function(){
  var imgs = document.querySelectorAll("img");
  for (var i = 0; i < imgs.length; i++) {
    if (!imgs[i].getAttribute("loading")) imgs[i].setAttribute("loading", "lazy");
  }
})();

/* ===== Simple Gallery (Services + Prices) ===== */
/* (Haddii aadan isticmaalin gallery, qaybtaan way iska shaqaynaysaa — isla sidii code-kaagii hore) */
(function(){
  var triggers = document.querySelectorAll("[data-gallery-id]");
  var modal = document.getElementById("galleryModal");
  if (!triggers.length || !modal) return;

  var imgEl = document.getElementById("modalImage");
  var titleEl = document.getElementById("modalTitle");
  var subtitleEl = document.getElementById("modalSubtitle");
  var captionEl = document.getElementById("modalCaption");
  var priceEl = document.getElementById("modalPrice");
  var thumbsEl = document.getElementById("modalThumbs");
  var prevBtn = document.getElementById("prevBtn");
  var nextBtn = document.getElementById("nextBtn");

  var state = { list: [], idx: 0, title: "" };

  function render() {
    if (!state.list.length) return;
    var item = state.list[state.idx];
    imgEl.src = item.src;
    imgEl.alt = item.caption || state.title || "Gallery";
    captionEl.textContent = item.caption || "";
    priceEl.textContent = item.price ? ("Price: " + item.price) : "";
    subtitleEl.textContent = state.title || "";

    thumbsEl.innerHTML = "";
    for (var i = 0; i < state.list.length; i++) {
      var b = document.createElement("button");
      if (i === state.idx) b.className = "active";
      var ti = document.createElement("img");
      ti.src = state.list[i].src;
      ti.alt = state.list[i].caption || ("item " + (i + 1));
      b.appendChild(ti);
      (function(n){ b.addEventListener("click", function(){ state.idx = n; render(); });})(i);
      thumbsEl.appendChild(b);
    }
  }

  function open(id){
    var data = galleryData[id];
    if (!data || !data.items || !data.items.length) return;
    state.list = data.items.slice();
    state.idx = 0;
    state.title = data.title || "";
    titleEl.textContent = "Welcome Madam/Sir";
    render();
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function close(){ modal.hidden = true; document.body.style.overflow = ""; }

  prevBtn && prevBtn.addEventListener("click", function(){
    if (!state.list.length) return;
    state.idx = (state.idx - 1 + state.list.length) % state.list.length;
    render();
  });
  nextBtn && nextBtn.addEventListener("click", function(){
    if (!state.list.length) return;
    state.idx = (state.idx + 1) % state.list.length;
    render();
  });
  modal && modal.addEventListener("click", function(e){
    if (e.target.hasAttribute("data-close-modal")) close();
  });
  document.addEventListener("keydown", function(e){
    if (!modal || modal.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") prevBtn.click();
    if (e.key === "ArrowRight") nextBtn.click();
  });

  for (var i = 0; i < triggers.length; i++) {
    (function(el){
      el.style.cursor = "pointer";
      el.addEventListener("click", function(){ open(el.getAttribute("data-gallery-id")); });
    })(triggers[i]);
  }
})();

/* ===== Registration (NO redirect; error-ka waa baxaa) ===== */
/* — Stores every booking to localStorage array: "ikraam_bookings"
   — Shows success card
   — Refreshes the public list (table below the form) */
(function(){
  var form = document.getElementById("registerForm");
  if (!form) return;

  var box = document.getElementById("register-success");
  var nameEl = document.getElementById("name");
  var phoneEl = document.getElementById("phone");
  var serviceEl = document.getElementById("service");
  var dateEl = document.getElementById("date");

  var bkName = document.getElementById("bkName");
  var bkService = document.getElementById("bkService");
  var bkPrice = document.getElementById("bkPrice");
  var bkDate = document.getElementById("bkDate");

  // Somalia phone: +252 61 1234567, 061234567, 612345678, iwm
  var soPhone = /^\+?252\s?\d{2}\s?\d{6,7}$|^0?\d{8,9}$/;

  form.addEventListener("submit", function(e){
    e.preventDefault();
    var name = nameEl.value.trim();
    var phone = phoneEl.value.trim();
    var service = serviceEl.value.trim();
    var date = dateEl.value;

    if (!name){ alert("Please enter your name."); return; }
    if (!soPhone.test(phone)){ alert("Please enter a valid phone (e.g., +252 61 1234567)."); return; }
    if (!service){ alert("Please enter the requested service."); return; }

    var price = lookupPrice(service) || "—";

    // 1) Save to array storage
    var all = getBookings();
    var booking = {
      id: Date.now(),               
      name: name,
      phone: phone,
      service: service,
      price: price,
      date: date || "—"
    };
    all.push(booking);
    setBookings(all);

    // 2) Show success (latest booking)
    bkName.textContent = booking.name;
    bkService.textContent = booking.service;
    bkPrice.textContent = booking.price;
    bkDate.textContent = booking.date;
    box.style.display = "block";

    // 3) Reset form & refresh table
    form.reset();
    nameEl.focus();
    renderBookingTable();
  });

  // New booking button
  var nb = document.getElementById("newBooking");
  if (nb) nb.addEventListener("click", function(){
    box.style.display = "none";
    nameEl.focus();
  });

  // Helpers for storage
  function getBookings(){
    try { return JSON.parse(localStorage.getItem("ikraam_bookings")||"[]"); }
    catch(e){ return []; }
  }
  function setBookings(arr){
    localStorage.setItem("ikraam_bookings", JSON.stringify(arr));
  }

  // Price lookup (adigii hore)
  function lookupPrice(svc){
    var key = svc.toLowerCase().trim();
    key = key.replace("henna hands")
             .replace("henna legs")
             .replace("bridal makeup")
             .replace("party makeup")
             .replace("hair styling")
             .replace("hair cutting")
             .replace("facial");
    var map = {
      "henna hands":"$5",
      "henna legs":"$5",
      "bridal makeup":"$20-60",
      "party makeup":"$15-40",
      "hair styling":"$12-80",
      "hair cutting":"$10-30",
      "facial":"$15-50",
      "massage":"$10-150"
    };
    if (map[key]) return map[key];
    for (var k in map){ if (key.indexOf(k) > -1) return map[k]; }
    return "";
  }

  /* ===== Public booking list (table) ===== */
  var table = document.getElementById("bookingTable");
  var countEl = document.getElementById("bookingCount");
  var clearBtn = document.getElementById("clearBookings");
  var exportBtn = document.getElementById("exportBookings");

  function renderBookingTable(){
    if (!table) return;
    var tbody = table.querySelector("tbody");
    tbody.innerHTML = "";
    var data = getBookings();
    countEl && (countEl.textContent = data.length);

    data.forEach(function(bk, idx){
      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td>"+ (idx+1) +"</td>"+
        "<td>"+ escapeHtml(bk.name) +"</td>"+
        "<td>"+ escapeHtml(bk.phone||"") +"</td>"+
        "<td>"+ escapeHtml(bk.service) +"</td>"+
        "<td>"+ escapeHtml(bk.price||"—") +"</td>"+
        "<td>"+ escapeHtml(bk.date||"—") +"</td>"+
        '<td><button class="btn btn-outline" data-del="'+bk.id+'">Delete</button></td>';
      tbody.appendChild(tr);
    });

    // wire delete buttons
    tbody.querySelectorAll("[data-del]").forEach(function(btn){
      btn.addEventListener("click", function(){
        var id = +btn.getAttribute("data-del");
        var all = getBookings().filter(function(x){ return x.id !== id; });
        setBookings(all);
        renderBookingTable();
      });
    });
  }

  function escapeHtml(s){
    return (s||"").replace(/[&<>"']/g, function(c){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];
    });
  }

  clearBtn && clearBtn.addEventListener("click", function(){
    if (confirm("Delete ALL bookings?")) {
      localStorage.removeItem("ikraam_bookings");
      renderBookingTable();
    }
  });

  exportBtn && exportBtn.addEventListener("click", function(){
    var blob = new Blob([JSON.stringify(getBookings(), null, 2)], {type:"application/json"});
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = "ikraam_bookings.json"; a.click();
    URL.revokeObjectURL(url);
  });

  // render once on load
  renderBookingTable();
})();