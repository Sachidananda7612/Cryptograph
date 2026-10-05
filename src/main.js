import { createIcons, icons } from 'lucide';
import confetti from 'canvas-confetti';
import { RSACryptoEngine } from './rsa.js';
import { sound } from './sound.js';

// Application State
const state = {
  p: null,
  q: null,
  n: null,
  phi: null,
  e: null,
  d: null,
  messageNum: null,
  multiKeys: [],
  mode: 'number', // 'number' | 'multi'
  isSoundOn: true
};

// Toast notification helper
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${type === 'success' ? '✓' : type === 'error' ? '⚠' : 'ℹ'}</span> <span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 2600);
}

// Confetti celebration
function launchCelebration() {
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.8 },
    colors: ['#06b6d4', '#10b981', '#8b5cf6', '#f59e0b']
  });
}

// Update DOM elements & live calculations
function recalculateAll() {
  const inputP = document.getElementById('input-p');
  const inputQ = document.getElementById('input-q');
  const inputE = document.getElementById('input-e');

  if (!inputP || !inputQ || !inputE) return;

  const pStr = inputP.value.trim();
  const qStr = inputQ.value.trim();

  const badgeP = document.getElementById('badge-p');
  const badgeQ = document.getElementById('badge-q');
  const badgeE = document.getElementById('badge-e');
  const gcdInfoText = document.getElementById('gcd-info-text');

  // If p or q is empty, reset display to placeholder state
  if (!pStr || !qStr) {
    state.p = null;
    state.q = null;
    state.n = null;
    state.phi = null;
    state.e = null;
    state.d = null;

    if (badgeP) {
      badgeP.className = 'status-pill info';
      badgeP.textContent = pStr ? (RSACryptoEngine.isPrime(pStr) ? '✓ Prime' : '✗ Not Prime') : 'Awaiting Input';
    }
    if (badgeQ) {
      badgeQ.className = 'status-pill info';
      badgeQ.textContent = qStr ? (RSACryptoEngine.isPrime(qStr) ? '✓ Prime' : '✗ Not Prime') : 'Awaiting Input';
    }
    if (badgeE) {
      badgeE.className = 'status-pill info';
      badgeE.textContent = 'Awaiting Primes';
    }
    if (gcdInfoText) {
      gcdInfoText.textContent = 'Enter p and q to calculate φ(n) and gcd(e, φ(n))';
    }

    document.getElementById('val-calc-n').textContent = '—';
    document.getElementById('val-calc-phi').textContent = '—';
    document.getElementById('label-n-limit').textContent = '—';
    const multiLimit = document.getElementById('label-multi-n-limit');
    if (multiLimit) multiLimit.textContent = '—';

    const pubDisp = document.getElementById('public-key-display');
    const privDisp = document.getElementById('private-key-display');
    if (pubDisp) {
      pubDisp.className = 'key-body';
      pubDisp.textContent = '(e = —, n = —)';
    }
    if (privDisp) {
      privDisp.className = 'key-body';
      privDisp.textContent = '(d = —, n = —)';
    }

    document.getElementById('candidates-container').innerHTML = '';
    resetWorkbenchDisplay();
    return;
  }

  state.p = BigInt(pStr);
  state.q = BigInt(qStr);

  // Primality & distinct checks
  const isPPrime = RSACryptoEngine.isPrime(state.p);
  const isQPrime = RSACryptoEngine.isPrime(state.q);
  const isDistinct = state.p !== state.q;

  if (isPPrime) {
    badgeP.className = 'status-pill success';
    badgeP.textContent = '✓ Prime';
    inputP.classList.remove('invalid');
  } else {
    badgeP.className = 'status-pill danger';
    badgeP.textContent = '✗ Not Prime';
    inputP.classList.add('invalid');
  }

  if (isQPrime && isDistinct) {
    badgeQ.className = 'status-pill success';
    badgeQ.textContent = '✓ Prime';
    inputQ.classList.remove('invalid');
  } else if (!isDistinct) {
    badgeQ.className = 'status-pill warning';
    badgeQ.textContent = '✗ Must differ from p';
    inputQ.classList.add('invalid');
  } else {
    badgeQ.className = 'status-pill danger';
    badgeQ.textContent = '✗ Not Prime';
    inputQ.classList.add('invalid');
  }

  // Calculate n and phi
  state.n = state.p * state.q;
  state.phi = (state.p - 1n) * (state.q - 1n);

  const valCalcN = document.getElementById('val-calc-n');
  const valCalcPhi = document.getElementById('val-calc-phi');

  if (valCalcN) {
    valCalcN.innerHTML = `<span class="result-highlight-badge primary">${state.p} × ${state.q} = <strong>n = ${state.n}</strong></span>`;
  }
  if (valCalcPhi) {
    valCalcPhi.innerHTML = `<span class="result-highlight-badge violet">(${state.p}-1) × (${state.q}-1) = <strong>φ(n) = ${state.phi}</strong></span>`;
  }
  document.getElementById('label-n-limit').textContent = state.n.toString();
  const multiLimit = document.getElementById('label-multi-n-limit');
  if (multiLimit) multiLimit.textContent = state.n.toString();

  // Validate Public Exponent e
  const eStr = inputE.value.trim();
  const pubDisplay = document.getElementById('public-key-display');
  const privDisplay = document.getElementById('private-key-display');

  if (!eStr) {
    state.e = null;
    state.d = null;
    badgeE.className = 'status-pill info';
    badgeE.textContent = 'Enter Exponent e';
    gcdInfoText.textContent = `Enter an integer e coprime to φ(n) = ${state.phi}`;
    if (pubDisplay) {
      pubDisplay.className = 'key-body';
      pubDisplay.textContent = `(e = —, n = ${state.n})`;
    }
    if (privDisplay) {
      privDisplay.className = 'key-body';
      privDisplay.textContent = `(d = —, n = ${state.n})`;
    }
    renderCandidateChips();
    resetWorkbenchDisplay();
    return;
  }

  state.e = BigInt(eStr);
  const gcdVal = RSACryptoEngine.gcd(state.e, state.phi);
  const isCoprime = gcdVal === 1n;
  const inRange = state.e > 1n && state.e < state.phi;

  if (inRange && isCoprime) {
    badgeE.className = 'status-pill success';
    badgeE.textContent = '✓ Valid Coprime Exponent';
    inputE.classList.remove('invalid');
    gcdInfoText.innerHTML = `<span style="color: var(--accent-emerald);">✓ gcd(${state.e}, ${state.phi}) = 1 (Coprime & Valid)</span>`;
  } else if (!inRange) {
    badgeE.className = 'status-pill danger';
    badgeE.textContent = `✗ Must be 1 < e < ${state.phi}`;
    inputE.classList.add('invalid');
    gcdInfoText.innerHTML = `<span style="color: var(--accent-rose);">✗ Exponent out of range (1 < e < ${state.phi})</span>`;
  } else {
    badgeE.className = 'status-pill danger';
    badgeE.textContent = `✗ gcd(e, φ(n)) = ${gcdVal} ≠ 1`;
    inputE.classList.add('invalid');
    gcdInfoText.innerHTML = `<span style="color: var(--accent-rose);">✗ gcd(${state.e}, ${state.phi}) = ${gcdVal} (Not coprime! Choose another e)</span>`;
  }

  // Update candidate chips
  renderCandidateChips();

  // Calculate Private Key d
  if (inRange && isCoprime) {
    state.d = RSACryptoEngine.modInverse(state.e, state.phi);
  } else {
    state.d = null;
  }

  // Update Key Displays (Whole Cell Highlighting)
  if (state.d !== null) {
    if (pubDisplay) {
      pubDisplay.className = 'key-body active-public';
      pubDisplay.innerHTML = `(e = <strong>${state.e}</strong>, n = <strong>${state.n}</strong>)`;
    }
    if (privDisplay) {
      privDisplay.className = 'key-body active-private';
      privDisplay.innerHTML = `(d = <strong>${state.d}</strong>, n = <strong>${state.n}</strong>)`;
    }
  } else {
    if (pubDisplay) {
      pubDisplay.className = 'key-body';
      pubDisplay.textContent = state.n ? `(e = ${state.e || '—'}, n = ${state.n}) [Invalid e]` : '(e = —, n = —)';
    }
    if (privDisplay) {
      privDisplay.className = 'key-body';
      privDisplay.textContent = `[Cannot compute d: e and φ(n) not coprime]`;
    }
  }

  // Prepare Workbench State
  updateWorkbenchReadiness();
}

