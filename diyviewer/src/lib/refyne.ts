// Refyne API integration for DIY tutorial extraction

export interface MaterialItem {
  item: string;
  quantity?: string;
  notes?: string;
  purchase_url?: string;
}

export interface HelpfulLink {
  title: string;
  url: string;
  type: 'tutorial' | 'video' | 'product' | 'reference';
}

export interface TutorialStep {
  step_number: number;
  title: string;
  instructions: string;
  tips?: string;
  image_urls?: string[];
  helpful_links?: HelpfulLink[];
}

export interface ExtractedTutorial {
  title: string;
  overview: string;
  image_url?: string;
  difficulty?: string;
  estimated_time?: string;
  materials_and_tools: MaterialItem[];
  steps: TutorialStep[];
  tags?: string[];
}

export interface RefyneResponse {
  success: boolean;
  data?: ExtractedTutorial;
  error?: string;
}

// DIY Tutorial extraction schema for Refyne
const TUTORIAL_SCHEMA = `
name: DIYTutorial
description: |
  Extracts tutorial information from DIY sites like Instructables.
  IMPORTANT: Only include steps that contain actual actionable instructions.
  Skip and exclude any steps that are:
  - Introduction or overview steps (this goes in the overview field instead)
  - Conclusion, summary, or "final thoughts" steps
  - Steps asking users to subscribe, follow, or vote
  - Steps promoting other content or products
  - Steps with only images and no real instructions
  - "Supplies" or "Materials" steps (these go in materials_and_tools instead)
  Renumber the remaining steps sequentially starting from 1.

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

  - name: materials_and_tools
    type: array
    description: List of materials and tools needed for the project
    items:
      type: object
      properties:
        item:
          type: string
          description: Name of the material or tool (be specific about type/size)
          required: true
        quantity:
          type: string
          description: Amount or quantity needed (if specified)
        notes:
          type: string
          description: Any additional notes about the item (sizes, alternatives, etc.)
        purchase_url:
          type: string
          description: A helpful URL where this item can be purchased (prefer Amazon, Home Depot, Lowes, or major retailers). Generate a search URL if a specific product link is not available (e.g., https://www.amazon.com/s?k=item+name)

  - name: steps
    type: array
    description: Step-by-step instructions for completing the project. Only include steps with actual actionable instructions - skip intro, conclusion, and promotional steps.
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
        helpful_links:
          type: array
          description: External resources that could help with this step (YouTube tutorials, technique guides, tool reviews). Generate relevant search URLs for techniques mentioned.
          items:
            type: object
            properties:
              title:
                type: string
                description: Short descriptive title for the link
                required: true
              url:
                type: string
                description: URL to the helpful resource. Use YouTube search (https://www.youtube.com/results?search_query=...) for technique videos, or Google search for guides.
                required: true
              type:
                type: string
                description: Type of resource - one of "tutorial", "video", "product", or "reference"
                required: true

  - name: tags
    type: array
    description: Project categories or tags
    items:
      type: string
`;

export async function extractTutorial(
  url: string,
  apiUrl: string,
  apiKey: string
): Promise<RefyneResponse> {
  try {
    const response = await fetch(`${apiUrl}/api/v1/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Referer': 'https://diyviewer-demo.refyne.uk',
      },
      body: JSON.stringify({
        url,
        schema: TUTORIAL_SCHEMA,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `API error: ${response.status}`,
      };
    }

    const data = await response.json();

    if (data.error) {
      return {
        success: false,
        error: data.error,
      };
    }

    // Extract the tutorial data from the response
    const extracted = data.data || data;

    return {
      success: true,
      data: {
        title: extracted.title || 'Untitled Tutorial',
        overview: extracted.overview || '',
        image_url: extracted.image_url,
        difficulty: extracted.difficulty,
        estimated_time: extracted.estimated_time,
        materials_and_tools: (extracted.materials_and_tools || []).map((mat: any, idx: number) => ({
          item: mat.item || `Item ${idx + 1}`,
          quantity: mat.quantity,
          notes: mat.notes,
          purchase_url: mat.purchase_url,
        })),
        steps: (extracted.steps || []).map((step: any, idx: number) => ({
          step_number: step.step_number || idx + 1,
          title: step.title || `Step ${idx + 1}`,
          instructions: step.instructions || '',
          tips: step.tips,
          image_urls: step.image_urls || [],
          helpful_links: (step.helpful_links || []).map((link: any) => ({
            title: link.title || 'Helpful Resource',
            url: link.url || '',
            type: link.type || 'reference',
          })),
        })),
        tags: extracted.tags,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to extract tutorial',
    };
  }
}
