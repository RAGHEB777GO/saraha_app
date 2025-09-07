import Joi from "joi";

export const signupSchema = Joi.object({
  userName: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().optional(),
  role: Joi.string().valid("user", "admin").optional() 
});
