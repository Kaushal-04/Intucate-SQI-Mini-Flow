import type { Attempt, SQIResult, TopicScore, ConceptScore, RankedConcept } from '../types';

// Weight Constants
const IMPORTANCE_WEIGHTS = { 'A': 1.0, 'B': 0.7, 'C': 0.5 };
const DIFFICULTY_WEIGHTS = { 'E': 0.6, 'M': 1.0, 'H': 1.4 };
const TYPE_WEIGHTS = { 'Practical': 1.1, 'Theory': 1.0 };

const calculateAttemptScore = (attempt: Attempt): { weightedScore: number; maxPossibleScore: number } => {
    // 1. Base Score
    let base = attempt.correct ? attempt.marks : -attempt.neg_marks;

    // 2. Weights
    const importanceW = IMPORTANCE_WEIGHTS[attempt.importance] || 1.0;
    const difficultyW = DIFFICULTY_WEIGHTS[attempt.difficulty] || 1.0;
    const typeW = TYPE_WEIGHTS[attempt.type] || 1.0;

    // Max possible weighted score for this question (assuming perfect correctness and no penalties)
    const maxBase = attempt.marks;
    let maxPossible = maxBase * importanceW * difficultyW * typeW;

    let weighted = base * importanceW * difficultyW * typeW;

    // 3. Behavior Adjustments
    const timeRatio = attempt.time_spent_sec / attempt.expected_time_sec;
    if (timeRatio > 2.0) {
        weighted *= 0.8;
    } else if (timeRatio > 1.5) {
        weighted *= 0.9;
    }

    // Marked for review but wrong
    if (attempt.marked_review && !attempt.correct) {
        weighted *= 0.9;
    }

    // Revisits and corrected (Bonus)
    // Assuming this bonus applies if they revisited AND got it correct eventually
    // The schema has 'revisits' and 'correct'.
    // We'll assume revisits > 0 and correct means "Revisited and corrected"
    if (attempt.revisits > 0 && attempt.correct) {
        weighted += (0.2 * attempt.marks);
        // Should we increase maxPossible to account for bonus? 
        // Usually maxPossible is the standard max. 
        // If weighted > maxPossible, clamp handles it or we allow >100% (extra credit).
        // The formula says raw_pct = clamp(..., 0, 100). So >100 is clamped.
    }

    return { weightedScore: weighted, maxPossibleScore: maxPossible };
};

const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

export const calculateSQI = (studentId: string, attempts: Attempt[]): SQIResult => {
    let totalWeighted = 0;
    let totalMax = 0;

    const topicMap = new Map<string, { weighted: number; max: number }>();
    // Key: "Topic|Concept"
    const conceptMap = new Map<string, {
        weighted: number;
        max: number;
        topic: string;
        concept: string;
        attempts: Attempt[];
        wrongCount: number;
        totalCount: number;
    }>();

    attempts.forEach(attempt => {
        const { weightedScore, maxPossibleScore } = calculateAttemptScore(attempt);

        totalWeighted += weightedScore;
        totalMax += maxPossibleScore;

        // Topic Aggregation
        const topicEntry = topicMap.get(attempt.topic) || { weighted: 0, max: 0 };
        topicEntry.weighted += weightedScore;
        topicEntry.max += maxPossibleScore;
        topicMap.set(attempt.topic, topicEntry);

        // Concept Aggregation
        const conceptKey = `${attempt.topic}|${attempt.concept}`;
        const conceptEntry = conceptMap.get(conceptKey) || {
            weighted: 0,
            max: 0,
            topic: attempt.topic,
            concept: attempt.concept,
            attempts: [],
            wrongCount: 0,
            totalCount: 0
        };
        conceptEntry.weighted += weightedScore;
        conceptEntry.max += maxPossibleScore;
        conceptEntry.attempts.push(attempt);
        if (!attempt.correct) conceptEntry.wrongCount++;
        conceptEntry.totalCount++;
        conceptMap.set(conceptKey, conceptEntry);
    });

    // Calculate Final SQI (0-100)
    const overall_sqi = totalMax > 0
        ? clamp((totalWeighted / totalMax) * 100, 0, 100)
        : 0;

    // Format Topic Scores
    const topic_scores: TopicScore[] = Array.from(topicMap.entries()).map(([topic, data]) => ({
        topic,
        sqi: data.max > 0 ? Number(clamp((data.weighted / data.max) * 100, 0, 100).toFixed(1)) : 0
    }));

    // Format Concept Scores & Ranking Logic
    const concept_scores_data = Array.from(conceptMap.values()).map(data => {
        const sqi = data.max > 0 ? clamp((data.weighted / data.max) * 100, 0, 100) : 0;
        return { ...data, sqi };
    });

    const concept_scores: ConceptScore[] = concept_scores_data.map(d => ({
        topic: d.topic,
        concept: d.concept,
        sqi: Number(d.sqi.toFixed(1))
    }));

    // Ranking Logic
    // 40%: wrong at least once (binary 1/0)
    // 25%: importance weight (A=1, B=0.7, C=0.5) - Average importance of questions in concept?
    //      Or max importance? Prompt says "importance weight". Let's use max importance of attempts.
    // 20%: inverse reading/time proxy (fast=1, normal=0.7, slow=0.4)
    // 15%: diagnostic quality (1 -(concept_sqi/100))

    const ranked_concepts_for_summary: RankedConcept[] = concept_scores_data.map(d => {
        // 1. Wrong at least once
        const hasWrong = d.wrongCount > 0 ? 1 : 0;

        // 2. Importance (Max of attempts)
        const maxImportance = d.attempts.reduce((max, a) => {
            const val = IMPORTANCE_WEIGHTS[a.importance];
            return val > max ? val : max;
        }, 0);

        // 3. Time Proxy
        // Avg time ratio
        const avgTimeRatio = d.attempts.reduce((sum, a) => sum + (a.time_spent_sec / a.expected_time_sec), 0) / d.totalCount;
        let timeScore = 0.7; // Normal
        if (avgTimeRatio < 0.8) timeScore = 1.0; // Fast (heuristic)
        else if (avgTimeRatio > 1.2) timeScore = 0.4; // Slow

        // 4. Diagnostic Quality (Low SQI = High Quality/Need for summary)
        const diagnosticQuality = 1 - (d.sqi / 100);

        const weight = (hasWrong * 0.40) + (maxImportance * 0.25) + (timeScore * 0.20) + (diagnosticQuality * 0.15);

        const reasons: string[] = [];
        if (hasWrong) reasons.push("Wrong earlier");
        if (maxImportance === 1.0) reasons.push("High importance (A)");
        if (d.sqi < 60) reasons.push("Low diagnostic score");
        if (timeScore === 0.4) reasons.push("Slow solve time");

        return {
            topic: d.topic,
            concept: d.concept,
            weight: Number(weight.toFixed(2)),
            reasons
        };
    }).sort((a, b) => b.weight - a.weight);

    return {
        student_id: studentId,
        overall_sqi: Number(overall_sqi.toFixed(1)),
        topic_scores,
        concept_scores,
        ranked_concepts_for_summary,
        metadata: {
            diagnostic_prompt_version: "v1",
            computed_at: new Date().toISOString(),
            engine: "sqi-v0.1"
        }
    };
};
