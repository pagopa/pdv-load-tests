locals {
  codebuild_role_name = "codebuild"
}

## Note
## This  trusted relationship is a bit tricky since it refers itself.
## It's going to fail the first time: just get rid of the AWS part in the Principal block and add it again
## in a second shoot.
resource "aws_iam_role" "main" {
  name = local.codebuild_role_name

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "codebuild.amazonaws.com",
        "AWS": [
					"arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${local.codebuild_role_name}"
				]
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
        "ssm:GetParameters",
        "cloudwatch:PutMetricData"
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
      value = "/CodeBuild/hostname"
      type  = "PARAMETER_STORE"
    }
    environment_variable {
      name  = "API_KEY"
      value = "/CodeBuild/apikey"
      type  = "PARAMETER_STORE"
    }

    environment_variable {
      name  = "TEST_SCRIPT"
      value = "/CodeBuild/testscript"
      type  = "PARAMETER_STORE"
    }

    environment_variable {
      name  = "TEST_DURATION"
      value = "/CodeBuild/testduration"
      type  = "PARAMETER_STORE"
    }
    environment_variable {
      name  = "TEST_RATE"
      value = "/CodeBuild/testrate"
      type  = "PARAMETER_STORE"
    }
    environment_variable {
      name  = "TEST_PRE_ALLOCATED_VU"
      value = "/CodeBuild/testpreallocatedvu"
      type  = "PARAMETER_STORE"
    }
    environment_variable {
      name  = "TEST_MAX_ALLOWED_VU"
      value = "/CodeBuild/testmaxallowedvu"
      type  = "PARAMETER_STORE"
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

    buildspec = templatefile(
      "buildspec.yml",
      {
        account_id = data.aws_caller_identity.current.account_id
      }
    )
  }

  source_version = "main"

}