module "load_test" {
  source = "git::https://github.com/pagopa/azuredevops-tf-modules.git//azuredevops_build_definition_deploy?ref=v2.0.5"

  project_id                   = azuredevops_project.this.id
  repository                   = var.git.repository
  github_service_connection_id = azuredevops_serviceendpoint_github.github_pr.id

  ci_trigger_use_yaml = true


  variables        = {}
  variables_secret = {}

  service_connection_ids_authorization = []
}
