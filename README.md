# Yopem Search

A self-hosted, privacy-focused search engine with instant answers, multiple
search categories, and powerful features. Built with Next.js and powered by
SearXNG, it provides a clean, distraction-free search experience with
calculator, unit converter, weather information, and more.

![preview](https://raw.githubusercontent.com/yopem/search/main/preview.png)

## Features

### Privacy-First Search

Self-hosted search engine that doesn't track your searches. Powered by SearXNG,
aggregating results from multiple search engines while protecting your privacy.

### Instant Answers

Get immediate answers without visiting external websites. Built-in calculator,
unit converter, and weather information for common queries.

### Multiple Search Categories

Search across different content types:

- **General** - Traditional web search results
- **Images** - Visual search with full-screen viewer
- **Videos** - Video search with metadata
- **News** - Latest news articles

### Bang Syntax

Quickly redirect searches to specific sites using bang syntax (e.g.,
`!gh next.js` to search GitHub, `!mdn fetch api` to search MDN).

### Advanced Filters

Refine your search with:

- Time range filters (past day, week, month, year)
- Region-specific results
- Safe search levels
- Search history tracking

### Clean Interface

Beautiful, distraction-free interface with:

- Dark/light theme support
- Keyboard shortcuts for navigation
- Responsive design
- Related searches suggestions

## Tech Stack

- **Runtime**: Bun
- **Framework**: Next.js 16
- **Language**: TypeScript
- **UI**: React 19, Tailwind CSS, cossui
- **Database**: PostgreSQL with Drizzle ORM
- **API**: oRPC with TanStack React Query
- **Authentication**: OpenAuth
- **Search Engine**: SearXNG
- **State Management**: nuqs

## Prerequisites

- [Bun](https://bun.sh) 1.3 or higher
- PostgreSQL database
- [Docker](https://docs.docker.com/engine/install/) (for running SearXNG)
- Git
- **OpenAuth Issuer** - Required for authentication
  ([setup guide](https://openauth.js.org/docs/issuer/))
- **Weather API Key** - Optional, for weather instant answers

## Installation

1. **Clone the repository**

```bash
git clone https://github.com/yopem/search.git
cd search
```

2. **Install dependencies**

```bash
bun install
```

3. **Set up environment variables**

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and configure the required variables (see
[Environment Variables](#environment-variables) section below).

4. **Run database migrations**

```bash
bun run db:generate && bun run db:migrate
```

5. **Start SearXNG**

You need a running SearXNG instance. You can use the provided Dockerfile:

**Build the SearXNG Docker image:**

```bash
docker build -f Dockerfile.searxng -t searxng-custom .
```

**Run the SearXNG container:**

```bash
docker run -d \
  --name searxng \
  -p 3600:3600 \
  searxng-custom
```

The SearXNG instance will be available at `http://localhost:3600`. Make sure to
set `SEARXNG_URL=http://localhost:3600` in your `.env` file.

**Stop and remove the container:**

```bash
docker stop searxng
docker rm searxng
```

6. **Start the development server**

```bash
bun run dev
```

7. **Access the application**

Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

## Environment Variables

### Required Variables

| Variable              | Description                                                       | Example                                            |
| --------------------- | ----------------------------------------------------------------- | -------------------------------------------------- |
| `DATABASE_URL`        | PostgreSQL connection string                                      | `postgresql://user:password@localhost:5432/search` |
| `AUTH_ISSUER`         | OpenAuth issuer URL (see [OpenAuth Setup](#openauth-setup) below) | `https://auth.example.com`                         |
| `NEXT_PUBLIC_API_URL` | Public API URL                                                    | `https://search.example.com`                       |
| `SEARXNG_URL`         | SearXNG instance URL                                              | `http://localhost:3600`                            |

### OpenAuth Setup

Yopem Search uses [OpenAuth](https://openauth.js.org/) for authentication. You
need to set up an OpenAuth issuer to handle user authentication.

#### Setting Up Your Issuer

1. **Follow the official guide**: Visit
   [OpenAuth Issuer Documentation](https://openauth.js.org/docs/issuer/) for
   detailed setup instructions

2. **Deploy your issuer**: You can deploy an OpenAuth issuer using:
   - Your own server
   - Serverless platforms (AWS Lambda, Cloudflare Workers, etc.)
   - Container platforms (Docker, Kubernetes)

3. **Configure the `AUTH_ISSUER` variable**: Once your issuer is running, set
   the `AUTH_ISSUER` environment variable to your issuer's URL:

   ```bash
   AUTH_ISSUER=https://your-auth-issuer-domain.com
   ```

4. **Important**: Without a properly configured OpenAuth issuer, the application
   will not be able to authenticate users and login functionality will not work.

#### Quick Start for Development

For local development, you can run an OpenAuth issuer locally. Refer to the
[OpenAuth documentation](https://openauth.js.org/docs/issuer/) for local setup
instructions.

### Optional Variables

| Variable                        | Description                                 |
| ------------------------------- | ------------------------------------------- |
| `REDIS_URL`                     | Redis connection string (for caching)       |
| `WEATHER_API_KEY`               | Weather API key for weather instant answers |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics measurement ID             |
| `NEXT_PUBLIC_UMAMI_TRACKING_ID` | Umami Analytics tracking ID                 |
| `NEXT_PUBLIC_LOGO_URL`          | Custom logo URL                             |
| `NEXT_PUBLIC_LOGO_OG_URL`       | Custom Open Graph logo URL                  |
| `NEXT_PUBLIC_SITE_TITLE`        | Custom site title                           |
| `NEXT_PUBLIC_SITE_DESCRIPTION`  | Custom site description                     |
| `NEXT_PUBLIC_SITE_DOMAIN`       | Site domain                                 |
| `NEXT_PUBLIC_SITE_TAGLINE`      | Site tagline                                |
| `NEXT_PUBLIC_SUPPORT_EMAIL`     | Support email address                       |
| `CF_ACCOUNT_ID`                 | Cloudflare R2 account ID                    |
| `R2_ACCESS_KEY`                 | Cloudflare R2 access key                    |
| `R2_SECRET_KEY`                 | Cloudflare R2 secret key                    |
| `R2_BUCKET`                     | Cloudflare R2 bucket name                   |
| `R2_DOMAIN`                     | Cloudflare R2 domain                        |

For a complete list of environment variables, see [.env.example](.env.example).

## Usage

1. **Access the application** at `http://localhost:3000`

2. **Create an account or log in** using the authentication system

3. **Start searching**:
   - Enter your query in the search box
   - Use instant answers for calculations, conversions, and weather
   - Try bang syntax for quick redirects (e.g., `!gh react`)

4. **Apply filters**:
   - Click on category tabs (General, Images, Videos, News)
   - Use time range filters for recent results
   - Select region for localized results
   - Adjust safe search settings

5. **Use instant answers**:
   - Calculator: `2+2`, `sqrt(16)`, `sin(1.5)`
   - Unit Converter: `10 km to miles`, `100 celsius to fahrenheit`
   - Weather: `weather jakarta`, `tokyo weather`

6. **Keyboard shortcuts**:
   - `/` - Focus search input
   - `Esc` - Unfocus search input
   - `1-4` - Switch between category tabs
   - Arrow keys - Navigate image viewer

For detailed features and usage guide, see
[SEARCH_FEATURES.md](SEARCH_FEATURES.md).

## Available Commands

| Command                | Description                                      |
| ---------------------- | ------------------------------------------------ |
| `bun run dev`          | Start development server with Turbopack          |
| `bun run build`        | Build for production                             |
| `bun run start`        | Start production server                          |
| `bun run lint`         | Run ESLint                                       |
| `bun run lint:fix`     | Run ESLint with auto-fix                         |
| `bun run typecheck`    | Run TypeScript type checking                     |
| `bun run format:write` | Format code with Prettier                        |
| `bun run format:check` | Check code formatting                            |
| `bun run db:studio`    | Open Drizzle Studio (database GUI)               |
| `bun run db:migrate`   | Run database migrations                          |
| `bun run db:push`      | Push schema changes to database                  |
| `bun run db:generate`  | Generate new migration                           |
| `bun run check`        | Run all quality checks (lint, typecheck, format) |
| `bun run preview`      | Build and start production preview               |

## License

This project is licensed under the [AGPL-3.0-or-later](LICENSE.md) license. This
is a copyleft license that requires any derivative works to be distributed under
the same license terms.

## Acknowledgments

- [SearXNG](https://github.com/searxng/searxng) - Privacy-respecting metasearch
  engine
- [OpenAuth](https://openauth.js.org/) - Modern authentication framework
- [Next.js](https://nextjs.org/) - React framework
