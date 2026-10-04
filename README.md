# 🔐 CRYPTOLAB — RSA Asymmetric Cryptography Virtual Laboratory

An interactive, modern Virtual Laboratory designed for educational demonstration and visualization of the **RSA (Rivest–Shamir–Adleman) Asymmetric Key Cryptosystem**.

Developed by **Sachidananda** and **Ravikumar**.

---

## 📖 About the Project

**CRYPTOLAB** is an educational web platform that allows students, educators, and cryptography enthusiasts to explore and understand how Public-Key Asymmetric Cryptography works step-by-step. 

Unlike classical symmetric ciphers, RSA solves the key-distribution problem by utilizing a pair of mathematically linked keys: a **Public Key** (e, n) used for encryption and a **Private Key** (d, n) kept secret for decryption.

### 🌟 Key Features

- **🏛️ Multi-Page Virtual Lab Structure:**
  - **[Aim](aim.html)**: Experiment scope, objectives, and problem statement.
  - **[Theory](theory.html)**: Mathematical foundation of RSA, Euler's totient function, and modular inverses.
  - **[Objective](objective.html)**: Key learning outcomes and competency checklist.
  - **[Procedure](procedure.html)**: Step-by-step experiment protocol and instructions.
  - **[Simulation](simulation.html)**: Live interactive cryptographic workbench.
- **🔢 Interactive RSA Key Generation:**
  - Enter custom prime numbers (p, q) or generate random primes with one click.
  - Automatic modulus (n = p × q) and Euler's Totient (φ(n) = (p - 1)(q - 1)) computation.
  - Real-time primality testing and distinctness validation.
- **🔑 Public & Private Key Derivation:**
  - Interactive user-prompted public exponent e with live coprimality (gcd(e, φ(n)) = 1) verification.
  - Dynamic candidate suggestions for valid exponents.
  - Automatic private exponent d calculation using the **Extended Euclidean Algorithm** (d = e⁻¹ mod φ(n)).
- **🔒 Step-by-Step 2-Stage Execution Workbench:**
  - **Step 1 ("1. Encrypt Key")**: Computes Ciphertext C = M^e mod n and shows the mathematical substitution trace.
  - **Step 2 ("2. Decrypt Cipher")**: Computes Recovered Key M' = C^d mod n, verifies 100% distribution match (M' = M), and triggers success feedback.
- **📊 Two Operational Modes:**
  - **Single Plaintext Key Number (M < n)**: For direct mathematical inspection.
  - **Multiple Key Numbers Sequence**: Encrypt and decrypt sequences of numeric keys.
- **🔊 Audio FX & Visual Feedback:**
  - Web Audio API synthesized procedural sound effects (toggable).
  - Confetti celebrations and toast notifications.
  - Sleek dark cyber glassmorphism design with responsive sidebar navigation.

---

## 📂 Project Structure

```text
Crypto/
├── index.html          # Main landing page (Aim overview)
├── aim.html            # Experiment Aim & Introduction
├── theory.html         # Mathematical Theory & Formulas
├── objective.html      # 5 Learning Objectives
├── procedure.html      # Step-by-Step Experiment Protocol
├── simulation.html     # Interactive RSA Simulator & Workbench
├── package.json        # Project metadata and dependencies
├── vite.config.js      # Multi-page Vite build configuration
├── src/
│   ├── main.js         # DOM manipulation, state, and event orchestration
│   ├── rsa.js          # BigInt RSA modular arithmetic cryptographic engine
│   ├── sound.js        # Web Audio API procedural sound synthesizer
│   └── style.css       # Complete cyber dark glassmorphism design system
└── README.md           # Project documentation and guide
```

---

## 🚀 How to Run the Project

### Prerequisites

Make sure you have **[Node.js](https://nodejs.org/)** (v18 or higher recommended) and **npm** installed on your system.

To check your Node.js and npm versions:
```bash
node -v
npm -v
```

---

### Step 1: Clone or Navigate to the Project Directory

```bash
cd /path/to/Crypto
```

---

### Step 2: Install Dependencies

Install the required npm packages:
```bash
npm install
```

---

### Step 3: Start the Development Server

Run the local Vite dev server:
```bash
npm run dev
```

After starting, you will see terminal output similar to:
```text
  VITE v5.4.x  ready in 120 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.x.x:3000/
```

Open your browser and navigate to **`http://localhost:3000`**.

---

### Step 4: Build for Production (Optional)

To create an optimized production bundle:
```bash
npm run build
```

To preview the built production bundle locally:
```bash
npm run preview
```

---

## 🧮 Mathematical Formulas Used

| Step | Operation | Formula |
| :--- | :--- | :--- |
| **1** | **Modulus Calculation** | n = p × q |
| **2** | **Euler's Totient** | φ(n) = (p - 1) × (q - 1) |
| **3** | **Coprimality Condition** | 1 &lt; e &lt; φ(n) and gcd(e, φ(n)) = 1 |
| **4** | **Private Exponent** | e × d ≡ 1 mod φ(n) ⟺ d ≡ e⁻¹ mod φ(n) |
| **5** | **Encryption** | C = M^e mod n (where 0 ≤ M &lt; n) |
| **6** | **Decryption** | M' = C^d mod n |

---

## 🛠️ Technology Stack

- **Frontend:** Semantic HTML5, Vanilla CSS3 (Custom Glassmorphism Design System)
- **Logic:** Vanilla JavaScript (ES2022+ with native `BigInt` for arbitrary precision modular arithmetic)
- **Bundler / Dev Server:** [Vite](https://vitejs.dev/) (Multi-Page App Architecture)
- **Icons & Effects:** [Lucide Icons](https://lucide.dev/), [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti), Web Audio API

---

## 👥 Developers & Academic Credits

- **Sachidananda**
- **Ravikumar**

*Designed for educational demonstration and visualization of classical and modern cryptography algorithms.*
