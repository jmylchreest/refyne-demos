// Refyne API integration for DIY tutorial extraction
import { Refyne } from '@refyne/sdk';

export interface GlossaryTerm {
  term: string;
  definition: string;
  context?: string;
}

export interface MeasurementConversion {
  original: string;
  metric: string;
  imperial: string;
}

export interface MaterialItem {
  name: string;
  quantity?: string;
  notes?: string;
  measurement?: MeasurementConversion;
}

export interface ToolItem {
  name: string;
  notes?: string;
  required: boolean;
}

export interface TutorialStep {
  step_number: number;
  title: string;
  instructions: string;
  tips?: string;
  image_urls?: string[];
  measurements?: MeasurementConversion[];
}

export interface ExtractedTutorial {
  title: string;
  overview: string;
  image_url?: string;
  difficulty?: string;
  estimated_time?: string;
  glossary: GlossaryTerm[];
  materials: MaterialItem[];
  tools: ToolItem[];
  steps: TutorialStep[];
  tags?: string[];
}

export interface RefyneResponse {
  success: boolean;
  data?: ExtractedTutorial;
  error?: string;
}

// Job status response from async extraction
export interface JobStatusResponse {
  success: boolean;
  jobId?: string;
  status?: 'pending' | 'running' | 'completed' | 'failed';
  data?: ExtractedTutorial;
  error?: string;
  pageCount?: number;
}

// DIY Tutorial extraction schema for Refyne
export const TUTORIAL_SCHEMA = `
name: DIYTutorial
description: |
  Extracts tutorial information from DIY sites like Instructables.

  IMPORTANT INSTRUCTIONS:
  1. Only include steps that contain actual actionable instructions.
  2. Skip and exclude any steps that are:
     - Introduction or overview steps (put this content in the overview field)
     - Conclusion, summary, or "final thoughts" steps
     - Steps asking users to subscribe, follow, or vote
     - Steps promoting other content or products
     - Steps with only images and no real instructions
     - "Supplies" or "Materials" steps (extract these into materials/tools fields)
  3. Renumber the remaining steps sequentially starting from 1.
  4. Create a glossary of technical/specialized terms that may be unfamiliar to beginners.
  5. Separate materials (consumables) from tools (reusable equipment).
  6. For any measurements, provide both metric and imperial conversions.

fields:
  - name: title
    type: string
    description: The title of the tutorial/project
    required: true

  - name: overview
    type: string
    description: A descriptive summary of what this tutorial covers, what will be built, and the overall scope. Include any introductory content here rather than as a step.
    required: true

  - name: image_url
    type: string
    description: URL of the main project/tutorial image

  - name: difficulty
    type: string
    description: Difficulty level (e.g., "Beginner", "Intermediate", "Advanced")

  - name: estimated_time
    type: string
    description: Estimated time to complete the project (e.g., "2-3 hours", "Weekend project")

  - name: glossary
    type: array
    description: |
      Technical terms, jargon, or specialized vocabulary used in this tutorial that beginners might not understand.
      Examples: "joist" (horizontal structural beam), "OSB" (oriented strand board), "miter cut" (angled cut), etc.
      Include any industry-specific terms, material names, tool names, or techniques that need explanation.
    items:
      type: object
      properties:
        term:
          type: string
          description: The technical term or jargon
          required: true
        definition:
          type: string
          description: Clear, beginner-friendly explanation of what this term means
          required: true
        context:
          type: string
          description: How this term is used in this specific project (optional)

  - name: materials
    type: array
    description: |
      Consumable materials needed for the project (things that get used up or become part of the finished product).
      Examples: lumber, screws, paint, glue, sandpaper, etc.
    items:
      type: object
      properties:
        name:
          type: string
          description: Name of the material with specific type/grade if mentioned
          required: true
        quantity:
          type: string
          description: Amount needed (e.g., "4 boards", "1 gallon", "50 pieces")
        notes:
          type: string
          description: Additional details like dimensions, alternatives, or specifications
        measurement:
          type: object
          description: If the material has a size measurement, provide conversions
          properties:
            original:
              type: string
              description: The measurement as written in the source
              required: true
            metric:
              type: string
              description: Metric equivalent (mm, cm, m, ml, L, g, kg)
              required: true
            imperial:
              type: string
              description: Imperial equivalent (in, ft, oz, lb, gal)
              required: true

  - name: tools
    type: array
    description: |
      Reusable tools and equipment needed for the project.
      Examples: drill, saw, hammer, measuring tape, clamps, safety glasses, etc.
    items:
      type: object
      properties:
        name:
          type: string
          description: Name of the tool
          required: true
        notes:
          type: string
          description: Specific type, size, or features needed (e.g., "cordless", "with Phillips bit")
        required:
          type: boolean
          description: Whether this tool is essential (true) or optional/nice-to-have (false)
          required: true

  - name: steps
    type: array
    description: Step-by-step instructions for completing the project. Only include steps with actual actionable instructions.
    items:
      type: object
      properties:
        step_number:
          type: integer
          description: The step number in sequence (renumber sequentially after filtering)
          required: true
        title:
          type: string
          description: Title or heading of this step
          required: true
        instructions:
          type: string
          description: Detailed instructions for completing this step
          required: true
        tips:
          type: string
          description: Any tips, warnings, or helpful hints for this step
        image_urls:
          type: array
          description: URLs of images associated with this step
          items:
            type: string
        measurements:
          type: array
          description: Any measurements mentioned in this step with conversions
          items:
            type: object
            properties:
              original:
                type: string
                description: The measurement as written
                required: true
              metric:
                type: string
                description: Metric equivalent
                required: true
              imperial:
                type: string
                description: Imperial equivalent
                required: true

  - name: tags
    type: array
    description: Project categories or tags
    items:
      type: string
`;

