data "aws_secretsmanager_secret" "devops_uat" {
  name = "devops"
}

data "aws_secretsmanager_secret_version" "devops_uat" {
  secret_id = data.aws_secretsmanager_secret.devops_uat.id
}