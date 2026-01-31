output "alb_dns_name" {
  description = "DNS name of the load balancer"
  value       = module.ecs.alb_dns_name
}

output "redis_endpoint" {
  description = "Endpoint of the Redis instance"
  value       = module.redis.endpoint
}