/**
 * Create a configured Refyne SDK client.
 */
function createClient(apiUrl: string, apiKey: string, referer?: string): Refyne {
  return new Refyne({
    apiKey,
    baseUrl: apiUrl,
    referer: referer || 'https://diyviewer-demo.refyne.uk',
  });
}

/**
 * Start an async extraction job. Returns immediately with a job ID.
 * Use getJobStatus to poll for completion.
 */
export async function startExtraction(
  url: string,
  apiUrl: string,
  apiKey: string,
  referer?: string
): Promise<JobStatusResponse> {
  try {
    const client = createClient(apiUrl, apiKey, referer);

    // Use crawl endpoint - returns immediately with job_id
    const result = await client.crawl({
      url,
      schema: TUTORIAL_SCHEMA,
      options: {
        max_pages: 1,
        max_urls: 1,
        extract_from_seeds: true,
      },
    });

    // If job completed immediately (fast extraction), we get results directly
    if (result.status === 'completed' && result.data) {
      return {
        success: true,
        jobId: result.job_id,
        status: 'completed',
        data: transformExtractedData(result.data),
      };
    }

    // Job still running, return job_id for polling
    return {
      success: true,
      jobId: result.job_id,
      status: result.status || 'running',
    };
  } catch (error: any) {
    // Extract detailed error info from SDK errors
    const errorMessage = error?.message || error?.detail || String(error);
    const statusCode = error?.status || error?.statusCode;
    return {
      success: false,
      error: statusCode ? `${errorMessage} (${statusCode})` : errorMessage,
    };
  }
}

/**
 * Poll for job status and results.
 */
export async function getJobStatus(
  jobId: string,
  apiUrl: string,
  apiKey: string,
  referer?: string
): Promise<JobStatusResponse> {
  try {
    const client = createClient(apiUrl, apiKey, referer);

    // Get job results with merge=true
    const data = await client.jobs.getResults(jobId, { merge: true });

    // Check job status
    if (data.status === 'failed') {
      return {
        success: false,
        jobId,
        status: 'failed',
        error: data.error_message || 'Extraction failed',
      };
    }

    if (data.status === 'completed') {
      // Results are in data.merged (when merge=true) or data.results[0]
      const extracted = data.merged || (data.results && data.results[0]) || {};
      return {
        success: true,
        jobId,
        status: 'completed',
        data: transformExtractedData(extracted),
        pageCount: data.page_count,
      };
    }

    // Still running
    return {
      success: true,
      jobId,
      status: data.status || 'running',
      pageCount: data.page_count,
    };
  } catch (error: any) {
    // Handle 404 (job not found or results not ready yet)
    if (error?.status === 404 || error?.statusCode === 404) {
      return {
        success: true,
        jobId,
        status: 'running',
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get job status',
    };
  }
}

/**
 * Transform raw extracted data into our ExtractedTutorial interface.
 */
function transformExtractedData(extracted: any): ExtractedTutorial {
  return {
    title: extracted.title || 'Untitled Tutorial',
    overview: extracted.overview || '',
    image_url: extracted.image_url,
    difficulty: extracted.difficulty,
    estimated_time: extracted.estimated_time,
    glossary: (extracted.glossary || []).map((term: any) => ({
      term: term.term || '',
      definition: term.definition || '',
      context: term.context,
    })),
    materials: (extracted.materials || []).map((mat: any) => ({
      name: mat.name || '',
      quantity: mat.quantity,
      notes: mat.notes,
      measurement: mat.measurement ? {
        original: mat.measurement.original || '',
        metric: mat.measurement.metric || '',
        imperial: mat.measurement.imperial || '',
      } : undefined,
    })),
    tools: (extracted.tools || []).map((tool: any) => ({
      name: tool.name || '',
      notes: tool.notes,
      required: tool.required !== false,
    })),
    steps: (extracted.steps || []).map((step: any, idx: number) => ({
      step_number: step.step_number || idx + 1,
      title: step.title || `Step ${idx + 1}`,
      instructions: step.instructions || '',
      tips: step.tips,
      image_urls: step.image_urls || [],
      measurements: (step.measurements || []).map((m: any) => ({
        original: m.original || '',
        metric: m.metric || '',
        imperial: m.imperial || '',
      })),
    })),
    tags: extracted.tags,
  };
}

/**
 * Legacy synchronous extraction - may timeout on large pages.
 * Consider using startExtraction + getJobStatus for better reliability.
 */
export async function extractTutorial(
  url: string,
  apiUrl: string,
  apiKey: string,
  referer?: string
): Promise<RefyneResponse> {
  try {
    const client = createClient(apiUrl, apiKey, referer);

    const result = await client.extract({
      url,
      schema: TUTORIAL_SCHEMA,
    });

    // Extract the tutorial data from the response
    const extracted = result.data || result;

    return {
      success: true,
      data: transformExtractedData(extracted),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to extract tutorial',
    };
  }
}
