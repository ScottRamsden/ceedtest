resource "aws_elasticache_subnet_group" "main" {
  name       = "redis-subnet-group"
  subnet_ids = var.private_subnets
}

resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "shipment-redis"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.main.name
  security_group_ids   = var.security_group_ids
}

variable "vpc_id" {}
variable "private_subnets" { type = list(string) }
variable "security_group_ids" { type = list(string) }

output "endpoint" {
  value = aws_elasticache_cluster.redis.cache_nodes[0].address
}
