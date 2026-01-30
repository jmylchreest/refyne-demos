// Refyne API integration for DIY tutorial extraction
// Uses the official @refyne/sdk for proper timeout handling

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

export interface SkillReference {
  skill_name: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  search_query: string;
}

export interface SafetyWarning {
  warning: string;
  severity: 'caution' | 'warning' | 'danger';
  ppe_required?: string[];
}

export interface TutorialStep {
  step_number: number;
  title: string;
  instructions: string;
  tips?: string;
  image_urls?: string[];
  measurements?: MeasurementConversion[];
  skill_references?: SkillReference[];
  safety_warnings?: SafetyWarning[];
}

export interface ExtractedTutorial {
  title: string;
  overview: string;
  image_url?: string;
  author?: string;
  author_url?: string;
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

//#region tutorial-schema
// DIY Tutorial extraction schema for Refyne
const TUTORIAL_SCHEMA = `
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
    description: |
      URL of the main project/tutorial image showing the FINISHED PROJECT or the project being built.
      This should be the hero/featured image that represents what the tutorial creates.

      IMPORTANT - DO NOT use:
      - Author photos or profile pictures (headshots of people)
      - Avatar images or small circular profile images
      - Advertisement or promotional images unrelated to the project
      - Social media icons or logos

      Look for the largest, most prominent image showing the actual project/build result.

      NOTE: Images are in the YAML frontmatter at the top of the content (between --- markers).
      The frontmatter has an 'images:' section mapping placeholders (IMG_001, IMG_002, etc.) to URLs.
      Find the most appropriate image URL from the frontmatter 'images' section.

  - name: author
    type: string
    description: Name of the tutorial author or content creator

  - name: author_url
    type: string
    description: URL to the author's profile page or website (if available)

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
    required: true
    description: |
      Consumable materials needed for the project (things that get used up or become part of the finished project).
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
    required: true
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
    required: true
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
          description: |
            Extract ALL image URLs for this step.

            IMPORTANT: Images are NOT in standard markdown format. Instead:
            1. In the body, images appear as placeholders like {{IMG_001}}, {{IMG_002}}, etc.
            2. At the TOP of the content is a YAML frontmatter section (between --- markers)
            3. The frontmatter has an 'images:' section that maps each placeholder to its URL

            Example frontmatter:
            ---
            images:
              IMG_001:
                url: "https://content.instructables.com/abc.jpg"
              IMG_002:
                url: "https://content.instructables.com/def.jpg"
            ---

            To extract images for a step:
            1. Find which {{IMG_XXX}} placeholders appear in that step's content
            2. Look up each placeholder in the frontmatter 'images' section
            3. Extract the 'url' value for each placeholder
            4. Return all URLs as an array

            Include every image URL found in this step - do not skip any images.
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
        skill_references:
          type: array
          description: |
            When this step mentions a technique or skill that beginners might not know,
            provide a reference to help them learn. Examples:
            - "threading a needle" for sewing projects
            - "using a miter saw safely" for woodworking
            - "soldering components" for electronics
            Only include skills that are actually performed in this step.
          items:
            type: object
            properties:
              skill_name:
                type: string
                description: The technique or skill mentioned (e.g., "threading a needle")
                required: true
              difficulty:
                type: string
                description: Skill difficulty - "beginner", "intermediate", or "advanced"
                required: true
              description:
                type: string
                description: Brief explanation of what this skill involves
                required: true
              search_query:
                type: string
                description: A search query to find tutorials (e.g., "how to thread a needle for beginners tutorial")
                required: true
        safety_warnings:
          type: array
          description: |
            Important safety information for this step. Include warnings about:
            - Power tool usage and safety
            - Chemical or fume hazards
            - Sharp objects or cutting tools
            - Electrical safety
            - Heat or fire risks
            - Required protective equipment
          items:
            type: object
            properties:
              warning:
                type: string
                description: The safety warning text
                required: true
              severity:
                type: string
                description: '"caution" (minor risk), "warning" (moderate risk), or "danger" (serious risk)'
                required: true
              ppe_required:
                type: array
                description: Required protective equipment (e.g., "safety glasses", "gloves", "hearing protection")
                items:
                  type: string

  - name: tags
    type: array
    description: Project categories or tags
    items:
      type: string
`;
//#endregion tutorial-schema

// Extraction timeout: 10 minutes for complex tutorials with browser rendering + LLM
// Instructables tutorials with dynamic retry can take 5-7 minutes
const EXTRACTION_TIMEOUT_MS = 600000;

export async function extractTutorial(
  url: string,
  apiUrl: string,
  apiKey: string,
  referer?: string
): Promise<RefyneResponse> {
  try {
    // Create client with extended timeout for extraction operations
    // Referer is required for demo/partner API keys with referrer restrictions
    const client = new Refyne({
      apiKey,
      baseUrl: apiUrl,
      timeout: EXTRACTION_TIMEOUT_MS,
      referer,
    });

    // Create AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), EXTRACTION_TIMEOUT_MS);

    try {
      // Use the SDK's extract method
      const response = await client.extract({
        url,
        schema: TUTORIAL_SCHEMA,
        capture_debug: true,
        fetch_mode: 'auto',
      });

      clearTimeout(timeoutId);

      // Extract the tutorial data from the response
      const extracted = (response as any).data || response;

      return {
        success: true,
        data: {
          title: extracted.title || 'Untitled Tutorial',
          overview: extracted.overview || '',
          image_url: extracted.image_url,
          author: extracted.author,
          author_url: extracted.author_url,
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
            skill_references: (step.skill_references || []).map((s: any) => ({
              skill_name: s.skill_name || '',
              difficulty: s.difficulty || 'beginner',
              description: s.description || '',
              search_query: s.search_query || '',
            })),
            safety_warnings: (step.safety_warnings || []).map((w: any) => ({
              warning: w.warning || '',
              severity: w.severity || 'caution',
              ppe_required: w.ppe_required || [],
            })),
          })),
          tags: extracted.tags,
        },
      };
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  } catch (error) {
    // Handle RefyneError types from the SDK
    if (error && typeof error === 'object' && 'message' in error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to extract tutorial',
    };
  }
}

