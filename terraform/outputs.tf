output "server_public_ip" {
  description = "IP Public của EC2 Server"
  value       = aws_instance.web_server.public_ip
}

output "db_endpoint" {
  description = "Endpoint kết nối Database (Host)"
  value       = aws_db_instance.postgres.address
}