function resetWorkbenchDisplay() {
  state.cipherNum = null;
  state.decryptedNum = null;
  state.multiCiphers = [];
  state.multiDecrypted = [];

  const fM = document.getElementById('flow-node-m');
  const fC = document.getElementById('flow-node-c');
  const fD = document.getElementById('flow-node-dec');

  const cardM = fM?.closest('.flow-node');
  const cardC = fC?.closest('.flow-node');
  const cardDec = fD?.closest('.flow-node');

  if (cardM) cardM.className = 'flow-node';
  if (cardC) cardC.className = 'flow-node';
  if (cardDec) cardDec.className = 'flow-node';

  if (fM) fM.textContent = state.messageNum !== null ? state.messageNum.toString() : '—';
  if (fC) fC.textContent = '—';
  if (fD) fD.textContent = '—';

  const tEncSub = document.getElementById('trace-enc-sub');
  const tEncRes = document.getElementById('trace-enc-result');
  const tDecSub = document.getElementById('trace-dec-sub');
  const tDecRes = document.getElementById('trace-dec-result');
  if (tEncSub) tEncSub.textContent = 'C = M^e mod n';
  if (tEncRes) tEncRes.textContent = 'C = —';
  if (tDecSub) tDecSub.textContent = 'M = C^d mod n';
  if (tDecRes) tDecRes.textContent = 'M = —';

  const statusBadge = document.getElementById('distribution-status-badge');
  if (statusBadge) {
    statusBadge.className = 'status-pill info';
    statusBadge.innerHTML = `<i data-lucide="info" style="width: 16px;"></i> Ready — Enter Plaintext Key M and click "1. Encrypt Key"`;
  }

  const btnEncNum = document.getElementById('btn-encrypt-num');
  const btnDecNum = document.getElementById('btn-decrypt-num');
  if (btnEncNum) btnEncNum.disabled = true;
  if (btnDecNum) btnDecNum.disabled = true;

  const btnEncMulti = document.getElementById('btn-encrypt-multi');
  const btnDecMulti = document.getElementById('btn-decrypt-multi');
  if (btnEncMulti) btnEncMulti.disabled = true;
  if (btnDecMulti) btnDecMulti.disabled = true;

  const multiCipher = document.getElementById('multi-ciphertext-array');
  const multiDec = document.getElementById('multi-decrypted-output');
  if (multiCipher) multiCipher.textContent = '[ — ]';
  if (multiDec) multiDec.textContent = '[ — ]';

  createIcons({ icons });
}

