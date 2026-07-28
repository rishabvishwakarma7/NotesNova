import { body, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map((err) => ({ field: err.path, message: err.msg })),
    });
  }
  next();
};

export const validateNoteGeneration = [
  body('topic').trim().notEmpty().withMessage('Topic is required'),
  body('type').optional().isIn(['detailed', 'short', 'bullet', 'exam', 'revision', 'custom', 'flashcards', 'mcq', 'viva', 'definitions', 'pyq']).withMessage('Invalid note type'),
  body('subject').optional().isString(),
  handleValidationErrors,
];

export const validateNoteTransform = [
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('action').isIn(['summarize', 'bullets', 'simplify', 'expand', 'flashcards', 'quiz']).withMessage('Invalid transform action'),
  handleValidationErrors,
];

export const validateQuizGeneration = [
  body('topic').trim().notEmpty().withMessage('Topic is required'),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty level'),
  body('questionCount').optional().isInt({ min: 1, max: 50 }).withMessage('Question count must be between 1 and 50'),
  handleValidationErrors,
];

export const validatePlannerGeneration = [
  body('examDate').notEmpty().isISO8601().withMessage('Valid exam date is required'),
  body('hoursPerDay').optional().isInt({ min: 1, max: 16 }).withMessage('Hours per day must be between 1 and 16'),
  handleValidationErrors,
];

export const validateFeedbackSubmission = [
  body('message').trim().notEmpty().withMessage('Feedback message is required'),
  body('type').optional().isIn(['bug', 'feature', 'general', 'praise']).withMessage('Invalid feedback type'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  handleValidationErrors,
];
