# README-GPT Chrome Extension

A Chrome browser extension that enhances GitHub repositories with AI-powered explanations using Groq.

## Features

- **Smart Repository Analysis**: Fetches README.md and key files from GitHub repositories
- **AI-Powered Explanations**: Uses Groq's ultra-fast LLM to generate detailed explanations
- **Seamless Integration**: Injects an "Explain this repo" button directly into GitHub pages
- **No Configuration Required**: Works out of the box with pre-configured AI access
- **Modern UI**: Clean, responsive design that matches GitHub's aesthetic
- **Multi-Language Support**: Analyzes repositories in various programming languages
- **Intelligent File Detection**: Automatically identifies and analyzes key project files

## Installation

### Development Mode

1. **Clone or download this repository**
   ```bash
   git clone <repository-url>
   cd readme-gpt
   ```

2. **Open Chrome and navigate to Extensions**
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)

3. **Load the extension**
   - Click "Load unpacked"
   - Select the `readme-gpt` folder containing the extension files

4. **Start using immediately**
   - No API key configuration needed!
   - The extension is ready to use with Groq's ultra-fast LLM

## Usage

1. **Navigate to any GitHub repository**
   - Go to a repository like `https://github.com/username/repo-name`

2. **Click the "Explain this repo" button**
   - The button appears near the "Star" button in the repository header
   - Click it to start the AI analysis

3. **View the explanation**
   - A modal will appear with the AI-generated explanation
   - The explanation includes repository overview, key features, and technical details

## How It Works

### Repository Analysis
The extension analyzes repositories by:

1. **Fetching Repository Metadata**: Uses GitHub's public API to get repository information
2. **Identifying Key Files**: Looks for important files like:
   - `README.md` - Project documentation
   - `package.json` - Node.js dependencies and scripts
   - `requirements.txt` - Python dependencies
   - `Cargo.toml` - Rust project configuration
   - `go.mod` - Go module dependencies
   - `Dockerfile` - Container configuration
   - And many more...

3. **Content Extraction**: Fetches and decodes the content of key files
4. **AI Analysis**: Sends structured data to Groq for comprehensive analysis

### AI Prompt Construction
The extension constructs intelligent prompts that include:
- Repository metadata (stars, forks, language, topics)
- README content for project description
- Configuration files for technology stack analysis
- File structure for architectural insights

### Response Formatting
Groq responses are formatted to include:
- **Repository Overview**: What the project does and its purpose
- **Key Features**: Main capabilities and functionality
- **Technology Stack**: Technologies, frameworks, and tools used
- **Architecture**: Project structure and organization
- **Getting Started**: How to set up and run the project
- **Use Cases**: Typical applications and scenarios
- **Contributing**: How developers can contribute

## File Structure

```
readme-gpt/
├── manifest.json      # Extension configuration (Manifest V3)
├── content.js         # Content script with Groq AI integration
├── popup.html         # Extension information popup
├── popup.js           # Popup script for extension status
├── styles.css         # Styling for buttons, modals, and UI components
└── README.md          # This file
```

## Technical Details

### APIs Used
- **GitHub API**: Fetches repository data and file contents
- **Groq API**: Generates intelligent explanations

### Permissions
- `activeTab`: For accessing the current GitHub tab
- `host_permissions`: For GitHub and Groq API access

### Browser Compatibility
- Chrome 88+ (Manifest V3 support)
- Edge 88+ (Chromium-based)
- Other Chromium-based browsers

### Supported File Types
The extension analyzes these file types (in order of priority):
- `README.md` - Project documentation
- `package.json` - Node.js projects
- `requirements.txt` - Python projects
- `Cargo.toml` - Rust projects
- `go.mod` - Go projects
- `pom.xml` - Maven projects
- `build.gradle` - Gradle projects
- `Gemfile` - Ruby projects
- `composer.json` - PHP projects
- `Dockerfile` - Container projects
- `docker-compose.yml` - Multi-container projects
- `Makefile` - Build automation
- `CMakeLists.txt` - CMake projects
- `setup.py` - Python setup
- `pyproject.toml` - Modern Python projects

## Security

- No API keys required from users
- Uses pre-configured Groq API access
- No data is sent to external servers except GitHub and Groq APIs
- All API requests are made directly from the content script
- GitHub API calls use public endpoints (no authentication required)

## Error Handling

The extension includes comprehensive error handling for:
- Network connectivity issues
- GitHub API rate limits
- Groq API errors
- Invalid repository URLs
- Missing or inaccessible files

## Performance

- Efficient file fetching with parallel requests
- Smart caching of repository data
- Optimized prompt construction
- Responsive UI with loading indicators
- Ultra-fast AI responses with Groq

## Contributing

This extension is now feature-complete! However, you can still contribute by:
- Reporting bugs or issues
- Suggesting improvements to the AI prompts
- Adding support for additional file types
- Enhancing the UI/UX
- Improving error handling

## License

MIT License - feel free to use and modify as needed.

## Support

If you encounter any issues:
1. Ensure you're on a valid GitHub repository page
2. Check the browser console for any error messages
3. Verify that the extension has the necessary permissions
4. Make sure you have an active internet connection

## AI Model

This extension uses **Groq's Llama3-70B-8192**, an ultra-fast LLM that provides:
- Lightning-fast response times
- Comprehensive repository analysis
- Natural language explanations
- Technical insights and recommendations
- Multi-language code understanding
- Context-aware responses 