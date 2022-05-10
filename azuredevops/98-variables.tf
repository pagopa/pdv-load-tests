variable "aws_region" {
  type        = string
  description = "AWS default region"
  default     = "eu-south-1"
}

variable "project_name" {
  type        = string
  description = "Azure devops project name."
  default     = "pdv-load-tests"
}

variable "git" {
  default = {
    repository = {
      organization    = "pagopa"
      name            = "pdv-load-tests"
      branch_name     = "refs/heads/main"
      pipelines_path  = "pipelines"
      yml_prefix_name = null
    }
    pipeline = {
      enable_code_review = false
      enable_deploy      = false
    }
  }
}