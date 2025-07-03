# README-GPT Chrome Extension

README-GPT is a Chrome extension that enhances GitHub repositories with intelligent, AI-powered explanations using Groq’s ultra-fast LLM. It fetches key project files and generates detailed summaries directly in the browser — no setup or API key required from the user.

---

## Features

- Smart repository analysis using GitHub public APIs  
- AI-powered explanations using Groq's Llama3-70B model  
- Seamless GitHub integration with a native-style button  
- Clean, responsive UI that matches GitHub's design  
- Automatically identifies and fetches key files (README.md, package.json, Dockerfile, etc.)  
- Multi-language support for JavaScript, Python, Go, Rust, and more  

---

## Installation

### Development Mode

1. Clone or download this repository  
   ```bash
   git clone https://github.com/yourusername/readme-gpt
   cd readme-gpt
   ```

2. Open Chrome and navigate to `chrome://extensions/`  
3. Enable **Developer mode** using the toggle in the top-right  
4. Click **"Load unpacked"** and select the `readme-gpt` folder  

The extension is now installed and ready to use.

---

## Usage

1. Navigate to any GitHub repository (e.g., https://github.com/facebook/react)  
2. Look for the **"Explain this repo"** button near the **Star** button  
3. Click the button to trigger AI analysis  
4. A modal will appear with a detailed explanation of the repository

---

## Screenshots

### 1. Extension Button on GitHub

This shows the "Explain this repo" button seamlessly integrated into the GitHub UI, next to the Star button.


![Loading Screen](https://github.com/user-attachments/assets/87cf5a71-4ec7-49b3-8140-082cf8ef35db)
---

### 2. Loading Screen While Analyzing

A modern loading screen with a spinner appears while the extension fetches data and contacts the Groq API.

![AI Output](https://github.com/user-attachments/assets/7bf76bc3-a969-42d0-adf3-786658424d69)

---

### 3. AI-Generated Explanation Output

Once complete, a styled modal shows the full explanation including features, setup instructions, tech stack, and more.


![Explain Button](https://github.com/user-attachments/assets/f150c173-ce75-4911-bdeb-0b2931f0875e)

---

### 4. Full Modal UI in Context

Complete view of the output modal inside the GitHub page.

![Modal Overview](https://github.com/user-attachments/assets/ed1bdcbe-2842-4114-a887-847d40bcd284)

---

## How It Works

### Repository Analysis

- Retrieves metadata and content from GitHub via public API
- Detects and fetches key project files like:
  - README.md
  - package.json
  - requirements.txt
  - Dockerfile
  - and more
- Structures and sends this content to Groq's LLM for analysis

### AI Prompt Construction

- Combines metadata, file contents, and structure
- Sends a prompt to Groq for a comprehensive explanation

### Response Formatting

- Explanation includes:
  - Repository overview
  - Key features
  - Technology stack
  - Architecture
  - Getting started
  - Contribution guidelines
  - Use cases

---

## File Structure

```
readme-gpt/
├── manifest.json       # Extension manifest (V3)
├── content.js          # Core logic and DOM injection
├── popup.html          # Extension popup UI
├── popup.js            # Popup logic
├── styles.css          # Modal and button styling
└── README.md           # This file
```

---

## Technical Details

### APIs Used

- GitHub REST API for repository data  
- Groq API (Llama3-70B model) for AI explanations  

### Permissions

- `activeTab` – Access the active browser tab  
- `host_permissions` – Required for GitHub and Groq domains  

---

## Supported File Types

- README.md  
- package.json  
- requirements.txt  
- Cargo.toml  
- go.mod  
- pom.xml  
- build.gradle  
- Gemfile  
- composer.json  
- Dockerfile  
- docker-compose.yml  
- Makefile  
- CMakeLists.txt  
- setup.py  
- pyproject.toml  

---

## Security

- No API key required from users  
- Only GitHub and Groq APIs are accessed  
- No third-party server interaction  
- All logic runs client-side  

---

## Error Handling

Handles:

- Rate limits from Groq or GitHub  
- Missing files or metadata  
- Network failures or API outages  
- Invalid or malformed repository pages  

---

## Performance

- Parallel file fetching  
- Optimized prompt construction  
- Lightweight and responsive UI  
- Fast AI generation using Groq’s infrastructure  

---

## Contributing

Ways to contribute:

- Submit bug reports or feature requests  
- Improve UI/UX  
- Add support for new file types  
- Refactor prompt logic or error handling  

---

## License

This project is licensed under the MIT License.

---

## Support

If something isn’t working:

1. Confirm you're on a GitHub repository page  
2. Open browser console for errors  
3. Verify extension is enabled  
4. Check your network connection  
