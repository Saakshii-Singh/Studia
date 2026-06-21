const fs = require("fs");
const path = require("path");
const https = require("https");

const dir = path.join(__dirname, "public", "sounds");

// Ensure the target directory exists
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Sound tracks to download from stable public GitHub / SoundHelix sources (never block hotlinking)
const sounds = {
  "rain.mp3": "https://raw.githubusercontent.com/karthiknvd/noctune/master/sounds/rain.mp3",
  "fireplace.mp3": "https://raw.githubusercontent.com/karthiknvd/noctune/master/sounds/campfire.mp3",
  "cafe.mp3": "https://raw.githubusercontent.com/daijinhai/StayFocused/main/public/sounds/cafe.mp3",
  "piano.mp3": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  "lofi.mp3": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
  "soft.mp3": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
};

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const options = {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
    };

    https.get(url, options, (response) => {
      // Handle redirects (HTTP 301/302)
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadFile(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Server returned status code ${response.statusCode}`));
        return;
      }

      response.pipe(file);
      file.on("finish", () => {
        file.close();
        resolve();
      });
    }).on("error", (err) => {
      fs.unlink(dest, () => {}); // Clean up file on error
      reject(err);
    });
  });
}

async function run() {
  console.log("🎵 Focus Room Local Sound Downloader");
  console.log("======================================");
  console.log(`Target directory: ${dir}\n`);

  for (const [filename, url] of Object.entries(sounds)) {
    const dest = path.join(dir, filename);
    console.log(` Downloading ${filename}...`);
    try {
      await downloadFile(url, dest);
      console.log(` Successfully saved ${filename}`);
    } catch (error) {
      console.error(` Failed to download ${filename}:`, error.message);
    }
  }

  console.log("\n Downloader finished!");
}

run();