// =========================================================================
// Async Crawl Functions (for progress tracking UI)
// =========================================================================

export interface CrawlJobStartResponse {
  success: boolean;
  jobId?: string;
  error?: string;
}

export interface CrawlJobStatusResponse {
  success: boolean;
  status?: string;
  progress?: number;
  data?: ExtractedTutorial;
  error?: string;
}

//#region start-extraction
/**
 * Start an async extraction (crawl) job.
 * Returns a job_id that can be polled for status.
 */
export async function startExtraction(
  url: string,
  apiUrl: string,
  apiKey: string,
  referer?: string
): Promise<CrawlJobStartResponse> {
  try {
    const client = new Refyne({
      apiKey,
      baseUrl: apiUrl,
      timeout: EXTRACTION_TIMEOUT_MS,
      referer,
    });

    const response = await client.crawl({
      url,
      schema: TUTORIAL_SCHEMA,
      capture_debug: true,
      fetch_mode: 'auto', // Auto-detect JS-heavy sites and use browser rendering when needed
    });

    const jobId = (response as any).job_id || (response as any).id;

    if (!jobId) {
      return {
        success: false,
        error: 'No job ID returned from API',
      };
    }

    return {
      success: true,
      jobId: jobId,
    };
  } catch (error) {
    console.error('[startExtraction] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start extraction',
    };
  }
}
//#endregion start-extraction

//#region get-job-status
/**
 * Get the status of an async extraction job.
 * When complete, returns the extracted tutorial data.
 */
export async function getJobStatus(
  jobId: string,
  apiUrl: string,
  apiKey: string,
  referer?: string
): Promise<CrawlJobStatusResponse> {
  try {
    const client = new Refyne({
      apiKey,
      baseUrl: apiUrl,
      timeout: 30000, // Shorter timeout for status checks
      referer,
    });

    const job = await client.jobs.get(jobId);
    const status = (job as any).status;

    // Job still in progress
    if (status === 'pending' || status === 'crawling' || status === 'processing') {
      return {
        success: true,
        status,
        progress: (job as any).progress || 0,
      };
    }

    // Job failed
    if (status === 'failed') {
      return {
        success: false,
        status,
        error: (job as any).error || 'Extraction failed',
      };
    }

    // Job completed - get results
    if (status === 'completed') {
      const results = await client.jobs.getResults(jobId);
      const extracted = (results as any).data || (results as any).results?.[0]?.data || results;

      return {
        success: true,
        status,
        data: transformExtractedData(extracted),
      };
    }

    // Unknown status
    return {
      success: true,
      status,
    };
  } catch (error) {
    console.error('[getJobStatus] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get job status',
    };
  }
}
//#endregion get-job-status

/**
 * Transform raw extraction data to ExtractedTutorial format.
 */
function transformExtractedData(extracted: any): ExtractedTutorial {
  return {
    title: extracted.title || 'Untitled Tutorial',
    overview: extracted.overview || '',
    image_url: extracted.image_url,
    author: extracted.author,
    author_url: extracted.author_url,
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
      skill_references: (step.skill_references || []).map((s: any) => ({
        skill_name: s.skill_name || '',
        difficulty: s.difficulty || 'beginner',
        description: s.description || '',
        search_query: s.search_query || '',
      })),
      safety_warnings: (step.safety_warnings || []).map((w: any) => ({
        warning: w.warning || '',
        severity: w.severity || 'caution',
        ppe_required: w.ppe_required || [],
      })),
    })),
    tags: extracted.tags,
  };
}
