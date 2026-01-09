# 🤖 AI Setup Guide for Git Auto Commit

## Quick Start

The extension now supports **4 AI providers** to generate intelligent commit messages:

1. **OpenAI (ChatGPT)** - GPT-4o, GPT-4o-mini
2. **Anthropic (Claude)** - Claude 3.5 Sonnet, Opus, Haiku
3. **Google Gemini** - Gemini Pro, Flash
4. **OpenRouter** - Access to multiple models

---

## Setup Methods

### Method 1: Interactive Setup (Recommended)

1. Open Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
2. Type: **"Git Auto Commit: Configure AI Settings"**
3. Follow the wizard:
   - Select AI provider
   - Enter API key
   - Choose model (optional)
   - Enable AI generation

### Method 2: Manual Setup via Settings

1. Open Settings (`File > Preferences > Settings`)
2. Search for: **"Git Auto Commit"**
3. Configure:
   - `gitAutoCommit.useAIGeneration`: ✅ Enable
   - `gitAutoCommit.aiProvider`: Choose provider
   - `gitAutoCommit.[provider]ApiKey`: Enter your API key
   - `gitAutoCommit.aiModel`: (Optional) Specify model

### Method 3: Via Dashboard

1. Click the Git Auto Commit status bar icon
2. Click **"⚙️ Configure AI"** button
3. Follow the setup wizard

---

## Provider Setup Instructions

### 🟢 OpenAI (ChatGPT)

**1. Get API Key:**
- Visit: https://platform.openai.com/api-keys
- Sign in or create account
- Click "Create new secret key"
- Copy key (starts with `sk-...`)

**2. Configure in Extension:**
```json
{
  "gitAutoCommit.useAIGeneration": true,
  "gitAutoCommit.aiProvider": "openai",
  "gitAutoCommit.openaiApiKey": "sk-...",
  "gitAutoCommit.aiModel": "gpt-4o-mini"
}
```

**Recommended Models:**
- `gpt-4o-mini` - Fast, cheap, great for commits ($0.002/commit)
- `gpt-4o` - Most capable ($0.01/commit)
- `gpt-3.5-turbo` - Budget option ($0.001/commit)

**Pricing:** ~$0.002 per commit with GPT-4o-mini

---

### 🟣 Anthropic (Claude)

**1. Get API Key:**
- Visit: https://console.anthropic.com/
- Sign in or create account
- Go to "API Keys"
- Click "Create Key"
- Copy key (starts with `sk-ant-...`)

**2. Configure in Extension:**
```json
{
  "gitAutoCommit.useAIGeneration": true,
  "gitAutoCommit.aiProvider": "anthropic",
  "gitAutoCommit.anthropicApiKey": "sk-ant-...",
  "gitAutoCommit.aiModel": "claude-3-5-sonnet-20241022"
}
```

**Recommended Models:**
- `claude-3-5-sonnet-20241022` - Best balance ($0.003/commit)
- `claude-3-haiku-20240307` - Fastest, cheapest ($0.001/commit)
- `claude-3-opus-20240229` - Most capable ($0.015/commit)

**Pricing:** ~$0.003 per commit with Claude 3.5 Sonnet

---

### 🔵 Google Gemini

**1. Get API Key:**
- Visit: https://makersuite.google.com/app/apikey
- Sign in with Google account
- Click "Create API Key"
- Copy the key

**2. Configure in Extension:**
```json
{
  "gitAutoCommit.useAIGeneration": true,
  "gitAutoCommit.aiProvider": "gemini",
  "gitAutoCommit.geminiApiKey": "YOUR_API_KEY",
  "gitAutoCommit.aiModel": "gemini-pro"
}
```

**Recommended Models:**
- `gemini-pro` - Main model (FREE tier available!)
- `gemini-pro-vision` - With vision capabilities

**Pricing:** Free tier: 60 requests/minute, then pay-as-you-go

---

### 🟠 OpenRouter (Multi-Model Access)

**1. Get API Key:**
- Visit: https://openrouter.ai/keys
- Sign in or create account
- Click "Create Key"
- Copy key (starts with `sk-or-...`)

**2. Configure in Extension:**
```json
{
  "gitAutoCommit.useAIGeneration": true,
  "gitAutoCommit.aiProvider": "openrouter",
  "gitAutoCommit.openrouterApiKey": "sk-or-...",
  "gitAutoCommit.aiModel": "anthropic/claude-3.5-sonnet"
}
```

**Recommended Models:**
- `anthropic/claude-3.5-sonnet` - Best quality
- `openai/gpt-4o-mini` - Fast and cheap
- `google/gemini-pro-1.5` - Good balance
- `meta-llama/llama-3.1-405b-instruct` - Open source

**Pricing:** Varies by model, competitive rates

---

## Testing Your Setup

### Test AI Generation:

1. Make some code changes
2. Run: **"Git Auto Commit: Generate Commit Message"**
3. You should see: "Generating AI commit message..."
4. Wait for the AI-generated message

