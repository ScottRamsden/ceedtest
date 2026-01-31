variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-west-1"
}

variable "cluster_name" {
  description = "Name of the ECS cluster"
  type        = string
  default     = "shipment-api-cluster"
}

variable "container_image" {
  description = "Docker image for the API"
  type        = string
  default     = "shipment-api:latest"
}
