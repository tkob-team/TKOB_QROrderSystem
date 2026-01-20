# =================================================================
# 1. NETWORKING (VPC, Subnets, Gateway)
# =================================================================

# Tạo VPC (Mạng riêng ảo)
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = { Name = "${var.project_name}-vpc" }
}

# Tạo Internet Gateway (Cổng ra internet cho VPC)
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id
  tags   = { Name = "${var.project_name}-igw" }
}

# Public Subnet (Cho EC2)
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true # Tự động gán IP Public cho EC2

  tags = { Name = "${var.project_name}-public-subnet" }
}

# Private Subnet 1 (Cho RDS - Cần ít nhất 2 AZ cho RDS Group)
resource "aws_subnet" "private_1" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "${var.aws_region}a"

  tags = { Name = "${var.project_name}-private-subnet-1" }
}

# Private Subnet 2 (Cho RDS - Dự phòng)
resource "aws_subnet" "private_2" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.3.0/24"
  availability_zone = "${var.aws_region}b"

  tags = { Name = "${var.project_name}-private-subnet-2" }
}

# Route Table (Bảng chỉ đường: Public Subnet -> Internet Gateway)
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = { Name = "${var.project_name}-public-rt" }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# =================================================================
# 2. SECURITY GROUPS (Firewall)
# =================================================================

# SG cho EC2 (Web Server)
resource "aws_security_group" "web_sg" {
  name        = "${var.project_name}-web-sg"
  description = "Allow HTTP, HTTPS, SSH"
  vpc_id      = aws_vpc.main.id

  # Inbound: Cho phép SSH (22), HTTP (80), HTTPS (443)
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.my_ip] # Chỉ IP của bạn hoặc 0.0.0.0/0
  }
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  # API Server port (NestJS)
  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "API Server"
  }
  # Outbound: Cho phép server gọi ra ngoài thoải mái (để cài soft, gọi API)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# SG cho RDS (Database)
resource "aws_security_group" "db_sg" {
  name        = "${var.project_name}-db-sg"
  description = "Allow Access from Web Server only"
  vpc_id      = aws_vpc.main.id

  # Chỉ cho phép kết nối từ Web Server (EC2)
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.web_sg.id] # Magic here!
  }
}

# =================================================================
# 3. DATABASE (RDS PostgreSQL)
# =================================================================

# Subnet Group cho RDS (Gom 2 private subnet lại)
resource "aws_db_subnet_group" "default" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = [aws_subnet.private_1.id, aws_subnet.private_2.id]
}

resource "aws_db_instance" "postgres" {
  identifier           = "${var.project_name}-db"
  allocated_storage    = 20    # 20GB (Free tier eligible)
  engine               = "postgres"
  engine_version       = "14"
  instance_class       = "db.t3.micro" # Rẻ nhất
  db_name              = "qr_ordering"
  username             = "postgres"
  password             = var.db_password
  parameter_group_name = "default.postgres14"
  skip_final_snapshot  = true  # Quan trọng: Xóa là xóa luôn, không backup (để destroy cho lẹ)
  publicly_accessible  = false # Bảo mật: Không cho truy cập từ internet

  vpc_security_group_ids = [aws_security_group.db_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.default.name
}

# =================================================================
# 4. COMPUTE (EC2 Instance)
# =================================================================

# Upload SSH Key Public lên AWS
resource "aws_key_pair" "deployer" {
  key_name   = "${var.project_name}-deploy-key"
  public_key = file("${path.module}/../deploy_key.pub") # Trỏ tới file bạn tạo ở Bước 0
}

# Tạo EC2 Instance
resource "aws_instance" "web_server" {
  ami           = "ami-060e277c0d4cce553" # Ubuntu 22.04 LTS (Region Singapore)
  instance_type = "t3.small"              # Đủ RAM chạy NestJS + Redis

  subnet_id                   = aws_subnet.public.id
  vpc_security_group_ids      = [aws_security_group.web_sg.id]
  key_name                    = aws_key_pair.deployer.key_name
  associate_public_ip_address = true

  # User Data: Script chạy tự động ngay khi máy khởi động lần đầu
  # Giúp cài sẵn Docker, Docker Compose
  user_data = <<-EOF
              #!/bin/bash
              apt-get update
              apt-get install -y ca-certificates curl gnupg lsb-release
              install -m 0755 -d /etc/apt/keyrings
              curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
              chmod a+r /etc/apt/keyrings/docker.gpg
              echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
              apt-get update
              apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
              usermod -aG docker ubuntu
              EOF

  tags = { Name = "${var.project_name}-server" }
}