// Render valid candidate exponents for quick selection
function renderCandidateChips() {
  const container = document.getElementById('candidates-container');
  if (!container) return;
  container.innerHTML = '';

  if (!state.phi || state.phi <= 2n) return;

  const candidates = RSACryptoEngine.getCandidateExponents(state.phi, 6);
  candidates.forEach(cand => {
    const chip = document.createElement('button');
    chip.className = `chip ${cand === state.e ? 'active' : ''}`;
    chip.textContent = `e = ${cand}`;
    chip.onclick = () => {
      sound.playClick();
      document.getElementById('input-e').value = cand.toString();
      recalculateAll();
      showToast(`Selected public exponent e = ${cand}`, 'info');
    };
    container.appendChild(chip);
  });
}

// Update Workbench Readiness
function updateWorkbenchReadiness() {
  const inputMsg = document.getElementById('input-message-num');
  const badgeMsg = document.getElementById('badge-msg-num');
  const btnEncNum = document.getElementById('btn-encrypt-num');
  const btnDecNum = document.getElementById('btn-decrypt-num');
  const btnEncMulti = document.getElementById('btn-encrypt-multi');
  const btnDecMulti = document.getElementById('btn-decrypt-multi');

  // Multi-mode readiness
  if (btnEncMulti) btnEncMulti.disabled = (state.d === null);
  if (btnDecMulti) btnDecMulti.disabled = true;

  if (!inputMsg) return;
  const mStr = inputMsg.value.trim();

  if (!mStr) {
    state.messageNum = null;
    if (badgeMsg) {
      badgeMsg.className = 'status-pill info';
      badgeMsg.textContent = 'Awaiting Input';
    }
    resetWorkbenchDisplay();
    return;
  }

  state.messageNum = BigInt(mStr);
  const isValidM = state.n !== null && state.messageNum >= 0n && state.messageNum < state.n;

  if (isValidM) {
    if (badgeMsg) {
      badgeMsg.className = 'status-pill success';
      badgeMsg.textContent = '✓ Valid M < n';
    }
    inputMsg.classList.remove('invalid');
  } else {
    if (badgeMsg) {
      badgeMsg.className = 'status-pill danger';
      badgeMsg.textContent = state.n ? `✗ M must be integer < ${state.n}` : '✗ Awaiting valid Modulus n';
    }
    inputMsg.classList.add('invalid');
  }

  // Update Plaintext node (Whole Cell)
  const fM = document.getElementById('flow-node-m');
  const cardM = fM?.closest('.flow-node');
  if (fM) {
    fM.textContent = isValidM ? state.messageNum.toString() : (state.messageNum !== null ? state.messageNum.toString() : '—');
  }
  if (cardM) {
    if (isValidM) {
      cardM.className = 'flow-node active-plain';
    } else {
      cardM.className = 'flow-node';
    }
  }

  // Reset downstream nodes
  const fC = document.getElementById('flow-node-c');
  const fD = document.getElementById('flow-node-dec');
  const cardC = fC?.closest('.flow-node');
  const cardDec = fD?.closest('.flow-node');

  if (fC) fC.textContent = '—';
  if (fD) fD.textContent = '—';
  if (cardC) cardC.className = 'flow-node';
  if (cardDec) cardDec.className = 'flow-node';

  const tEncSub = document.getElementById('trace-enc-sub');
  const tEncRes = document.getElementById('trace-enc-result');
  const tDecSub = document.getElementById('trace-dec-sub');
  const tDecRes = document.getElementById('trace-dec-result');
  if (tEncSub) tEncSub.textContent = state.e ? `C = ${state.messageNum}^${state.e} mod ${state.n}` : 'C = M^e mod n';
  if (tEncRes) tEncRes.textContent = 'C = —';
  if (tDecSub) tDecSub.textContent = state.d ? `M = C^${state.d} mod ${state.n}` : 'M = C^d mod n';
  if (tDecRes) tDecRes.textContent = 'M = —';

  const statusBadge = document.getElementById('distribution-status-badge');
  if (statusBadge) {
    statusBadge.className = 'status-pill info';
    statusBadge.innerHTML = `<i data-lucide="info" style="width: 16px;"></i> Ready — Click "1. Encrypt Key" to generate Ciphertext`;
  }

  if (btnEncNum) btnEncNum.disabled = !(state.d !== null && isValidM);
  if (btnDecNum) btnDecNum.disabled = true;

  createIcons({ icons });
}

