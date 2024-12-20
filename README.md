# VEST AI PR Reviewer

This is a fork of [CodeRabbit](http://coderabbit.ai), customized to use Claude 3.5 Sonnet and Haiku models.

# AI-based PR reviewer and summarizer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

VEST `ai-pr-reviewer` is an AI-based code reviewer and summarizer for
GitHub pull requests using Anthropic's Claude 3.5 Sonnet and Haiku models. It is
designed to be used as a GitHub Action and can be configured to run on every
pull request and review comments.

## Reviewer Features:

- 🤖 **AI-Powered Code Review**: Leverages Claude 3.5 models to provide in-depth code reviews
- 📝 **PR Summary**: Generates concise summaries of changes
- 📋 **Release Notes**: Auto-generates release notes
- 💬 **Interactive**: Responds to review comments and questions
- 🎯 **Focused Reviews**: Configurable to focus on specific aspects of code
- 🔍 **Detailed Analysis**: Reviews code for security, performance, and best practices
- 🛠 **Customizable**: Configurable system prompts and review focus areas
- 🌍 **Multi-language**: Supports multiple programming languages
- ⚡ **Efficient**: Parallel processing of files and API calls
- 🎨 **Clean UI**: Well-formatted markdown responses
- 🔒 **Secure**: No code leaves your GitHub Actions environment
- 📊 **Comprehensive**: Reviews entire PRs including documentation
- ⚙️ **Configurable**: Extensive configuration options
- 🚀 **Fast**: Uses Claude 3.5 Haiku for quick tasks and Sonnet for complex reviews

## Install instructions

`ai-pr-reviewer` runs as a GitHub Action. Add the below file to your repository
at `.github/workflows/ai-pr-reviewer.yml`

```yaml
name: Code Review

permissions:
  contents: read
  pull-requests: write

on:
  pull_request:
  pull_request_review_comment:
    types: [created]

concurrency:
  group:
    ${{ github.repository }}-${{ github.event.number || github.head_ref ||
    github.sha }}-${{ github.workflow }}-${{ github.event_name ==
    'pull_request_review_comment' && 'pr_comment' || 'pr' }}
  cancel-in-progress: ${{ github.event_name != 'pull_request_review_comment' }}

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: vest-ai-pr-reviewer@latest
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        with:
          debug: false
          review_simple_changes: false
          review_comment_lgtm: false
```

### Environment variables

- `GITHUB_TOKEN`: This should already be available to the GitHub Action
  environment. This is used to add comments to the pull request.
- `ANTHROPIC_API_KEY`: use this to authenticate with Anthropic's Claude API. You can get one
  [here](https://console.anthropic.com/). Please add this key to your GitHub Action secrets.

### Models: Claude 3.5 Sonnet and Haiku

We recommend using Claude 3.5 Haiku for lighter tasks such as summarizing the
changes (`openai_light_model` in configuration) and Claude 3.5 Sonnet for more complex
review and commenting tasks (`openai_heavy_model` in configuration).

### Prompts & Configuration

See: [action.yml](./action.yml)

Tip: You can change the bot personality by configuring the `system_message`
value. For example, to review docs/blog posts, you can use the following prompt:

<details>
<summary>Blog Reviewer Prompt</summary>

```yaml
system_message: |
  You are `@vest-ai` (aka `github-actions[bot]`), a language model
  trained by Anthropic. Your purpose is to act as a highly experienced
  DevRel (developer relations) professional with focus on cloud-native
  infrastructure.

  Company context -
  VEST is an AI-powered Code reviewer. It boosts code quality and cuts manual effort. Offers context-aware, line-by-line feedback, highlights critical changes,
  enables bot interaction, and lets you commit suggestions directly from GitHub.

  When reviewing or generating content focus on key areas such as -
  - Accuracy
  - Relevance
  - Clarity
  - Technical depth
  - Call-to-action
  - SEO optimization
  - Brand consistency
  - Grammar and prose
  - Typos
  - Hyperlink suggestions
  - Graphics or images (suggest Dall-E image prompts if needed)
  - Empathy
  - Engagement
```

</details>

## Conversation with Vest-AI

You can reply to a review comment made by this action and get a response based
on the diff context. Additionally, you can invite the bot to a conversation by
tagging it in the comment (`@vest-ai`).

Example:

> @vest-ai Please generate a test plan for this file.

Note: A review comment is a comment made on a diff or a file in the pull
request.

### Ignoring PRs

Sometimes it is useful to ignore a PR. For example, if you are using this action
to review documentation, you can ignore PRs that only change the documentation.
To ignore a PR, add the following keyword in the PR description:

```text
@vest-ai: ignore
```

## Examples

Some of the reviews done by ai-pr-reviewer

![PR Summary](./docs/images/PRSummary.png)

![PR Release Notes](./docs/images/ReleaseNotes.png)

## FAQs

1. **How much does it cost to run?**
   Claude 3.5 Haiku and Sonnet are very cost-effective. For a team of 20 developers, you might spend around $10-20 per day.

2. **Is it secure?**
   Yes, all code review happens within your GitHub Actions environment. No code is sent to external servers except the Anthropic API.

3. **What languages does it support?**
   It supports all programming languages that Claude 3.5 understands, which is virtually all commonly used languages.

4. **Can I customize the review focus?**
   Yes, you can modify the system message to focus on specific aspects of code review.

5. **How do I get support?**
   Please open an issue in this repository.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.