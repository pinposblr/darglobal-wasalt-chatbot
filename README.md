# DarGlobal & Wasalt AI Chatbot

An AI-powered luxury real estate chatbot built with scraped data from [DarGlobal](https://www.darglobal.co.uk) and [Wasalt](https://www.wasalt.com), designed to answer questions about luxury real estate projects, properties, brand partnerships, and investment opportunities across 7 international markets.

## 🌐 Live Demo & Repository

- **Live URL:** [https://task-theta-orpin.vercel.app](https://task-theta-orpin.vercel.app)
- **GitHub Repository:** [https://github.com/pinposblr/darglobal-wasalt-chatbot](https://github.com/pinposblr/darglobal-wasalt-chatbot)

---

## 🌟 Key Features

- **AI-Powered Luxury Real Estate Concierge**: Integrated with OpenRouter (`z-ai/glm-5.3-flash`) for deep, context-aware responses.
- **Comprehensive Knowledge Base**: Scraped data covering **23+ projects** across **7 countries** (UAE, Saudi Arabia, Qatar, Spain, Oman, UK, Maldives), **12+ brand partners**, corporate disclosures, and Wasalt platform features.
- **Ultra-Premium UI/UX**: Custom dark-mode interface with gold accents, responsive design, markdown rendering (tables, links, badges), typing indicator, and suggestion chips.
- **Containerized**: Production-ready multi-stage `Dockerfile` and `docker-compose.yml`.
- **Deployed on Vercel**: High-performance edge deployment.

---

## 🏗️ Architecture & Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS v4, Custom CSS Design System |
| **AI Integration** | OpenRouter API (`z-ai/glm-5.3-flash` & customizable) |
| **Data Ingestion** | Scraped data from DarGlobal & Wasalt stored in structured TS knowledge base |
| **Containerization** | Multi-stage Docker (Node.js 20 Alpine) & Docker Compose |
| **Deployment** | Vercel Serverless Platform |

---

## 📂 Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/chat/route.ts       # Secure AI chat endpoint with system grounding
│   │   ├── globals.css             # Luxury real estate design system
│   │   ├── layout.tsx              # SEO metadata and layout
│   │   └── page.tsx                # Chatbot interface with suggestion chips
│   └── data/
│       └── knowledge-base.ts       # Scraped knowledge base from DarGlobal & Wasalt
├── Dockerfile                      # Multi-stage production container build
├── docker-compose.yml              # Container orchestration
├── .env.example                    # Environment variable template
├── next.config.ts                  # Standalone / Vercel conditional config
└── README.md                       # Documentation
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm
- OpenRouter API key

### 1. Local Development

```bash
# Clone the repository
git clone https://github.com/pinposblr/darglobal-wasalt-chatbot.git
cd darglobal-wasalt-chatbot

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Add your OPENROUTER_API_KEY in .env.local

# Run dev server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

### 2. Docker Deployment

```bash
# Build and run container with Docker Compose
docker-compose up --build -d

# Check running container
docker ps
```

Access the chatbot at `http://localhost:3000`.

---

## 📊 Data Sources & Scraped Coverage

1. **DarGlobal (darglobal.co.uk)**:
   - Corporate background (LSE listing, $23B portfolio, 32-year track record, CEO Ziad Elchaar).
   - Project directory (Trump International Hotel & Tower Dubai, Da Vinci Tower by Pagani, The Astera by Aston Martin, Tierra Viva Benahavis by Lamborghini, AIDA Muscat Masterplan with FENDI Casa Azure Oceanfront Villas, Rayana Trump Mansions Riyadh, Amaya Trump Plaza Jeddah, One Mayfair London, Maldives resort).
   - Recent 2026 press releases & financial disclosures (Emirates NBD $250M syndicated loan, Gulf Asia Contracting podium appointment).
2. **Wasalt (wasalt.com / wasalt.sa)**:
   - Proptech platform capabilities, digital listings, filter tools, contact channels.

---

## 📄 License

MIT License.
