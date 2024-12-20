import './fetch-polyfill'
import {info, setFailed, warning} from '@actions/core'
import Anthropic from '@anthropic-ai/sdk'
import {Options} from './options'
import pRetry from 'p-retry'

export interface Ids {
  parentMessageId?: string
  conversationId?: string
}

export class Bot {
  private readonly api: Anthropic | null = null
  private readonly options: Options

  constructor(options: Options) {
    this.options = options
    if (process.env.ANTHROPIC_API_KEY) {
      this.api = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
      })
    } else {
      throw new Error(
        "Unable to initialize the Anthropic API, 'ANTHROPIC_API_KEY' environment variable is not available"
      )
    }
  }

  chat = async (message: string, ids: Ids): Promise<[string, Ids]> => {
    let res: [string, Ids] = ['', {}]
    try {
      res = await this.chat_(message, ids)
      return res
    } catch (e: unknown) {
      warning(`Failed to chat: ${e}`)
      return res
    }
  }

  private readonly chat_ = async (
    message: string,
    ids: Ids
  ): Promise<[string, Ids]> => {
    const start = Date.now()
    if (!message) {
      return ['', {}]
    }

    let responseText = ''

    if (this.api != null) {
      try {
        const currentDate = new Date().toISOString().split('T')[0]
        const systemMessage = `${this.options.systemMessage}
Knowledge cutoff: ${this.options.heavyTokenLimits.knowledgeCutOff}
Current date: ${currentDate}

IMPORTANT: Entire response must be in the language with ISO code: ${this.options.language}
`

        const response = await pRetry(
          () =>
            this.api!.messages.create({
              model: this.options.anthropicHeavyModel,
              max_tokens: this.options.heavyTokenLimits.responseTokens,
              temperature: this.options.modelTemperature,
              system: systemMessage,
              messages: [
                {
                  role: 'user',
                  content: message
                }
              ]
            }),
          {
            retries: this.options.apiRetries,
            onFailedAttempt: error => {
              warning(
                `Failed attempt ${error.attemptNumber}. ${
                  this.options.apiRetries - error.attemptNumber
                } attempts remaining.`
              )
            }
          }
        )

        const contentBlock = response.content[0]
        if (contentBlock.type === 'text') {
          responseText = contentBlock.text
        } else {
          info(`Received non-text content block: ${contentBlock.type}`)
        }

        const end = Date.now()
        info(`response: ${JSON.stringify(response)}`)
        info(
          `anthropic sendMessage (including retries) response time: ${
            end - start
          } ms`
        )
      } catch (e: unknown) {
        info(`Failed to send message to Anthropic: ${e}`)
      }
    } else {
      setFailed('The Anthropic API is not initialized')
    }

    if (responseText.startsWith('with ')) {
      responseText = responseText.substring(5)
    }

    if (this.options.debug) {
      info(`anthropic responses: ${responseText}`)
    }

    return [responseText, {}]
  }
} 