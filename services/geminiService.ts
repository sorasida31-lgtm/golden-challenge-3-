import { GoogleGenAI, Type } from "@google/genai";
import type { QuizItem, QuizItemL2, QuizItemL3 } from '../types';

let ai: GoogleGenAI | null = null;
const apiKey = process.env.API_KEY;

if (apiKey) {
    try {
        ai = new GoogleGenAI({ apiKey });
    } catch (e) {
        console.error("Failed to initialize GoogleGenAI. AI features may not work.", e);
    }
} else {
    console.warn("API_KEY environment variable not set. Gemini AI features will be disabled.");
}

const model = 'gemini-2.5-flash';

const quizItemSchema = {
  type: Type.OBJECT,
  properties: {
    question: { type: Type.STRING, description: "The English question for the student." },
    question_kr: { type: Type.STRING, description: "The Korean translation of the question." },
    options: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "An array of 4 multiple-choice options in English."
    },
    correctAnswer: { type: Type.STRING, description: "The correct answer from the options." }
  },
  required: ['question', 'question_kr', 'options', 'correctAnswer'],
};

const quizItemL2Schema = {
    type: Type.OBJECT,
    properties: {
      question: { type: Type.STRING, description: "An English yes/no or simple question (e.g., 'Do you like apples?')." },
      question_kr: { type: Type.STRING, description: "The Korean translation of the question." },
      answerPrompt: { type: Type.STRING, description: "A prompt for the answer with a blank, e.g., 'Yes, I ___.' or 'No, they ___ not.' The blank is represented by '___'." },
      correctAnswers: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "An array of possible correct words for the blank (e.g., ['do'] or ['are']). Usually just one word."
      }
    },
    required: ['question', 'question_kr', 'answerPrompt', 'correctAnswers'],
};

const quizItemL3Schema = {
    type: Type.OBJECT,
    properties: {
      question: { type: Type.STRING, description: "An English question that requires a slightly more complex sentence structure to answer." },
      question_kr: { type: Type.STRING, description: "The Korean translation of the question." },
      answerPrompt: { type: Type.STRING, description: "A prompt for the answer with two or three blanks for words and punctuation, e.g., 'Yes___ she ___ a teacher___'. The blanks are represented by '___'." },
      correctAnswers: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "An array of the correct strings for each blank in order (e.g., [',', 'is', '.'])."
      }
    },
    required: ['question', 'question_kr', 'answerPrompt', 'correctAnswers'],
};

const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};


async function generateQuiz<T>(prompt: string, schema: any): Promise<T[] | null> {
  if (!ai) {
    console.error("GoogleGenAI client is not initialized. Please check if your API_KEY is configured correctly.");
    return null;
  }
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: schema,
        },
        temperature: 0.8,
      },
    });

    const jsonString = response.text;
    if (jsonString) {
      const result = JSON.parse(jsonString);
      // Basic validation
      if (Array.isArray(result) && result.length > 0) {
        return result as T[];
      }
    }
    console.error("Failed to parse quiz data from Gemini response:", jsonString);
    return null;

  } catch (error) {
    console.error("Error generating quiz data:", error);
    return null;
  }
}

export const generateQuizData = async (): Promise<QuizItem[] | null> => {
    const prompt = `Generate 5 multiple-choice English grammar questions for a 10-year-old Korean student. Each question must be a simple interrogative sentence in the simple present tense (e.g., "Do you like pizza?", "Is she a student?", "Can he swim?"). Provide 4 full-sentence answer options. The core purpose is to teach the student how to form a correct 'Yes/No' answer that matches the auxiliary verb in the question. For example, if the question is "Do you like music?", the correct answer must be "Yes, I do." or "No, I don't.". The distractors should be grammatically incorrect answer forms for that specific question, such as "Yes, I am." or "No, he can't.". CRITICAL RULE: Pay extremely close attention to subject-verb agreement. For questions starting with "Are you...", the correct answer must use "I am..." or "I am not...". For "Is he...?", the answer must use "he is...". The distractors should also reflect common mistakes with this rule. CRITICAL: Do NOT use past tense (did), future tense (will), or present perfect tense (have/has + participle). Only use simple present tense. Output in JSON format.`;
    const quizItems = await generateQuiz<QuizItem>(prompt, quizItemSchema);
    
    if (quizItems) {
      return quizItems.map(item => ({
        ...item,
        options: shuffleArray(item.options),
      }));
    }
    
    return null;
};

export const generateLevel2QuizData = async (): Promise<QuizItemL2[] | null> => {
    const prompt = `Generate 5 fill-in-the-blank English quiz questions for a 10-year-old Korean student. Each question must be a simple interrogative sentence in the simple present tense using auxiliary verbs like 'do', 'does', 'is', 'are', 'am', 'can'. The goal is to teach the correct auxiliary verb for a 'Yes/No' answer. Ensure a good mix of questions that require positive ('Yes') and negative ('No') answers. The 'answerPrompt' should be a simple response with one blank for the auxiliary verb (e.g., 'Yes, I ___.' for the question 'Do you like apples?'). The 'correctAnswers' array should contain all possible correct words/phrases for the blank. For example, for "cannot", include both ["cannot", "can't"]. For "am not", just include ["am not"]. CRITICAL RULE: The verb in 'correctAnswers' MUST have correct subject-verb agreement with the subject in 'answerPrompt'. For a question like "Are you happy?", the prompt must be for "I", so the answer blank must be "am" or "am not". For prompt "No, I ___.", the correct answer is ["am not"]. It is grammatically INCORRECT for the answer to be "aren't". Pay extremely close attention to this rule. CRITICAL: Do NOT use past tense ('did'), future tense ('will'), or present perfect tense. The answers must be simple. Do not create complex answers. For example, for "Is your favorite color blue?", the correct answer is simply 'is', not 'is blue'. Output in JSON format.`;
    return generateQuiz<QuizItemL2>(prompt, quizItemL2Schema);
};

export const generateLevel3QuizData = async (): Promise<QuizItemL3[] | null> => {
    const prompt = `Generate 5 simple fill-in-the-blank English quiz questions for a 10-year-old Korean student. The questions must be simple present tense interrogatives using auxiliary verbs (do, does, is, are, can). The goal is to test both the correct auxiliary verb and basic punctuation. The 'answerPrompt' should form a very short, simple response with exactly three blanks ('___'). The blanks must be a mix of a missing auxiliary verb and punctuation marks (like a comma ',' and a period '.'). The 'correctAnswers' array must contain the correct strings for each blank in order. The final answer sentence must be a grammatically correct short answer, like "Yes, I do." or "No, he can't.". DO NOT include the main verb or object from the question in the answer prompt. For example, for the question 'Do you like pizza?', a good 'answerPrompt' would be "Yes___ I ___ ___" and 'correctAnswers' would be [',', 'do', '.']. Another example: for 'Is he a doctor?', 'answerPrompt' could be 'No___ he ___ ___' with 'correctAnswers' [',', 'isn\\'t', '.']. If a negative answer to an "Are you...?" question is generated, the prompt must be "No___ I'm ___ ___" with correctAnswers: [",", "not", "."]. The sentence structure must be very simple. CRITICAL RULE: Ensure perfect subject-verb agreement. For "Are you...?" questions, the answer must be structured around "I am/am not". For example, for "Are you a student?", a correct positive prompt could be "Yes___ I ___ ___" with correct answers [",", "am", "."]. An answer of "aren't" for an "I" subject is strictly forbidden. CRITICAL: Only use simple present tense. Output in JSON format.`;
    return generateQuiz<QuizItemL3>(prompt, quizItemL3Schema);
};