### Example AI-Generated Messages:

**Rule-based (without AI):**
```
feat: update ts, js files

- src/components/Button.tsx
- src/utils/helpers.js
```

**AI-powered:**
```
feat(components): enhance button component with loading state

- Add loading spinner animation to Button component
- Implement disabled state during async operations
- Extract common utility functions to helpers module
- Update type definitions for better type safety
```

---

## Troubleshooting

### Issue: "No API key configured"

**Solution:**
1. Check settings: `gitAutoCommit.[provider]ApiKey`
2. Make sure you selected the right provider
3. Verify API key is valid (no extra spaces)

### Issue: "API request failed: 401"

**Solution:**
- API key is invalid or expired
- Get a new API key from provider
- Make sure you copied the complete key

### Issue: "API request failed: 429"

**Solution:**
- You've hit rate limits
- Wait a few minutes
- Upgrade your API plan
- Switch to a different provider

### Issue: "AI generation failed"

**Solution:**
- Check your internet connection
- Verify API key is configured correctly
- Check the Output panel for detailed errors
- Falls back to rule-based generation automatically

### Issue: Message is too generic

**Solution:**
- Try a more capable model:
  - GPT-4o instead of GPT-3.5
  - Claude 3.5 Sonnet instead of Haiku
- Make sure you have meaningful code changes
- The AI needs enough context to generate good messages

---

## Cost Comparison

| Provider | Model | Cost per Commit | Quality |
|----------|-------|----------------|---------|
| OpenAI | GPT-4o-mini | ~$0.002 | ⭐⭐⭐⭐ |
| OpenAI | GPT-4o | ~$0.010 | ⭐⭐⭐⭐⭐ |
| Anthropic | Claude 3 Haiku | ~$0.001 | ⭐⭐⭐⭐ |
| Anthropic | Claude 3.5 Sonnet | ~$0.003 | ⭐⭐⭐⭐⭐ |
| Google | Gemini Pro | FREE* | ⭐⭐⭐⭐ |
| OpenRouter | Various | Varies | Varies |

*Free tier limits apply

**Recommendation:** Start with **Gemini Pro (FREE)** or **GPT-4o-mini ($0.002)** for best value.

---

## Best Practices

### 1. Start with Free/Cheap Models
- Try Gemini Pro (free) first
- Use GPT-4o-mini or Claude Haiku for daily use
- Save GPT-4o or Opus for important commits

### 2. Monitor Usage
- Check your API usage dashboards regularly
- Set spending limits on provider platforms
- Use rule-based generation for trivial changes

### 3. Security
- **NEVER** commit API keys to git
- API keys are stored in VS Code's secure storage
- Use environment-specific keys (dev vs prod)

### 4. When to Use AI vs Rule-Based

**Use AI when:**
- Complex refactoring
- Multiple file changes
- Unclear what changed
- Need detailed explanations

**Use Rule-based when:**
- Simple file updates
- Obvious changes
- Quick commits
- Saving API costs

---

## FAQ

**Q: Which AI provider is best?**
A: For commit messages, all work well. Gemini Pro is free, GPT-4o-mini is cheap and fast, Claude 3.5 Sonnet produces the most detailed messages.

**Q: How much will this cost?**
A: With GPT-4o-mini at ~$0.002/commit, 500 commits = $1. Most developers spend < $5/month.

**Q: Can I use multiple providers?**
A: Configure all API keys, then switch providers in settings as needed.

**Q: Is my API key safe?**
A: Yes, VS Code stores it securely. Never commit it to version control.

**Q: Can I use local AI models?**
A: Not yet, but planned for future releases (Ollama integration).

**Q: Does it work offline?**
A: AI features require internet. Falls back to rule-based generation offline.

---

## Example Configuration

### Full config.json example:

```json
{
  // Basic Settings
  "gitAutoCommit.enableAutoCommit": true,
  "gitAutoCommit.autoCommitInterval": 10,
  "gitAutoCommit.enableReminder": true,
  
  // AI Settings
  "gitAutoCommit.useAIGeneration": true,
  "gitAutoCommit.aiProvider": "openai",
  "gitAutoCommit.openaiApiKey": "sk-...",
  "gitAutoCommit.aiModel": "gpt-4o-mini",
  
  // Alternative providers (configure multiple)
  "gitAutoCommit.anthropicApiKey": "sk-ant-...",
  "gitAutoCommit.geminiApiKey": "...",
  "gitAutoCommit.openrouterApiKey": "sk-or-..."
}
```

---

## Getting Help

1. **Check Dashboard:** Status bar → Click icon → View AI status
2. **Test Configuration:** Command Palette → "Configure AI Settings"
3. **View Errors:** View → Output → Select "Git Auto Commit"
4. **Report Issues:** Include error messages and provider used

---

Happy committing with AI! 🚀🤖