// Action 1: Encrypt Single Number (Whole Cell Flow Highlight)
function encryptSingleNumber() {
  if (state.d === null || state.e === null || state.n === null || state.messageNum === null) {
    showToast('Please specify valid primes p, q, exponent e, and key M first', 'error');
    return;
  }

  // Encryption: C = M^e mod n
  state.cipherNum = RSACryptoEngine.encryptNumber(state.messageNum, state.e, state.n);

  // Update Pipeline Node (Whole Cell)
  const fC = document.getElementById('flow-node-c');
  const cardC = fC?.closest('.flow-node');
  if (fC) {
    fC.textContent = state.cipherNum.toString();
  }
  if (cardC) {
    cardC.className = 'flow-node active-cipher';
  }

  const fD = document.getElementById('flow-node-dec');
  const cardDec = fD?.closest('.flow-node');
  if (fD) fD.textContent = '—';
  if (cardDec) cardDec.className = 'flow-node';

  // Math Step Trace
  document.getElementById('trace-enc-sub').textContent = `C = ${state.messageNum}^${state.e} mod ${state.n}`;
  document.getElementById('trace-enc-result').innerHTML = `<span class="result-highlight-badge amber"><strong>C = ${state.cipherNum}</strong></span>`;

  // Reset Step 7 Decryption Trace
  document.getElementById('trace-dec-sub').textContent = `M = ${state.cipherNum}^${state.d} mod ${state.n}`;
  document.getElementById('trace-dec-result').textContent = 'M = — (Click Decrypt Button)';

  // Enable Decrypt Button
  const btnDec = document.getElementById('btn-decrypt-num');
  if (btnDec) btnDec.disabled = false;

  const statusBadge = document.getElementById('distribution-status-badge');
  if (statusBadge) {
    statusBadge.className = 'status-pill warning';
    statusBadge.innerHTML = `<i data-lucide="lock" style="width: 16px;"></i> Ciphertext C = ${state.cipherNum} Generated — Click "2. Decrypt Cipher" to Recover Key`;
  }

  sound.playProcess();
  showToast(`Encrypted M = ${state.messageNum} → Ciphertext C = ${state.cipherNum}`, 'info');
  createIcons({ icons });
}

