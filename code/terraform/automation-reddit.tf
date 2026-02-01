# Daily Reddit Game Generation State Machine
resource "aws_sfn_state_machine" "daily_reddit_generation" {
  name     = "fakeout-reddit-daily-generation"
  role_arn = aws_iam_role.step_functions_role.arn

  definition = jsonencode({
    Comment = "Daily Reddit Game Generation Workflow - Images Only"
    StartAt = "ScrapeImages"
    States = {
      ScrapeImages = {
        Type     = "Task"
        Resource = aws_lambda_function.scraper.arn
        Parameters = {
          mode             = "foto"
          mediaCount       = 5
          storage_provider = "supabase"
          bucketName       = "fakeout-reddit"
          "executionInput.$" = "$"
        }
        Retry = [
          {
            ErrorEquals     = ["States.TaskFailed"]
            IntervalSeconds = 15
            MaxAttempts     = 3
            BackoffRate     = 1.5
          }
        ]
        Next = "GenerateAndDescribeImages"
      }

      GenerateAndDescribeImages = {
        Type     = "Task"
        Resource = aws_lambda_function.describe_and_generate.arn
        Parameters = {
          mode             = "DESCRIBE_AND_GENERATE"
          mediaType        = "image"
          provider         = "google"
          storage_provider = "supabase"
          bucketName       = "fakeout-reddit"
          backfill         = true
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

# Update the scheduler policy to include Reddit state machine
resource "aws_iam_role_policy" "scheduler_policy_reddit" {
  name = "fakeout-scheduler-policy-reddit"
  role = aws_iam_role.scheduler_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "states:StartExecution"
        ]
        Resource = [
          aws_sfn_state_machine.weekly_game_generation.arn,
          aws_sfn_state_machine.daily_reddit_generation.arn
        ]
      }
    ]
  })
}

# EventBridge Scheduler for Daily Reddit Trigger (12 PM UTC)
resource "aws_scheduler_schedule" "daily_reddit_generation" {
  name       = "fakeout-reddit-daily-trigger"
  group_name = "default"

  flexible_time_window {
    mode = "OFF"
  }

  # Daily at 12 PM UTC
  schedule_expression = "cron(0 12 * * ? *)"

  target {
    arn      = aws_sfn_state_machine.daily_reddit_generation.arn
    role_arn = aws_iam_role.scheduler_role.arn

    # Empty input - scraper will fetch prompt from Supabase prompts table
    input = jsonencode({})
  }
}
