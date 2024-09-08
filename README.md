## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/forum-app.git
    cd forum-app
    ```

2. Install dependencies:

    ```bash
    pnpm install
    ```

3. Set up environment variables:

    Create a `.env` file in the root directory and add the following variables:

    ```env
    AUTH_SECRET="="
    AUTH_DISCORD_ID=""
    AUTH_DISCORD_SECRET=""
    AUTH_GITHUB_ID=""
    AUTH_GITHUB_SECRET=""
    DATABASE_URL="postgres://[user]:[password]@[host]:[port][/dbname]"
    AUTH_TRUST_HOST="http://localhost:3000"
    ```

4. Start the development server:

    ```bash
    pnpm dev
    ```

    The application should now be running on [http://localhost:3000](http://localhost:3000).