# IAM Role for Step Functions
resource "aws_iam_role" "step_functions_role" {
  name = "fakeout-step-functions-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "states.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_policy" "step_functions_policy" {
  name        = "fakeout-step-functions-policy"
  description = "Policies for Step Function to invoke Lambdas"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "lambda:InvokeFunction"
        ]
        Resource = [
          aws_lambda_function.scraper.arn,
          aws_lambda_function.describe_and_generate.arn
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "step_functions_policy_attach" {
  role       = aws_iam_role.step_functions_role.name
  policy_arn = aws_iam_policy.step_functions_policy.arn
}

# Step Function State Machine
resource "aws_sfn_state_machine" "weekly_game_generation" {
  name     = "fakeout-weekly-generation"
  role_arn = aws_iam_role.step_functions_role.arn

  definition = jsonencode({
    Comment = "Weekly Game Generation Workflow"
    StartAt = "ParallelScrape"
    States = {
      ParallelScrape = {
        Type = "Parallel"
        Branches = [
          {
            StartAt = "ScrapeImages"
            States = {
              ScrapeImages = {
                Type     = "Task"
                Resource = aws_lambda_function.scraper.arn
                Parameters = {
                  mode       = "foto"
                  mediaCount = 5
                  bucketName = "fakeout-videos-dev"
                }
                Retry = [
                  {
                    ErrorEquals     = ["States.TaskFailed"]
                    IntervalSeconds = 15
                    MaxAttempts     = 3
                    BackoffRate     = 1.5
                  }
                ]
                End = true
              }
            }
          },
          {
            StartAt = "ScrapeVideos"
            States = {
              ScrapeVideos = {
                Type     = "Task"
                Resource = aws_lambda_function.scraper.arn
                Parameters = {
                  mode       = "video"
                  mediaCount = 5
                  bucketName = "fakeout-videos-dev"
                }
                Retry = [
                  {
                    ErrorEquals     = ["States.TaskFailed"]
                    IntervalSeconds = 15
                    MaxAttempts     = 3
                    BackoffRate     = 1.5
                  }
                ]
                End = true
              }
            }
          }
        ]
        Next = "GenerateAndDescribeImages"
      }
      GenerateAndDescribeImages = {
        Type     = "Task"
        Resource = aws_lambda_function.describe_and_generate.arn
        Parameters = {
          mode       = "DESCRIBE_AND_GENERATE"
          mediaType  = "image"
          provider   = "google"
          bucketName = "fakeout-videos-dev"
          backfill   = true
        }
        Retry = [
          {
            ErrorEquals     = ["States.TaskFailed"]
            IntervalSeconds = 30
            MaxAttempts     = 2
            BackoffRate     = 2.0
          }
        ]
        Next = "GenerateAndDescribeVideos"
      }
      GenerateAndDescribeVideos = {
        Type     = "Task"
        Resource = aws_lambda_function.describe_and_generate.arn
        Parameters = {
          mode       = "DESCRIBE_AND_GENERATE"
          mediaType  = "video"
          provider   = "google"
          bucketName = "fakeout-videos-dev"
          backfill   = true
        }
        Retry = [
          {
            ErrorEquals     = ["States.TaskFailed"]
            IntervalSeconds = 30
            MaxAttempts     = 2
            BackoffRate     = 2.0
          }
        ]
        End = true
      }
    }
  })
}

# IAM Role for EventBridge Scheduler
resource "aws_iam_role" "scheduler_role" {
  name = "fakeout-scheduler-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "scheduler.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_policy" "scheduler_policy" {
  name        = "fakeout-scheduler-policy"
  description = "Allow Scheduler to start Step Function execution"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "states:StartExecution"
        ]
        Resource = [
          aws_sfn_state_machine.weekly_game_generation.arn
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "scheduler_policy_attach" {
  role       = aws_iam_role.scheduler_role.name
  policy_arn = aws_iam_policy.scheduler_policy.arn
}

# EventBridge Schedule (Every Monday at 9 AM UTC)
resource "aws_scheduler_schedule" "weekly_trigger" {
  name       = "fakeout-weekly-trigger"
  group_name = "default"

  flexible_time_window {
    mode = "OFF"
  }

  schedule_expression = "cron(0 9 ? * MON *)"
  
  target {
    arn      = aws_sfn_state_machine.weekly_game_generation.arn
    role_arn = aws_iam_role.scheduler_role.arn
    
    # Optional: Input payload if needed
    input = jsonencode({
      source = "eventbridge-scheduler"
    })
  }
}