// Action 2: Decrypt Single Number (Whole Cell Flow Highlight)
function decryptSingleNumber() {
  if (state.cipherNum === null || state.d === null || state.n === null) {
    showToast('No ciphertext available to decrypt. Please encrypt a key first.', 'error');
    return;
  }

  // Decryption: M' = C^d mod n
  state.decryptedNum = RSACryptoEngine.decryptNumber(state.cipherNum, state.d, state.n);

  // Update Pipeline Node (Whole Cell)
  const fD = document.getElementById('flow-node-dec');
  const cardDec = fD?.closest('.flow-node');
  if (fD) {
    fD.textContent = state.decryptedNum.toString();
  }
  if (cardDec) {
    cardDec.className = 'flow-node active-recovered';
  }

  // Math Step Trace
  document.getElementById('trace-dec-sub').textContent = `M' = ${state.cipherNum}^${state.d} mod ${state.n}`;
  const isMatch = state.decryptedNum === state.messageNum;

  const statusBadge = document.getElementById('distribution-status-badge');
  if (isMatch) {
    document.getElementById('trace-dec-result').innerHTML = `<span class="result-highlight-badge emerald"><strong>M' = ${state.decryptedNum} ✓ (Match)</strong></span>`;
    statusBadge.className = 'status-pill success';
    statusBadge.innerHTML = `<i data-lucide="check-circle" style="width: 16px;"></i> Key Distribution Verified: Recovered M' = ${state.decryptedNum}`;
    sound.playSuccess();
    launchCelebration();
    showToast(`Decrypted C = ${state.cipherNum} → Recovered Key M' = ${state.decryptedNum} (Match ✓)`, 'success');
  } else {
    document.getElementById('trace-dec-result').textContent = `M' = ${state.decryptedNum} (Mismatch ✗)`;
    statusBadge.className = 'status-pill danger';
    statusBadge.innerHTML = `<i data-lucide="alert-triangle" style="width: 16px;"></i> Decryption Mismatch`;
    showToast('Decryption mismatch detected', 'error');
  }

  createIcons({ icons });
}

