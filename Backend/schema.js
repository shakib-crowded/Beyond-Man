const Joi = require("joi");

const validateBlogSchema = Joi.object({
  path: Joi.string().required(),
  title: Joi.string().required(),
  description: Joi.string().required(),
  content: Joi.string().required(),
  author: Joi.string().allow("").optional(),
  tags: Joi.string().allow("").optional(),
}).required();

const validateAdminSignUp = Joi.object({
  name: Joi.string().min(3).max(30).required().messages({
    "string.base": "Name must be a string.",
    "string.empty": "Name is required.",
    "string.min": "Name must be at least 3 characters long.",
    "string.max": "Name must not exceed 30 characters.",
  }),
  username: Joi.string()
    .regex(/^[a-z0-9._@-]+$/) // Allow lowercase letters, numbers, and specific symbols
    .min(3) // Minimum length of 3 characters
    .max(30) // Maximum length of 30 characters
    .required()
    .messages({
      "string.base": "Username must be a string.",
      "string.empty": "Username is required.",
      "string.min": "Username must be at least 3 characters long.",
      "string.max": "Username must not exceed 30 characters.",
      "string.pattern.base":
        "Username can only contain lowercase letters, numbers, and the symbols '.', '_', '-', and '@'.",
    }),
  email: Joi.string().email().required().messages({
    "string.base": "Email must be a string.",
    "string.email": "Please enter a valid email address.",
    "string.empty": "Email is required.",
  }),
  password: Joi.string()
    .min(8)
    .max(50)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_\-+=<>?]).+$/) // At least one uppercase, one lowercase, one special character
    .required()
    .messages({
      "string.base": "Password must be a string.",
      "string.empty": "Password is required.",
      "string.min": "Password must be at least 8 characters long.",
      "string.max": "Password must not exceed 50 characters.",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, and one special character.",
    }),
  about_admin: Joi.string().min(30).max(500).message({
    "string.base": "About You must be a string.",
    "string.min": "About You must be at least 30 characters long.",
    "string.max": "About You must not exceed 100 characters.",
  }),
});

const validateAdminLogin = Joi.object({
  username: Joi.string()
    .regex(/^[a-z0-9._@-]+$/) // Allow '@' along with other permitted characters
    .min(3) // Minimum length of 3 characters
    .max(30) // Maximum length of 30 characters
    .required()
    .messages({
      "string.base": "Username must be a string.",
      "string.empty": "Username is required.",
      "string.min": "Username must be at least 3 characters long.",
      "string.max": "Username must not exceed 30 characters.",
      "string.pattern.base":
        "Username can only contain lowercase letters, numbers, and the symbols '.', '_', '-', and '@'.",
    }),
  password: Joi.string()
    .min(8) // Minimum length of 8 characters
    .max(50) // Maximum length of 50 characters
    .regex(/^(?=.*[a-z])(?=.*[A-Z]).+$/) // At least one uppercase, one lowercase, one special character
    .required()
    .messages({
      "string.base": "Password must be a string.",
      "string.empty": "Password is required.",
      "string.min": "Password must be at least 8 characters long.",
      "string.max": "Password must not exceed 50 characters.",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, and one special character.",
    }),
});

const validateUserSignUp = Joi.object({
  name: Joi.string().min(3).max(40).message({
    "string.base": "Name must be a string.",
    "string.empty": "Name is required.",
    "string.min": "Name must be at least 3 characters long.",
    "string.max": "Name must not exceed 30 characters.",
  }),
  username: Joi.string()
    .regex(/^[a-z0-9._@-]+$/) // Allow lowercase letters, numbers, and specific symbols
    .min(3) // Minimum length of 3 characters
    .max(40) // Maximum length of 30 characters
    .required()
    .messages({
      "string.base": "Username must be a string.",
      "string.empty": "Username is required.",
      "string.min": "Username must be at least 3 characters long.",
      "string.max": "Username must not exceed 30 characters.",
      "string.pattern.base":
        "Username can only contain lowercase letters, numbers, and the symbols '.', '_', '-', and '@'.",
    }),
  email: Joi.string().email().required().messages({
    "string.base": "Email must be a string.",
    "string.email": "Please enter a valid email address.",
    "string.empty": "Email is required.",
  }),
  password: Joi.string()
    .min(8)
    .max(50)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_\-+=<>?]).+$/) // At least one uppercase, one lowercase, one special character
    .required()
    .messages({
      "string.base": "Password must be a string.",
      "string.empty": "Password is required.",
      "string.min": "Password must be at least 8 characters long.",
      "string.max": "Password must not exceed 50 characters.",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, and one special character.",
    }),
  terms: Joi.boolean().valid(true).required().messages({
    "boolean.base": "You must accept the terms and conditions.",
    "any.only": "You must accept the terms and conditions.",
    "any.required": "You must accept the terms and conditions.",
  }),
});

const validateUserLogin = Joi.object({
  username: Joi.string()
    .regex(/^[a-z0-9._@-]+$/) // Allow '@' along with other permitted characters
    .min(3) // Minimum length of 3 characters
    .max(40) // Maximum length of 30 characters
    .required()
    .messages({
      "string.base": "Username must be a string.",
      "string.empty": "Username is required.",
      "string.min": "Username must be at least 3 characters long.",
      "string.max": "Username must not exceed 30 characters.",
      "string.pattern.base":
        "Username can only contain lowercase letters, numbers, and the symbols '.', '_', '-', and '@'.",
    }),
  password: Joi.string()
    .min(8) // Minimum length of 8 characters
    .max(50) // Maximum length of 50 characters
    .regex(/^(?=.*[a-z])(?=.*[A-Z]).+$/) // At least one uppercase, one lowercase, one special character
    .required()
    .messages({
      "string.base": "Password must be a string.",
      "string.empty": "Password is required.",
      "string.min": "Password must be at least 8 characters long.",
      "string.max": "Password must not exceed 50 characters.",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, and one special character.",
    }),
});

const validateUserQuery = Joi.object({
  subject: Joi.string().required().messages({
    "string.base": "Subject must be a string.",
    "string.empty": "Please enter a subject.",
  }),
  message: Joi.string().required().messages({
    "string.base": "Message must be a string.",
    "string.empty": "Please enter a message.",
  }),
});

module.exports = {
  validateBlogSchema,
  validateAdminLogin,
  validateAdminSignUp,
  validateUserLogin,
  validateUserSignUp,
  validateUserQuery,
};
