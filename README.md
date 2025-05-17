# **EtherSnake Game (Single-Player) - A Blockchain Twist on the Classic Snake**

Welcome to **EtherSnake Game**, a thrilling single-player snake adventure with a **blockchain twist**! 🐍✨ Get ready to control your very own snake, gobble up food to grow longer, and dodge AI bots in a fast-paced environment. But here’s the real kicker: **Earn rewards based on your survival time**, thanks to Ethereum smart contracts on the **Sepolia testnet**. Your snake skills can make you a blockchain hero! 🎮💰 Inspired By Noodle.gg / Slither.io

---

## 🚀 **Game Features**

### 🐍 **Single-Player Fun**

Control your snake, eat food, avoid bot snakes, and grow as you play. Your goal? Survive and earn the highest rewards possible. Can you be the slithering champion? 🏆

### 🤑 **On-Chain Rewards**

Play to earn **test ETH**! Yes, your performance is tied directly to the Ethereum blockchain — **the longer you survive, the bigger your reward**. Rewards are automatically distributed based on your survival time, recorded and verified via the smart contract.

### 🎮 **Phaser-Powered Gameplay**

Smooth, 2D canvas-based action powered by **Phaser** for fast-paced, physics-driven gameplay. The snake game you know and love, with a twist of **blockchain magic**!

### 💻 **Next.js Frontend with Tailwind CSS**

A modern, responsive UI built with **Next.js** and styled with **Tailwind CSS**. It’s sleek, it’s fast, and it looks amazing on all devices. You’re going to love the smooth user experience.

### 🤖 **AI Bots to Keep You on Your Toes**

Compete against cunning AI-controlled bot snakes, adding dynamic challenges and making every game unique. Don’t let them bite you!

### 🔐 **Wallet Integration**

Connect your **MetaMask wallet** to interact with the smart contract on the **Sepolia testnet**, play the game, and claim your rewards in test ETH. The blockchain knows no bounds!

---

## 🛠️ **Prerequisites**

Before you jump into the game, here’s what you need:

* **Node.js** (v18 or higher)
* **MetaMask**: Your key to the Sepolia testnet and connecting with Ethereum.
* **Sepolia Test ETH**: Grab some from a faucet like **Infura** or **Alchemy**.
* **Vercel Account**: For seamless deployment (free tier).
* **Hardhat**: To compile and deploy your smart contract with ease.

---

## 💻 **Installation Guide**

Ready to get started? Follow these easy steps:

1. **Clone the Repository**:

   ```bash
   git clone <your-repo-url>
   cd slither-game
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Set Up Your Environment**:
   Create a `.env.local` file in your root directory and add:

   ```env
   NEXT_PUBLIC_SEPOLIA_RPC_URL=<your-sepolia-rpc-url>
   NEXT_PUBLIC_CONTRACT_ADDRESS=<deployed-contract-address>
   PRIVATE_KEY=<your-wallet-private-key>
   ```

4. **Deploy Your Smart Contract**:
   First, compile your contract:

   ```bash
   npx hardhat compile
   ```

   Deploy it to the Sepolia testnet:

   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```

   Don’t forget to update `NEXT_PUBLIC_CONTRACT_ADDRESS` with the address of your deployed contract!

5. **Run the Game Locally**:
   Now, fire up the game in your browser:

   ```bash
   npm run dev
   ```

   Head over to `http://localhost:3000` and start playing!

---

## 🕹️ **Gameplay Walkthrough**

### 🔐 **Connect Your Wallet**

Make sure you’ve got MetaMask set up and connected to the Sepolia testnet. This is how you’ll interact with the blockchain and collect your rewards.

### 🎮 **Start Your Adventure**

Click **"Start Game"** and begin your journey. Use **arrow keys** or **WASD** to control your snake. It’s you vs. the bots—who’s going to be the ultimate snake?

### 🥇 **Create Events, Earn Prizes**

Want to spice things up? Hit the **"Create Event"** button to create a custom game session on-chain. Choose the prize pool and get ready for rewards based on how long you survive!

### 💸 **Earn Ethereum Rewards**

Survival time is recorded **off-chain**, but your rewards are 100% **on-chain**. Based on how long you last, rewards in **test ETH** are sent directly to your wallet after each event.

### 🏆 **View Your Stats**

Once the game ends, check out your survival time, total score, and earned rewards on the dashboard. Can you top the leaderboard? 📊

---

## 📂 **Project Structure**

Here's what the project looks like under the hood:

* **`contracts/`**: The **Solidity smart contract** that powers event creation and rewards distribution.
* **`pages/`**: Next.js pages for displaying the game and player dashboard.
* **`public/`**: All your static game assets (like images, sprites, etc.).
* **`scripts/`**: Hardhat deployment scripts for easy deployment.
* **`src/`**: This is where the **Phaser game logic** and frontend components live.
* **`styles/`**: Tailwind CSS config for creating that responsive, sleek design.

---

## ⚡ **Smart Contract Power**

The contract takes care of all the blockchain magic:

* **Event Creation**: Players can create a game event, set up a prize pool in test ETH, and start a session.
* **Survival Time Recording**: We record how long players survive off-chain, so you don’t have to worry about waiting for on-chain calculations.
* **Prize Distribution**: Rewards in **test ETH** are automatically distributed to players based on their survival time. It’s as simple as that!

---

## 💡 **Notes**

* **Single-Player Focus**: This game is built for one player with bots as opponents. It’s fast-paced, fun, and easy to pick up.
* **Off-Chain Gameplay Logic**: Thanks to Sepolia’s \~13-second block times, we keep the gameplay logic off-chain for optimal performance.
* **Test ETH**: Always have enough test ETH in your wallet to pay for gas fees when interacting with the contract.
* **Custom AI Bots**: Want tougher bots? You can modify their behavior by tweaking their speed and number in `src/game.js`.

---

## 🔨 **Built With**

* **Next.js** – The magic behind the smooth UI.
* **HTMLCanvas** – For all the 2D game physics and rendering.
* **Solidity** – Blockchain smart contracts that handle events and rewards.
* **ethers.js** – For easy interaction with Ethereum.
* **Tailwind CSS** – For that sleek, modern look!

---

Now, it’s your turn. **Play, survive, and conquer the blockchain!** 🐍🎮💸
