locals {
  database_url = "postgres://postgres:potgres123!@ls-8788ed0f1d26274e6ca65981fab3dc40b86aad05.cu54g4ogoqcd.us-east-1.rds.amazonaws.com:5432/ai-resume-match-db"
}

resource "aws_lightsail_container_service" "backend" {
  name        = "${var.project_name}-backend"
  power       = "nano"
  scale       = 1
  is_disabled = false
}

resource "aws_lightsail_container_service_deployment_version" "backend" {
  service_name = aws_lightsail_container_service.backend.name

  container {
    container_name = "backend"
    image          = var.backend_image

    environment = {
      DATABASE_URL          = local.database_url
      AWS_REGION            = var.aws_region
      AWS_ACCESS_KEY_ID     = var.aws_access_key_id
      AWS_SECRET_ACCESS_KEY = var.aws_secret_access_key
    }

    ports = {
      "3000" = "HTTP"
    }
  }

  public_endpoint {
    container_name = "backend"
    container_port = var.backend_api_port

    health_check {
      healthy_threshold   = 2
      unhealthy_threshold = 2
      interval_seconds    = 15
      timeout_seconds     = 5
      path                = "/health"
    }
  }
}

output "lightsail_backend_url" {
  value       = aws_lightsail_container_service.backend.url
  description = "Public URL of the Lightsail backend service"
}






