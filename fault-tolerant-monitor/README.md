# Fault-Tolerant System Monitor

## How to run this on your own machine

1. Make sure you have Node.js 18+ installed (for native fetch support).
2. Open a terminal in this folder and run:

   npm install
   npm start

3. You should see a report checking two working endpoints and one broken one,
   with all three handled gracefully thanks to Promise.allSettled.