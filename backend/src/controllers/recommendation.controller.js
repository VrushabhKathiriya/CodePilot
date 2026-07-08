import {
    getPersonalizedRecommendations,
    getTopicRecommendations,
    getDailyRecommendations,
} from "../services/recommendation.service.js";

export const getRecommendations = async (req, res, next) => {
    try {
        const data = await getPersonalizedRecommendations(req.user.id);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export const getTopicReco = async (req, res, next) => {
    try {
        const data = await getTopicRecommendations(req.user.id);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export const getDailyReco = async (req, res, next) => {
    try {
        const data = await getDailyRecommendations(req.user.id);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};