// Multi-Key Mode Action 1: Encrypt Sequence
function encryptMultiNumbers() {
  const inputMulti = document.getElementById('input-message-multi');
  if (!inputMulti || state.d === null) return;

  const rawText = inputMulti.value.trim();
  if (!rawText) {
    showToast('Please enter sequence numbers first', 'error');
    return;
  }

  const numStrings = rawText.split(/[\s,]+/).filter(s => s.trim().length > 0);
  const parsedNumbers = numStrings.map(s => parseInt(s, 10)).filter(n => !isNaN(n));

  if (parsedNumbers.length === 0) {
    showToast('No valid numbers entered', 'error');
    return;
  }

  try {
    const encryptedBlocks = RSACryptoEngine.encryptNumberSequence(parsedNumbers, state.e, state.n);
    state.multiCiphers = encryptedBlocks.map(b => b.cipher);
    state.multiKeys = parsedNumbers;

    const multiCipher = document.getElementById('multi-ciphertext-array');
    if (multiCipher) {
      multiCipher.className = 'result-highlight-badge amber';
      multiCipher.textContent = `[ ${state.multiCiphers.join(', ')} ]`;
    }
    const multiDec = document.getElementById('multi-decrypted-output');
    if (multiDec) {
      multiDec.className = '';
      multiDec.textContent = '[ — (Click Decrypt Sequence) ]';
    }

    const btnDecMulti = document.getElementById('btn-decrypt-multi');
    if (btnDecMulti) btnDecMulti.disabled = false;

    sound.playProcess();
    showToast(`Encrypted ${state.multiCiphers.length} numbers to ciphertext sequence`, 'info');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Multi-Key Mode Action 2: Decrypt Sequence
function decryptMultiNumbers() {
  if (state.multiCiphers.length === 0 || state.d === null) {
    showToast('No ciphertext sequence available to decrypt', 'error');
    return;
  }

  try {
    const decryptedBlocks = RSACryptoEngine.decryptNumberSequence(state.multiCiphers, state.d, state.n);
    state.multiDecrypted = decryptedBlocks.map(d => d.decryptedNumber);

    const multiDec = document.getElementById('multi-decrypted-output');
    if (multiDec) {
      multiDec.className = 'result-highlight-badge emerald';
      multiDec.textContent = `[ ${state.multiDecrypted.join(', ')} ]`;
    }

    sound.playSuccess();
    launchCelebration();
    showToast('Sequence decrypted and 100% verified!', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Initialize Event Listeners
function initEventListeners() {
  // Input triggers
  ['input-p', 'input-q', 'input-e', 'input-message-num'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        sound.playProcess();
        recalculateAll();
      });
    }
  });

  const inputMulti = document.getElementById('input-message-multi');
  if (inputMulti) {
    inputMulti.addEventListener('input', () => {
      sound.playProcess();
      encryptMultiNumbers();
    });
  }

  // Suggest Next e button
  document.getElementById('btn-suggest-e')?.addEventListener('click', () => {
    sound.playClick();
    const candidates = RSACryptoEngine.getCandidateExponents(state.phi, 10);
    const next = candidates.find(c => c > state.e) || candidates[0] || 17n;
    document.getElementById('input-e').value = next.toString();
    recalculateAll();
    showToast(`Set public exponent e = ${next}`, 'info');
  });

  // Random Primes Generator
  const generateRandomPrimesAction = () => {
    sound.playClick();
    const p = RSACryptoEngine.generateRandomPrime(11, 80);
    let q = RSACryptoEngine.generateRandomPrime(11, 80);
    while (q === p) {
      q = RSACryptoEngine.generateRandomPrime(11, 80);
    }
    document.getElementById('input-p').value = p;
    document.getElementById('input-q').value = q;

    // Pick first valid e
    const phi = BigInt((p - 1) * (q - 1));
    const candidates = RSACryptoEngine.getCandidateExponents(phi, 3);
    if (candidates.length > 0) {
      document.getElementById('input-e').value = candidates[0].toString();
    }

    recalculateAll();
    showToast(`Generated random primes p = ${p}, q = ${q}`, 'success');
  };

  document.getElementById('btn-random-primes')?.addEventListener('click', generateRandomPrimesAction);
  document.getElementById('btn-random-primes-hero')?.addEventListener('click', generateRandomPrimesAction);

  // Swap p and q
  document.getElementById('btn-swap-primes')?.addEventListener('click', () => {
    sound.playClick();
    const temp = document.getElementById('input-p').value;
    document.getElementById('input-p').value = document.getElementById('input-q').value;
    document.getElementById('input-q').value = temp;
    recalculateAll();
    showToast('Swapped p and q values', 'info');
  });

  // Mode Tabs
  const tabNum = document.getElementById('tab-mode-number');
  const tabMulti = document.getElementById('tab-mode-multi');
  const secNum = document.getElementById('mode-number-section');
  const secMulti = document.getElementById('mode-multi-section');

  tabNum?.addEventListener('click', () => {
    sound.playClick();
    state.mode = 'number';
    tabNum.classList.add('active');
    tabMulti.classList.remove('active');
    if (secNum) secNum.style.display = 'block';
    if (secMulti) secMulti.style.display = 'none';
    recalculateAll();
  });

  tabMulti?.addEventListener('click', () => {
    sound.playClick();
    state.mode = 'multi';
    tabMulti.classList.add('active');
    tabNum.classList.remove('active');
    if (secNum) secNum.style.display = 'none';
    if (secMulti) secMulti.style.display = 'block';
    recalculateAll();
  });

  // Step 1: Encrypt Button (Single Mode)
  document.getElementById('btn-encrypt-num')?.addEventListener('click', () => {
    encryptSingleNumber();
  });

  // Step 2: Decrypt Button (Single Mode)
  document.getElementById('btn-decrypt-num')?.addEventListener('click', () => {
    decryptSingleNumber();
  });

  // Multi Mode Encrypt & Decrypt Buttons
  document.getElementById('btn-encrypt-multi')?.addEventListener('click', () => {
    encryptMultiNumbers();
  });

  document.getElementById('btn-decrypt-multi')?.addEventListener('click', () => {
    decryptMultiNumbers();
  });

  // Preset Buttons
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      sound.playClick();
      const type = btn.getAttribute('data-preset');
      if (type === 'small') {
        document.getElementById('input-p').value = '11';
        document.getElementById('input-q').value = '13';
        document.getElementById('input-e').value = '17';
        document.getElementById('input-message-num').value = '4';
        tabNum?.click();
        recalculateAll();
        encryptSingleNumber();
        decryptSingleNumber();
      } else if (type === 'standard') {
        document.getElementById('input-p').value = '61';
        document.getElementById('input-q').value = '53';
        document.getElementById('input-e').value = '17';
        document.getElementById('input-message-num').value = '65';
        tabNum?.click();
        recalculateAll();
        encryptSingleNumber();
        decryptSingleNumber();
      } else if (type === 'multi') {
        document.getElementById('input-p').value = '43';
        document.getElementById('input-q').value = '47';
        document.getElementById('input-e').value = '17';
        document.getElementById('input-message-multi').value = '15, 28, 92, 114';
        tabMulti?.click();
        recalculateAll();
        encryptMultiNumbers();
        decryptMultiNumbers();
      }
      showToast(`Loaded Preset: ${type}`, 'success');
    });
  });

  // Message quick value buttons
  document.querySelectorAll('.msg-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      sound.playClick();
      document.getElementById('input-message-num').value = btn.getAttribute('data-val');
      recalculateAll();
    });
  });

  // Multi-key quick value buttons
  document.querySelectorAll('.multi-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      sound.playClick();
      document.getElementById('input-message-multi').value = btn.getAttribute('data-nums');
      recalculateAll();
    });
  });

  // Copy Key Buttons
  document.querySelectorAll('.copy-key-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      sound.playClick();
      const target = btn.getAttribute('data-target');
      const textToCopy = target === 'public'
        ? `Public Key: (e = ${state.e}, n = ${state.n})`
        : `Private Key: (d = ${state.d}, n = ${state.n})`;
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast(`Copied ${target} key to clipboard!`, 'success');
      });
    });
  });

  // Reset All Button
  document.getElementById('reset-all-btn')?.addEventListener('click', () => {
    sound.playClick();
    document.getElementById('input-p').value = '';
    document.getElementById('input-q').value = '';
    document.getElementById('input-e').value = '';
    document.getElementById('input-message-num').value = '';
    document.getElementById('input-message-multi').value = '';
    tabNum?.click();
    recalculateAll();
    showToast('Inputs cleared', 'info');
  });

  // Sound Toggle Button
  const soundBtn = document.getElementById('sound-toggle-btn');
  const soundLabel = document.getElementById('sound-label');

  soundBtn?.addEventListener('click', () => {
    const isNowOn = sound.toggle();
    state.isSoundOn = isNowOn;
    if (soundLabel) soundLabel.textContent = isNowOn ? 'Audio ON' : 'Audio OFF';
    showToast(`Audio sound effects ${isNowOn ? 'enabled' : 'disabled'}`, 'info');
  });
}

// Initialize Lucide Icons & App on DOM Load
document.addEventListener('DOMContentLoaded', () => {
  createIcons({ icons });
  initEventListeners();
  recalculateAll();
});
