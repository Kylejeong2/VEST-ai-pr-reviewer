export class TokenLimits {
  maxTokens: number
  requestTokens: number
  responseTokens: number
  knowledgeCutOff: string

  constructor(model = 'claude-3-sonnet-20241022') {
    this.knowledgeCutOff = '2024-01-01'
    if (model === 'claude-3-sonnet-20241022') {
      this.maxTokens = 200000
      this.responseTokens = 4096
    } else if (model === 'claude-3-haiku-20241022') {
      this.maxTokens = 200000
      this.responseTokens = 4096
    } else {
      // Default to Sonnet's limits
      this.maxTokens = 200000
      this.responseTokens = 4096
    }
    // provide some margin for the request tokens
    this.requestTokens = this.maxTokens - this.responseTokens - 100
  }

  string(): string {
    return `max_tokens=${this.maxTokens}, request_tokens=${this.requestTokens}, response_tokens=${this.responseTokens}`
  }
}
