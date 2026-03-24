/* ============================================================
   ORDER.JS — ZebWorks Multi-Step Order Form
   ============================================================ */

(function () {
  document.addEventListener('DOMContentLoaded', initOrderForm);

  const state = {
    step: 1,
    totalSteps: 5,
    service: null,
    package: null,
    details: {},
    payment: null
  };

  function initOrderForm() {
    if (!document.getElementById('orderForm')) return;

    // Step navigation
    document.getElementById('nextBtn')?.addEventListener('click', nextStep);
    document.getElementById('prevBtn')?.addEventListener('click', prevStep);
    document.getElementById('submitBtn')?.addEventListener('click', submitOrder);

    // Service selection
    document.querySelectorAll('.service-option').forEach(function (el) {
      el.addEventListener('click', function () {
        document.querySelectorAll('.service-option').forEach(function (o) { o.classList.remove('selected'); });
        el.classList.add('selected');
        state.service = el.dataset.service;
        updateSummary();
        enableNext();
      });
    });

    // Package selection
    document.querySelectorAll('.package-option').forEach(function (el) {
      el.addEventListener('click', function () {
        document.querySelectorAll('.package-option').forEach(function (o) { o.classList.remove('selected'); });
        el.classList.add('selected');
        state.package = { name: el.dataset.pkg, price: el.dataset.price };
        updateSummary();
        enableNext();
      });
    });

    // Payment selection
    document.querySelectorAll('.payment-option:not(.payment-coming-soon)').forEach(function (el) {
      el.addEventListener('click', function () {
        document.querySelectorAll('.payment-option').forEach(function (o) { o.classList.remove('selected'); });
        el.classList.add('selected');
        state.payment = el.dataset.payment;
        updateSummary();
        enableNext();
      });
    });

    renderStep(1);
  }

  /* ─── NAVIGATION ─── */
  function nextStep() {
    if (!validateStep(state.step)) return;
    if (state.step < state.totalSteps) {
      state.step++;
      renderStep(state.step);
    }
  }

  function prevStep() {
    if (state.step > 1) {
      state.step--;
      renderStep(state.step);
    }
  }

  function renderStep(step) {
    // Hide all panels
    document.querySelectorAll('.form-panel').forEach(function (p) { p.classList.remove('active'); });
    // Show current
    const panel = document.getElementById('step' + step);
    if (panel) panel.classList.add('active');

    // Update progress indicators
    document.querySelectorAll('.order-step').forEach(function (s, i) {
      s.classList.remove('active', 'done');
      if (i + 1 === step) s.classList.add('active');
      if (i + 1 < step) s.classList.add('done');
    });

    // Buttons
    const prev = document.getElementById('prevBtn');
    const next = document.getElementById('nextBtn');
    const submit = document.getElementById('submitBtn');

    if (prev) prev.style.display = step === 1 ? 'none' : 'inline-flex';
    if (next) next.style.display = step === state.totalSteps ? 'none' : 'inline-flex';
    if (submit) submit.style.display = step === state.totalSteps ? 'inline-flex' : 'none';

    // If step 5 (summary), populate it
    if (step === 5) populateSummary();

    // Disable next until selection made on choice steps
    if ([1, 2, 4].includes(step)) {
      const hasSelection = (step === 1 && state.service) ||
                           (step === 2 && state.package) ||
                           (step === 4 && state.payment);
      if (next) next.disabled = !hasSelection;
    } else {
      if (next) next.disabled = false;
    }
  }

  /* ─── VALIDATION ─── */
  function validateStep(step) {
    if (step === 1 && !state.service) {
      showError('Please select a service to continue.');
      return false;
    }
    if (step === 2 && !state.package) {
      showError('Please select a package to continue.');
      return false;
    }
    if (step === 3) {
      const name = document.getElementById('clientName')?.value.trim();
      const email = document.getElementById('clientEmail')?.value.trim();
      const desc = document.getElementById('projectDesc')?.value.trim();
      if (!name || !email || !desc) {
        showError('Please fill in all required fields.');
        return false;
      }
      state.details = {
        name,
        email,
        phone: document.getElementById('clientPhone')?.value.trim() || '',
        projectName: document.getElementById('projectName')?.value.trim() || '',
        desc,
        deadline: document.getElementById('deadline')?.value || '',
        refs: document.getElementById('refLinks')?.value.trim() || ''
      };
    }
    if (step === 4 && !state.payment) {
      showError('Please select a payment method.');
      return false;
    }
    clearError();
    return true;
  }

  function showError(msg) {
    let err = document.getElementById('formError');
    if (!err) {
      err = document.createElement('p');
      err.id = 'formError';
      err.style.cssText = 'color:var(--accent);font-size:0.85rem;margin-top:0.75rem;';
      document.querySelector('.form-nav')?.appendChild(err);
    }
    err.textContent = msg;
  }

  function clearError() {
    const err = document.getElementById('formError');
    if (err) err.textContent = '';
  }

  function enableNext() {
    const next = document.getElementById('nextBtn');
    if (next) next.disabled = false;
  }

  /* ─── SUMMARY ─── */
  function updateSummary() {
    // Live update on step 5 if visible
    if (state.step === 5) populateSummary();
  }

  function populateSummary() {
    setValue('sum-service', state.service || '—');
    setValue('sum-package', state.package ? state.package.name : '—');
    setValue('sum-price', state.package ? '₹' + state.package.price : '—');
    setValue('sum-name', state.details.name || '—');
    setValue('sum-email', state.details.email || '—');
    setValue('sum-deadline', state.details.deadline || 'Flexible');
    setValue('sum-payment', state.payment || '—');
  }

  function setValue(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  /* ─── WHATSAPP REDIRECT ─── */
  function submitOrder() {
    if (!validateStep(4)) return;

    // ⚠️ PLACEHOLDER — Replace with your actual WhatsApp number
    const WHATSAPP_NUMBER = '[YOUR_WHATSAPP_NUMBER]'; // e.g. 919876543210

    const msg = buildWhatsAppMessage();
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  }

  function buildWhatsAppMessage() {
    const d = state.details;
    return `Hi Shahzeb! 👋 I'd like to place an order via ZebWorks.

*Service:* ${state.service || 'N/A'}
*Package:* ${state.package ? state.package.name + ' (₹' + state.package.price + ')' : 'N/A'}

*My Details:*
Name: ${d.name || 'N/A'}
Email: ${d.email || 'N/A'}
Phone: ${d.phone || 'N/A'}

*Project:*
Name: ${d.projectName || 'N/A'}
Description: ${d.desc || 'N/A'}
Deadline: ${d.deadline || 'Flexible'}
References: ${d.refs || 'None'}

*Payment Method:* ${state.payment || 'N/A'}

Looking forward to working with you! 🚀`;
  }

})();
