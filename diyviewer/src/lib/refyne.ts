// Refyne API integration for DIY tutorial extraction

export interface MaterialItem {
  item: string;
  quantity?: string;
  notes?: string;
}

export interface TutorialStep {
  step_number: number;
  title: string;
  instructions: string;
  tips?: string;
  image_urls?: string[];
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
description: Extracts tutorial information including title, overview, materials/tools, and step-by-step instructions from DIY tutorial sites like Instructables

fields:
  - name: title
    type: string
    description: The title of the tutorial/project
    required: true

  - name: overview
    type: string
    description: A descriptive summary of what this tutorial covers, what will be built, and the overall scope of the project
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
          description: Name of the material or tool
          required: true
        quantity:
          type: string
          description: Amount or quantity needed (if specified)
        notes:
          type: string
          description: Any additional notes about the item (sizes, alternatives, etc.)

  - name: steps
    type: array
    description: Step-by-step instructions for completing the project
    items:
      type: object
      properties:
        step_number:
          type: integer
          description: The step number in sequence
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
        })),
        steps: (extracted.steps || []).map((step: any, idx: number) => ({
          step_number: step.step_number || idx + 1,
          title: step.title || `Step ${idx + 1}`,
          instructions: step.instructions || '',
          tips: step.tips,
          image_urls: step.image_urls || [],
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
