const Joi = require('joi');
require('dotenv').config();

const schema = Joi.object({
  MONGODB_URI: Joi.string().uri().required(),
  JWT_SECRET: Joi.string().min(8).required(),
  PORT: Joi.number().default(5000)
}).unknown();

const { error, value: env } = schema.validate(process.env);
if (error) {
  console.error('Environment validation error:', error.message);
  process.exit(1);
}

module.exports = {
  mongodbUri: env.MONGODB_URI,
  jwtSecret: env.JWT_SECRET,
  port: env.PORT
};
