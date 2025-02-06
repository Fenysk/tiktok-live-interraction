import { Injectable } from '@nestjs/common';

@Injectable()
export class JsonService {
    /**
     * Extrait le JSON d'une chaîne de caractères
     * @param content Le contenu à parser
     * @returns Le contenu parsé en JSON
     * @throws Error si le JSON est invalide
     */
    public extract<T>(content: string): T {
        try {

            const startIndex = content.indexOf('{');
            if (startIndex === -1) {
                throw new Error('Aucun objet JSON trouvé dans la chaîne');
            }


            const endIndex = content.lastIndexOf('}');
            if (endIndex === -1) {
                throw new Error('JSON mal formé: aucune accolade fermante trouvée');
            }


            const jsonString = content.substring(startIndex, endIndex + 1);


            const result = JSON.parse(jsonString) as T;


            if (typeof result !== 'object' || result === null) {
                throw new Error('Le contenu parsé n\'est pas un objet JSON valide');
            }

            return result;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Erreur lors de l'extraction du JSON: ${error.message}`);
            }
            throw error;
        }
    }

    /**
     * Vérifie si une chaîne contient un JSON valide
     * @param content Le contenu à vérifier
     * @returns boolean
     */
    public hasValidJSON(content: string): boolean {
        try {
            this.extract(content);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Extrait plusieurs objets JSON d'une chaîne
     * @param content Le contenu à parser
     * @returns Un tableau d'objets JSON
     */
    public extractMultiple<T>(content: string): T[] {
        const results: T[] = [];
        let currentContent = content;

        while (currentContent.includes('{')) {
            try {
                const result = this.extract<T>(currentContent);
                results.push(result);


                const endIndex = currentContent.indexOf('}') + 1;
                currentContent = currentContent.substring(endIndex);
            } catch {
                break;
            }
        }

        return results;
    }
}