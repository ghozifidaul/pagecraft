export interface StoryGenInput {
  title: string
  synopsis: string
  characterDesc: string
  pageCount: number
  artStyleId: string
}

export interface PageStory {
  pageNumber: number
  story: string
}

export type StoryGenOutput = PageStory[]

export interface StoryRegenInput {
  currentStory: string
  feedback: string
  bookContext: {
    title: string
    characterDesc: string
    synopsis: string
  }
  pageNumber: number
  totalPages: number
  previousPageStory?: string
  nextPageStory?: string
}

export interface IllustrationGenInput {
  pageStory: string
  characterDesc: string
  artStyleDescription: string
  artStyleImageBase64?: string
  previousPageImage?: string
  feedback?: string
}

export interface IllustrationGenOutput {
  data: string
  mimeType: string
}

export type InteractionStatus =
  | "completed"
  | "in_progress"
  | "requires_action"
  | "failed"
  | "cancelled"

export interface InteractionStep {
  type: string
  content?: InteractionContent[]
  signature?: string
  summary?: string
}

export interface InteractionContent {
  type: string
  text?: string
  data?: string
  mime_type?: string
  uri?: string
}

export interface InteractionResponse {
  id: string
  status: InteractionStatus
  steps: InteractionStep[]
  outputText: string | null
  usage?: {
    total_tokens?: number
  }
  error?: string
}

export interface ResponseFormat {
  type: "text" | "image" | "audio"
  mime_type?: string
  schema?: Record<string, unknown>
}

export interface GeminiRequest {
  model: string
  input: string | GeminiContentPart[]
  system_instruction?: string
  previous_interaction_id?: string
  tools?: GeminiTool[]
  generation_config?: Record<string, unknown>
  response_format?: ResponseFormat
}

export interface GeminiContentPart {
  text?: string
  inline_data?: {
    data: string
    mime_type: string
  }
}

export interface GeminiTool {
  type: string
  [key: string]: unknown
}
