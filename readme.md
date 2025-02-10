# Musyncc

Musyncc is a web-based platform that enables users to sync their music playback in real time. Whether you're hosting a virtual party or sharing a playlist with friends, Musyncc makes it seamless to create or join rooms and enjoy music together.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Deployment](#deployment)
- [Contributing](#contributing)

## Features

- **Real-time Sync**: Enjoy synchronized music playback across all devices.
- **Live Chat**: Communicate with friends while listening.
- **Shared Control**: Take turns managing the playlist.
- **Cross-Platform Support**: Works on various devices and browsers.
- **No Installation Required**: Web-based platform with no downloads needed.

## Installation

### Prerequisites

- Node.js and npm installed.
- A WebSocket server (configured via `NEXT_PUBLIC_SOCKET_URL`).

### Steps

1. Clone the repository:

   ```sh
   git clone https://github.com/yourusername/musyncc.git
   ```

2. Navigate into the project folder:

   ```sh
   cd musyncc
   ```

3. Install dependencies for both the Next.js application and the WebSocket server:

   ```sh
   cd application && npm install
   cd ../socket && npm install
   ```

4. Set up environment variables:

   Create a .env file inside application folder and fill the neccessary variables. You can refer .env.example for more info.

5. Start both servers:

   ```sh
   cd socket && npm run dev &
   cd ../application && npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Enter a room code to join an existing session or create a new one.
2. Enjoy real-time music synchronization.
3. Use the chat feature to interact with others.

## Deployment

To deploy on a hosting service like Vercel:

```sh
npm run build
npm run start
```

## Contributing

Contributions are welcome! Feel free to open an issue, fork the repository and submit a pull request with improvements or new features.
