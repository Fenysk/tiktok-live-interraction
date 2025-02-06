import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Mistral } from '@mistralai/mistralai';
import { ReaskBodyRequest } from './dto/reask-body.request';
import { Question } from '@prisma/client';
import { JsonService } from 'src/common/utils/json.service';

@Injectable()
export class AnalyseService implements OnModuleInit {
    private client: Mistral;

    constructor(
        private readonly configService: ConfigService,
        private readonly jsonService: JsonService
    ) { }

    onModuleInit() {
        const apiKey = this.configService.get<string>('MISTRAL_API_KEY');
        this.client = new Mistral({ apiKey });
    }

    async reaskQuestion(reaskBody: ReaskBodyRequest): Promise<Question> {
        const { question, prompt, shouldReaskQuestion, shouldReaskAnswers, shouldReaskExplanation, shouldReaskFieldsToComplete } = reaskBody;

        let newPrompt: string = `
Voici un json d'une question :
\`\`\`json
${JSON.stringify(question)}
\`\`\`

## Instructions :
${shouldReaskQuestion ? '- Reformule la question de sorte à ce qu\'elle soit courte.' : ''}${shouldReaskAnswers ? '\n- Reformule les réponses de sorte à ce qu\'elles soient courtes.' : ''}${shouldReaskExplanation ? '\n- Ajoute une explicationo de la réponse en deux phrases maximum.' : ''}${shouldReaskFieldsToComplete ? '\n- Ajoute/modifie les mots à compléter depuis les variables %word% dans \`fieldsToComplete\`.' : ''}${prompt ? '\n' + prompt : ''}

Modifie seulement ce qui est demandé dans les instructions. Il faut que les champs soient adaptés pour un quiz.
Renvois bien seulement ta réponse dans le même format dans un codeblock en JSON dans ce format :
\`\`\`json
{
    id: string;
    questionText: string;
    fieldsToComplete: string[];
    correctOptions: string[];
    wrongOptions: string[];
    mediasPath: string[];
    explanation: string | null;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    createdAt: Date;
}
\`\`\`
`;

        const response = await this.chatWithAi(newPrompt);

        if (this.jsonService.hasValidJSON(response)) {
            const extractJson = this.jsonService.extract(response);
            const question: Question = extractJson as Question;
            console.log(extractJson);
            return question;
        } else {
            console.error('Invalid JSON response from AI');
        }

    }

    async chatWithAi(message: string): Promise<string> {
        const chatResponse = await this.client.chat.complete({
            model: 'mistral-large-latest',
            messages: [{ role: 'user', content: message }],
        });

        const content = chatResponse.choices[0].message.content;
        return Array.isArray(content) ? content.join('') : content;
    }

}
