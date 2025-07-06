// Content script for README-GPT Chrome extension
(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    buttonId: 'readme-gpt-explain-btn',
    buttonText: 'Explain this repo',
    buttonClass: 'readme-gpt-btn',
    modalId: 'readme-gpt-modal',
    modalClass: 'readme-gpt-modal',
    loadingId: 'readme-gpt-loading',
    loadingClass: 'readme-gpt-loading'
  };

  // GitHub API configuration
  const GITHUB_API = {
    baseUrl: 'https://api.github.com',
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'README-GPT-Chrome-Extension'
    }
  };

  // Groq API configuration
  const GROQ_API = {
    baseUrl: 'https://api.groq.com/openai/v1',
    model: 'llama3-70b-8192',
    apiKey: 'YOUR_API_KEY',
    maxTokens: 2000,
    temperature: 0.7
  };

  // Key files to analyze (in order of priority)
  const KEY_FILES = [
    'README.md',
    'package.json',
    'requirements.txt',
    'Cargo.toml',
    'go.mod',
    'pom.xml',
    'build.gradle',
    'Gemfile',
    'composer.json',
    'Dockerfile',
    'docker-compose.yml',
    'Makefile',
    'CMakeLists.txt',
    'setup.py',
    'pyproject.toml'
  ];

  // Check if we're on a GitHub repository page
  function isRepositoryPage() {
    return window.location.hostname === 'github.com' && 
           window.location.pathname.split('/').length >= 3;
  }

  // Get repository information from the current page
  function getRepositoryInfo() {
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    if (pathParts.length >= 2) {
      return {
        owner: pathParts[0],
        repo: pathParts[1]
      };
    }
    return null;
  }

  // Create the explain button
  function createExplainButton() {
    const button = document.createElement('button');
    button.id = CONFIG.buttonId;
    button.className = CONFIG.buttonClass;
    button.type = 'button';

    // Minimal spark/star SVG icon (GitHub-style, single color)
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('class', 'readme-gpt-icon');
    icon.setAttribute('viewBox', '0 0 14 14');
    icon.setAttribute('width', '14');
    icon.setAttribute('height', '14');
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = `
      <g>
        <path d="M7 0.5l1.3 3.2 3.5.3-2.7 2.2.9 3.4L7 7.5l-3 2.1.9-3.4-2.7-2.2 3.5-.3z" fill="#fff" stroke="#fff" stroke-width="0.7"/>
      </g>
    `;

    // Button text
    const span = document.createElement('span');
    span.textContent = 'Explain this repo';

    button.appendChild(icon);
    button.appendChild(span);
    button.addEventListener('click', handleExplainClick);
    return button;
  }

  // Find the best location to inject the button (near the Star button)
  function findInjectionTarget() {
    // Try multiple selectors to find the star button area
    const selectors = [
      '.pagehead-actions',
      '.starring-container',
      '.js-social-container',
      '[data-testid="repository-actions"]'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        return element;
      }
    }

    // Fallback: look for any button with "Star" text
    const starButton = Array.from(document.querySelectorAll('button')).find(
      btn => btn.textContent.includes('Star') || btn.textContent.includes('Unstar')
    );
    
    return starButton ? starButton.parentElement : null;
  }

  // Inject the button into the page
  function injectButton() {
    if (document.getElementById(CONFIG.buttonId)) {
      return; // Button already exists
    }

    // Find the Star button
    const starButton = Array.from(document.querySelectorAll('button')).find(
      btn => btn.textContent.includes('Star') || btn.textContent.includes('Unstar')
    );
    if (starButton && starButton.parentElement) {
      // Insert after the Star button for perfect alignment
      const explainBtn = createExplainButton();
      starButton.parentElement.insertBefore(explainBtn, starButton.nextSibling);
      return;
    }

    // Fallback: use previous logic
    const target = findInjectionTarget();
    if (!target) {
      console.log('README-GPT: Could not find injection target');
      return;
    }
    const button = createExplainButton();
    target.appendChild(button);
  }

  // Fetch repository data from GitHub API
  async function fetchRepositoryData(repoInfo) {
    const { owner, repo } = repoInfo;
    
    try {
      // Fetch repository metadata
      const repoResponse = await fetch(`${GITHUB_API.baseUrl}/repos/${owner}/${repo}`, {
        headers: GITHUB_API.headers
      });

      if (!repoResponse.ok) {
        throw new Error(`GitHub API error: ${repoResponse.status}`);
      }

      const repoData = await repoResponse.json();

      // Fetch repository contents (files in root directory)
      const contentsResponse = await fetch(`${GITHUB_API.baseUrl}/repos/${owner}/${repo}/contents`, {
        headers: GITHUB_API.headers
      });

      if (!contentsResponse.ok) {
        throw new Error(`GitHub API error: ${contentsResponse.status}`);
      }

      const contents = await contentsResponse.json();

      // Get available files
      const availableFiles = contents
        .filter(item => item.type === 'file')
        .map(item => item.name);

      // Fetch key files content
      const fileContents = {};
      for (const fileName of KEY_FILES) {
        if (availableFiles.includes(fileName)) {
          try {
            const fileResponse = await fetch(`${GITHUB_API.baseUrl}/repos/${owner}/${repo}/contents/${fileName}`, {
              headers: GITHUB_API.headers
            });

            if (fileResponse.ok) {
              const fileData = await fileResponse.json();
              // Decode base64 content
              fileContents[fileName] = atob(fileData.content);
            }
          } catch (error) {
            console.warn(`Failed to fetch ${fileName}:`, error);
          }
        }
      }

      return {
        repository: repoData,
        fileContents,
        availableFiles
      };

    } catch (error) {
      console.error('Error fetching repository data:', error);
      throw error;
    }
  }

  // Construct prompt for Groq
  function constructPrompt(repoData) {
    const { repository, fileContents } = repoData;
    
    let prompt = `Please analyze this GitHub repository and provide a comprehensive explanation.

Repository Information:
- Name: ${repository.full_name}
- Description: ${repository.description || 'No description provided'}
- Language: ${repository.language || 'Not specified'}
- Stars: ${repository.stargazers_count}
- Forks: ${repository.forks_count}
- Created: ${new Date(repository.created_at).toLocaleDateString()}
- Last updated: ${new Date(repository.updated_at).toLocaleDateString()}
- License: ${repository.license?.name || 'Not specified'}
- Topics: ${repository.topics?.join(', ') || 'None'}

`;

    // Add README content if available
    if (fileContents['README.md']) {
      prompt += `README.md Content:
\`\`\`markdown
${fileContents['README.md']}
\`\`\`

`;
    }

    // Add package.json if available
    if (fileContents['package.json']) {
      prompt += `package.json Content:
\`\`\`json
${fileContents['package.json']}
\`\`\`

`;
    }

    // Add other key files
    const otherFiles = Object.keys(fileContents).filter(file => 
      file !== 'README.md' && file !== 'package.json'
    );

    if (otherFiles.length > 0) {
      prompt += `Other Key Files:\n`;
      for (const fileName of otherFiles) {
        prompt += `${fileName}:
\`\`\`
${fileContents[fileName]}
\`\`\`

`;
      }
    }

    prompt += `Please provide a comprehensive analysis including:

1. **Repository Overview**: What is this project about? What problem does it solve?
2. **Key Features**: What are the main features and capabilities?
3. **Technology Stack**: What technologies, frameworks, and tools are used?
4. **Architecture**: How is the project structured? (if discernible from the files)
5. **Getting Started**: How would someone get started with this project?
6. **Use Cases**: What are the typical use cases for this project?
7. **Contributing**: How can developers contribute to this project?

Please format your response in a clear, structured manner with appropriate headings and bullet points. Focus on being helpful for developers who want to understand and potentially use or contribute to this repository.`;

    return prompt;
  }

  // Call Groq API
  async function callGroq(prompt) {
    try {
      const response = await fetch(`${GROQ_API.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: GROQ_API.model,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful AI assistant that analyzes GitHub repositories and provides clear, comprehensive explanations for developers.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: GROQ_API.maxTokens,
          temperature: GROQ_API.temperature
        })
      });

      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (e) {}
        const errorMsg = errorData.error?.message || response.statusText || '';
        // Graceful handling for rate limit/quota errors
        if (
          response.status === 429 ||
          response.status === 403 ||
          /limit|quota|rate|exceeded|over/i.test(errorMsg)
        ) {
          throw new Error(
            'The AI service is currently rate-limited or over quota. Please try again in a few minutes. If this persists, check your API usage or try later.'
          );
        }
        throw new Error(`Groq API error: ${errorMsg}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;

    } catch (error) {
      // If error is a rate limit/quota error, show a friendlier message
      if (
        /rate-limited|over quota|limit|quota|exceeded/i.test(error.message)
      ) {
        // Try to extract wait time from the error message
        let waitTime = null;
        let match = error.message.match(/try again in ([\d.]+)s/i);
        if (match && match[1]) {
          waitTime = Math.ceil(parseFloat(match[1]));
        }
        let message = `<p>You've hit the Groq rate limit for this model.`;
        if (waitTime) {
          message += `<br>Please wait <strong>${waitTime} second${waitTime === 1 ? '' : 's'}</strong> and try again.`;
        } else {
          message += `<br>Please try again in a few minutes.`;
        }
        message += `</p>`;
        showModal(
          'AI Service Limit Reached',
          message
        );
        return null;
      }
      throw error;
    }
  }

  // Handle button click
  async function handleExplainClick() {
    const repoInfo = getRepositoryInfo();
    if (!repoInfo) {
      showError('Could not determine repository information');
      return;
    }

    showLoading();
    
    try {
      // Fetch repository data
      const repoData = await fetchRepositoryData(repoInfo);
      
      // Construct prompt
      const prompt = constructPrompt(repoData);
      
      // Call Groq API
      const explanation = await callGroq(prompt);
      
      // Display the explanation
      hideLoading();
      if (explanation) {
        showModal('Repository Analysis', explanation);
      }
      
    } catch (error) {
      hideLoading();
      showError('Failed to analyze repository: ' + error.message);
    }
  }

  // Show loading indicator
  function showLoading() {
    const loading = document.createElement('div');
    loading.id = CONFIG.loadingId;
    loading.className = CONFIG.loadingClass;
    loading.innerHTML = `
      <div class="readme-gpt-loading-content">
        <div class="readme-gpt-spinner"></div>
        <p>Analyzing repository</p>
      </div>
    `;
    document.body.appendChild(loading);
  }

  // Hide loading indicator
  function hideLoading() {
    const loading = document.getElementById(CONFIG.loadingId);
    if (loading) {
      loading.remove();
    }
  }

  // Show modal with content
  function showModal(title, content) {
    const modal = document.createElement('div');
    modal.id = CONFIG.modalId;
    modal.className = CONFIG.modalClass;
    
    // Convert markdown-like content to HTML
    const formattedContent = formatContent(content);
    
    modal.innerHTML = `
      <div class="readme-gpt-modal-content">
        <div class="readme-gpt-modal-header">
          <h3>${title}</h3>
          <button class="readme-gpt-close-btn">&times;</button>
        </div>
        <div class="readme-gpt-modal-body">
          ${formattedContent}
        </div>
      </div>
    `;

    // Add close functionality
    const closeBtn = modal.querySelector('.readme-gpt-close-btn');
    closeBtn.addEventListener('click', () => modal.remove());
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    document.body.appendChild(modal);
  }

  // Format content for display (basic markdown to HTML conversion)
  function formatContent(content) {
    return content
      // Headers
      .replace(/^### (.*$)/gim, '<h4>$1</h4>')
      .replace(/^## (.*$)/gim, '<h3>$1</h3>')
      .replace(/^# (.*$)/gim, '<h2>$1</h2>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Lists
      .replace(/^\* (.*$)/gim, '<li>$1</li>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      // Paragraphs
      .replace(/\n\n/g, '</p><p>')
      // Wrap in paragraph tags
      .replace(/^(.+)$/gm, '<p>$1</p>')
      // Clean up empty paragraphs
      .replace(/<p><\/p>/g, '')
      // Clean up list items
      .replace(/<p><li>/g, '<li>')
      .replace(/<\/li><\/p>/g, '</li>')
      // Wrap consecutive list items in ul tags
      .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
  }

  // Show error message
  function showError(message) {
    showModal('Error', message);
  }

  // Initialize the extension
  function init() {
    if (!isRepositoryPage()) {
      return;
    }

    // Wait for the page to load completely
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectButton);
    } else {
      injectButton();
    }

    // Handle dynamic page changes (GitHub uses SPA-like navigation)
    const observer = new MutationObserver(() => {
      if (isRepositoryPage() && !document.getElementById(CONFIG.buttonId)) {
        setTimeout(injectButton, 1000); // Small delay to ensure page is ready
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Start the extension
  init();
})(); 
