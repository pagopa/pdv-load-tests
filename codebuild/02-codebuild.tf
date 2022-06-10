resource "aws_iam_role" "main" {
  name = "codebuild"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "codebuild.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
}


resource "aws_iam_role_policy" "main" {
  role = aws_iam_role.main.name

  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Resource": [
        "*"
      ],
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "ssm:GetParameters"
      ]
    }
  ]
}
POLICY
}


resource "aws_codebuild_project" "main" {
  name          = format("%s-load-tests", local.project)
  description   = "Run k6.io load tests"
  build_timeout = "30"
  service_role  = aws_iam_role.main.arn

  artifacts {
    type = "NO_ARTIFACTS"
  }

  environment {
    compute_type                = "BUILD_GENERAL1_SMALL"
    image                       = "aws/codebuild/standard:5.0"
    type                        = "LINUX_CONTAINER"
    image_pull_credentials_type = "CODEBUILD"
    privileged_mode             = true


    environment_variable {
      name  = "HOST_NAME"
      value = "api.pdv.pagopa.it"
    }

    environment_variable {
      name  = "API_KEY"
      value = "SOME_VALUE2"
      # type  = "PARAMETER_STORE"
    }
  }

  logs_config {
    cloudwatch_logs {
      group_name  = aws_cloudwatch_log_group.main.name
      stream_name = "tests"
    }
  }

  source {
    type            = "GITHUB"
    location        = "https://github.com/pagopa/pdv-load-tests.git"
    git_clone_depth = 1

    git_submodules_config {
      fetch_submodules = false
    }

    buildspec = "codebuild/buildspec.yml"
  }

  source_version = "setup-codebuild"

  tags = {
    Environment = "Test"
  }
}