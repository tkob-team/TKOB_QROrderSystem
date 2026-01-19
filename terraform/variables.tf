variable "aws_region" {
  description = "AWS Region"
  default     = "ap-southeast-1" # Singapore
}

variable "project_name" {
  description = "Tên dự án để đặt prefix cho các resource"
  default     = "tkob-qr-ordering"
}

variable "db_password" {
  description = "Mật khẩu cho RDS Database (Sẽ nhập lúc chạy lệnh apply)"
  type        = string
  sensitive   = true
}

variable "my_ip" {
  description = "IP Public của máy bạn (để chỉ cho phép mình bạn SSH)"
  default     = "0.0.0.0/0" # Tạm thời mở hết, lát tôi chỉ cách lấy IP
}
