resource "aws_lightsail_database" "db" {
  relational_database_name = "${var.project_name}-db"
  master_database_name     = "resume_match"
  master_username          = "postgres"
  master_password          = "postgres123!" # you can change it

  availability_zone = "${var.aws_region}a"
  blueprint_id      = "postgres_16"
  bundle_id         = "micro_2_0"
}
