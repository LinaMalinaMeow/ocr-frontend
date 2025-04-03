type TScores = Record<string, string[]>

export interface IRecognizeResponse {
    "subject": string,
    "grade": string,
    "variant": string,
    "participant_code": string,
    "total_score": number,
    "scores": TScores,
    "errors": string[],
    "warnings": string[]
}