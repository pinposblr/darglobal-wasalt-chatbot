# DarGlobal & Wasalt AI Chatbot

An AI-powered chatbot built with scraped data from [DarGlobal](https://www.darglobal.co.uk) and [Wasalt](https://www.wasalt.com), designed to answer questions about luxury real estate projects, properties, brand partnerships, and investment opportunities.

## Features

- **AI-Powered Conversations**: Uses OpenRouter (Meta Llama 3.1 8B) for intelligent, context-aware responses
- **Comprehensive Knowledge Base**: Scraped data from DarGlobal and Wasalt covering 23+ projects across 7 international markets
- **Premium UI**: Dark theme with gold accents, smooth animations, and responsive design
- **Real-time Chat**: Typing indicators, message history, and markdown rendering
- **Docker Ready**: Fully containerized with multi-stage builds
- **Deployed on Vercel**: Accessible online

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS + Custom CSS
- **AI**: OpenRouter API (Meta Llama 3.1 8B Instruct - Free)
- **Containerization**: Docker with multi-stage builds
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- OpenRouter API key (free at https://openrouter.ai)

### Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and add your `OPENROUTER_API_KEY`
4. Run: `npm run dev`
5. Open http://localhost:3000

### Docker Deployment

```bash
export OPENROUTER_API_KEY=your_key_here
docker-compose up --build -d
```

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add `OPENROUTER_API_KEY` to Environment Variables
4. Deploy

## Data Sources

Data scraped from:
- **DarGlobal** (darglobal.co.uk): Company info, 23+ luxury projects, news, investor relations
- **Wasalt** (wasalt.com): Platform features, digital services, property listings

## License

MIT
