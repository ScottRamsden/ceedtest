terraform {
  required_version = ">= 1.0.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

module "vpc" {
  source = "./modules/vpc"
  
  cluster_name = var.cluster_name
}

module "redis" {
  source = "./modules/redis"

  vpc_id             = module.vpc.vpc_id
  private_subnets    = module.vpc.private_subnets
  security_group_ids = [module.vpc.redis_sg_id]
}

module "ecs" {
  source = "./modules/ecs"

  cluster_name       = var.cluster_name
  vpc_id             = module.vpc.vpc_id
  public_subnets     = module.vpc.public_subnets
  private_subnets    = module.vpc.private_subnets
  api_sg_id          = module.vpc.api_sg_id
  redis_url          = "redis://${module.redis.endpoint}:6379"
  container_image    = var.container_image
}
