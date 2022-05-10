# Github service connection (pull request)
resource "azuredevops_serviceendpoint_github" "github_pr" {

  project_id            = azuredevops_project.this.id
  service_endpoint_name = "github-pr"
  auth_personal {
    personal_access_token = jsondecode(data.aws_secretsmanager_secret_version.devops_uat.secret_string)["github_pr_token"]
  }
  lifecycle {
    ignore_changes = [description, authorization]
  }
}

