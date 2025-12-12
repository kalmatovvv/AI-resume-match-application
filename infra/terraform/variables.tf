variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Base name for resources"
  type        = string
  default     = "ai-resume-match"
}

variable "backend_image" {
  description = "Container image for backend (e.g. 123456789012.dkr.ecr.us-east-1.amazonaws.com/ai-resume-match-backend:latest)"
  type        = string
}

variable "backend_api_port" {
  description = "Port the backend container listens on"
  type        = number
  default     = 3000
}

variable "aws_access_key_id" {
  description = "AWS access key for Bedrock (if needed by backend)"
  type        = string
  sensitive   = true
}

variable "aws_secret_access_key" {
  description = "AWS secret key for Bedrock (if needed by backend)"
  type        = string
  sensitive   = true
}

variable "cognito_user_pool_domain" {
  description = "Optional domain name for Cognito (if you later want hosted UI)"
  type        = string
  default     = null
}

variable "domain_name" {
  description = "Optional root domain (e.g. example.com) for DNS"
  type        = string
  default     = null
}







